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

  for (let offset = 0; offset <= 7; offset++) {
    const candidate = new Date(now.getTime() + offset * 86400000);
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(candidate);

    const yearStr = parts.find((p) => p.type === "year")?.value || "";
    const monthStr = parts.find((p) => p.type === "month")?.value || "";
    const dayStr = parts.find((p) => p.type === "day")?.value || "";

    const weekdayInTz = new Date(
      candidate.toLocaleString("en-US", { timeZone: timezone })
    ).getDay();

    if (weekdayInTz === dayOfWeek) {
      // Create a UTC anchor at the desired wall-clock time
      const utcGuess = new Date(
        Date.UTC(
          parseInt(yearStr),
          parseInt(monthStr) - 1,
          parseInt(dayStr),
          hours,
          minutes,
          0
        )
      );

      // Find what wall-clock time utcGuess shows in the target timezone
      const wallParts = new Intl.DateTimeFormat("en-US", {
        timeZone: timezone,
        hour: "numeric",
        minute: "numeric",
        hour12: false,
      }).formatToParts(utcGuess);

      const wallHour = parseInt(wallParts.find(p => p.type === "hour")?.value || "0");
      const wallMin = parseInt(wallParts.find(p => p.type === "minute")?.value || "0");

      // Shift UTC so the wall-clock in the target timezone matches the desired time
      const diffMinutes = (wallHour * 60 + wallMin) - (hours * 60 + minutes);
      const result = new Date(utcGuess.getTime() - diffMinutes * 60000);

      if (result.getTime() > now.getTime()) {
        return result;
      }
    }
  }
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
      return { countdown: { hours: 0, minutes: 0, seconds: 0, expired: true }, showButton: true };
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
          return { countdown: { hours: 0, minutes: 0, seconds: 0, expired: true }, showButton: true };
        }
        return { countdown: { hours: 0, minutes: 0, seconds: 0, expired: true }, showButton: true };
      }
      return { countdown: { hours: 0, minutes: 0, seconds: 0, expired: true }, showButton: true };
    }

    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return { countdown: { hours, minutes, seconds, expired: false }, showButton: false };
  }, [settings, now]);


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
    borderRadius: "6px",
    padding: "clamp(4px, 1.5vw, 10px) clamp(6px, 2vw, 16px)",
    minWidth: "clamp(36px, 10vw, 72px)",
  };

  const numberStyle: React.CSSProperties = {
    fontSize: "clamp(18px, 5vw, 36px)",
    fontWeight: 700,
    lineHeight: 1.1,
    color: textColor,
    fontFamily: SYSTEM_FONT,
    fontVariantNumeric: "tabular-nums",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: "clamp(7px, 1.5vw, 10px)",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: mutedColor,
    fontFamily: SYSTEM_FONT,
    marginTop: "1px",
  };

  return (
    <>
      <style>{`
        @keyframes watchNowReveal {
          0% { opacity: 0; transform: scale(0.85); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        fontFamily: SYSTEM_FONT,
        padding: "clamp(4px, 1vw, 8px)",
        boxSizing: "border-box",
        gap: "clamp(6px, 2vw, 16px)",
      }}
    >
      {/* Logo */}
      {settings?.logo_url && (
        <img
          src={settings.logo_url}
          alt="Logo"
          style={{
            maxHeight: "clamp(20px, 4vw, 36px)",
            maxWidth: "120px",
            objectFit: "contain",
          }}
        />
      )}

      {/* Countdown or Watch Now */}
      {countdown?.expired && showButton ? (
        <a
          href={settings?.stream_url || "#"}
          style={{
            display: "inline-block",
            padding: "clamp(6px, 1.5vw, 12px) clamp(16px, 3vw, 32px)",
            background: "#000000",
            color: "#ffffff",
            fontSize: "clamp(12px, 2.5vw, 16px)",
            fontWeight: 600,
            fontFamily: SYSTEM_FONT,
            borderRadius: "6px",
            textDecoration: "none",
            cursor: "pointer",
            boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
            transition: "transform 0.15s, box-shadow 0.15s",
            animation: "watchNowReveal 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
            opacity: 0,
          }}
        >
          {settings?.button_label || "Watch Now"}
        </a>
      ) : countdown ? (
        <div style={{ display: "flex", gap: "clamp(4px, 1.5vw, 12px)" }}>
          {[
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

    </div>
    </>
  );
};

export default Timer;
