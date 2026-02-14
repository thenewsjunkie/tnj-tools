import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface TimerSettings {
  target_datetime: string | null;
  stream_url: string;
  button_label: string;
  logo_url: string | null;
  theme: string;
  is_recurring: boolean;
  day_of_week: number;
  time_of_day: string;
  timezone: string;
  button_duration_minutes: number;
}

const SYSTEM_FONT = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

/**
 * For recurring mode: compute the next occurrence of the given day/time.
 * day_of_week: 0=Sun..6=Sat, time_of_day: "HH:MM", timezone: IANA string
 */
function getNextOccurrence(dayOfWeek: number, timeOfDay: string, timezone: string): Date {
  const [hours, minutes] = timeOfDay.split(":").map(Number);
  const now = new Date();

  // Build a date string in the target timezone for "today"
  // We'll iterate up to 7 days to find the next matching day
  for (let offset = 0; offset <= 7; offset++) {
    const candidate = new Date(now.getTime() + offset * 86400000);
    // Format candidate date in target timezone
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      weekday: "short",
    }).formatToParts(candidate);

    const yearStr = parts.find((p) => p.type === "year")?.value || "";
    const monthStr = parts.find((p) => p.type === "month")?.value || "";
    const dayStr = parts.find((p) => p.type === "day")?.value || "";

    // Get day of week in target timezone
    const tzDate = new Date(`${yearStr}-${monthStr}-${dayStr}T${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00`);
    
    // Use Intl to get the actual weekday in the target timezone
    const weekdayInTz = new Date(
      candidate.toLocaleString("en-US", { timeZone: timezone })
    ).getDay();

    if (weekdayInTz === dayOfWeek) {
      // Build the target time in the specified timezone
      // We need to create a Date that represents this specific time in the given timezone
      const dateString = `${yearStr}-${monthStr}-${dayStr}T${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00`;
      
      // Convert from target timezone to UTC by using the timezone offset
      const targetInTz = new Date(
        new Date(dateString).toLocaleString("en-US", { timeZone: "UTC" })
      );
      
      // Get the offset by comparing
      const inTz = new Date(new Date(dateString).toLocaleString("en-US", { timeZone: timezone }));
      const inUtc = new Date(new Date(dateString).toLocaleString("en-US", { timeZone: "UTC" }));
      const offsetMs = inUtc.getTime() - inTz.getTime();
      
      const result = new Date(new Date(dateString).getTime() + offsetMs);
      
      if (result.getTime() > now.getTime()) {
        return result;
      }
    }
  }
  // Fallback: shouldn't happen
  return new Date(now.getTime() + 7 * 86400000);
}

/**
 * For recurring mode: get the most recent past occurrence to check if button should still show.
 */
function getLastOccurrence(dayOfWeek: number, timeOfDay: string, timezone: string): Date {
  const next = getNextOccurrence(dayOfWeek, timeOfDay, timezone);
  return new Date(next.getTime() - 7 * 86400000);
}

