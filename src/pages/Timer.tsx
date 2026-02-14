import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface TimerSettings {
  target_datetime: string | null;
  stream_url: string;
  button_label: string;
  logo_url: string | null;
  theme: string;
}

const SYSTEM_FONT = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

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
    const fetch = async () => {
      const { data } = await supabase
        .from("timer_settings")
        .select("*")
        .limit(1)
        .maybeSingle();
      if (data) {
        setSettings(data as TimerSettings);
      }
      setLoaded(true);
    };
    fetch();

    // Subscribe to realtime changes
    const channel = supabase
      .channel("timer_settings_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "timer_settings" },
        (payload) => {
          if (payload.new) {
            setSettings(payload.new as TimerSettings);
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

  // Compute countdown
  const countdown = useMemo(() => {
    if (!settings?.target_datetime) return null;
    const target = new Date(settings.target_datetime).getTime();
    const diff = target - now.getTime();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return { days, hours, minutes, seconds, expired: false };
  }, [settings?.target_datetime, now]);

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
      {countdown?.expired ? (
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