const Timer = () => {
  const [searchParams] = useSearchParams();
  const themeParam = searchParams.get("theme");

  const [settings, setSettings] = useState<TimerSettings | null>(null);
  const [now, setNow] = useState(() => new Date());
  const [loaded, setLoaded] = useState(false);

  // Determine text color from theme
  const isDark = themeParam === "light" ? false : true;
  const textColor = isDark ? "#ffffff" : "#1a1a1a";
  const mutedColor = isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.45)";
  const blockBg = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)";
  const blockBorder = isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.12)";

  // Fetch settings
  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase
        .from("timer_settings")
        .select("*")
        .limit(1)
        .maybeSingle();
      if (data) {
        setSettings(data as unknown as TimerSettings);
      }
      setLoaded(true);
    };
    fetchSettings();

    const channel = supabase
      .channel("timer_settings_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "timer_settings" },
        (payload) => {
          if (payload.new) {
            setSettings(payload.new as unknown as TimerSettings);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Tick every second
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // Compute countdown with recurring support
  const { countdown, showButton } = useMemo(() => {
    if (!settings) return { countdown: null, showButton: false };

    let targetTime: number;

    if (settings.is_recurring) {
      // Recurring weekly mode
      const lastOccurrence = getLastOccurrence(settings.day_of_week, settings.time_of_day, settings.timezone);
      const minutesSinceLast = (now.getTime() - lastOccurrence.getTime()) / 60000;

      if (minutesSinceLast >= 0 && minutesSinceLast < settings.button_duration_minutes) {
        // Within button display window
        return { countdown: { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true }, showButton: true };
      }

      // Count down to next occurrence
      const nextOccurrence = getNextOccurrence(settings.day_of_week, settings.time_of_day, settings.timezone);
      targetTime = nextOccurrence.getTime();
    } else {
      // One-time mode
      if (!settings.target_datetime) return { countdown: null, showButton: false };
      targetTime = new Date(settings.target_datetime).getTime();
    }

    const diff = targetTime - now.getTime();
    if (diff <= 0) {
      // For one-time mode, check button duration
      if (!settings.is_recurring) {
        const minutesSinceExpiry = (now.getTime() - targetTime) / 60000;
        if (minutesSinceExpiry < settings.button_duration_minutes) {
          return { countdown: { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true }, showButton: true };
        }
        // Button duration passed for one-time — just show expired
        return { countdown: { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true }, showButton: true };
      }
      return { countdown: { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true }, showButton: true };
    }

    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return { countdown: { days, hours, minutes, seconds, expired: false }, showButton: false };
  }, [settings, now]);

  // Format local time
  const localTime = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const tzAbbr = Intl.DateTimeFormat(undefined, { timeZoneName: "short" })
    .formatToParts(now)
    .find((p) => p.type === "timeZoneName")?.value || "";

  // Make body transparent
  useEffect(() => {
    document.documentElement.style.backgroundColor = "transparent";
    document.body.style.backgroundColor = "transparent";
    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";
    const root = document.getElementById("root");
    if (root) root.style.backgroundColor = "transparent";
  }, []);

  if (!loaded) return null;

  const pad = (n: number) => String(n).padStart(2, "0");

  const blockStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: blockBg,
    border: `1px solid ${blockBorder}`,
    borderRadius: "8px",
    padding: "clamp(6px, 2vw, 16px) clamp(8px, 3vw, 24px)",
    minWidth: "clamp(48px, 12vw, 100px)",
  };

  const numberStyle: React.CSSProperties = {
    fontSize: "clamp(24px, 8vw, 56px)",
    fontWeight: 700,
    lineHeight: 1.1,
    color: textColor,
    fontFamily: SYSTEM_FONT,
    fontVariantNumeric: "tabular-nums",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: "clamp(8px, 2vw, 12px)",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: mutedColor,
    fontFamily: SYSTEM_FONT,
    marginTop: "2px",
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        fontFamily: SYSTEM_FONT,
        padding: "clamp(8px, 2vw, 16px)",
        boxSizing: "border-box",
      }}
    >
      {/* Logo */}
      {settings?.logo_url && (
        <img
          src={settings.logo_url}
          alt="Logo"
          style={{
            maxHeight: "clamp(28px, 6vw, 48px)",
            maxWidth: "80%",
            objectFit: "contain",
            marginBottom: "clamp(6px, 1.5vw, 12px)",
          }}
        />
      )}

      {/* Countdown or Watch Now */}
      {countdown?.expired && showButton ? (
        <a
          href={settings?.stream_url || "#"}
          style={{
            display: "inline-block",
            padding: "clamp(10px, 2vw, 16px) clamp(24px, 5vw, 48px)",
            background: isDark
              ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
              : "linear-gradient(135deg, #4f46e5, #7c3aed)",
            color: "#ffffff",
            fontSize: "clamp(14px, 3vw, 20px)",
            fontWeight: 600,
            fontFamily: SYSTEM_FONT,
            borderRadius: "8px",
            textDecoration: "none",
            cursor: "pointer",
            boxShadow: "0 4px 14px rgba(99,102,241,0.4)",
            transition: "transform 0.15s, box-shadow 0.15s",
          }}
        >
          {settings?.button_label || "Watch Now"}
        </a>
      ) : countdown ? (
        <div style={{ display: "flex", gap: "clamp(4px, 1.5vw, 12px)" }}>
          {[
            { value: countdown.days, label: "Days" },
            { value: countdown.hours, label: "Hours" },
            { value: countdown.minutes, label: "Minutes" },
            { value: countdown.seconds, label: "Seconds" },
          ].map((block) => (
            <div key={block.label} style={blockStyle}>
              <span style={numberStyle}>{pad(block.value)}</span>
              <span style={labelStyle}>{block.label}</span>
            </div>
          ))}
        </div>
      ) : (
        <p style={{ color: mutedColor, fontFamily: SYSTEM_FONT, fontSize: 14 }}>
          No countdown configured
        </p>
      )}

      {/* Current time */}
      <div
        style={{
          marginTop: "clamp(6px, 1.5vw, 12px)",
          fontSize: "clamp(9px, 2vw, 12px)",
          color: mutedColor,
          fontFamily: SYSTEM_FONT,
        }}
      >
        {localTime} {tzAbbr}
      </div>
    </div>
  );
};

export default Timer;
