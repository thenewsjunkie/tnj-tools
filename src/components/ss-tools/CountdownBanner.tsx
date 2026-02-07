import { useState, useEffect, useMemo } from "react";
import { useSSToolsSettings } from "@/hooks/useSSToolsSettings";
import secretShowsLogo from "@/assets/secret-shows-logo.png";

const LIVE_DURATION_MS = 2 * 60 * 60 * 1000; // 2 hours

const getTimezoneOffsetMs = (tz: string, date: Date): number => {
  const utcStr = date.toLocaleString("en-US", { timeZone: "UTC" });
  const tzStr = date.toLocaleString("en-US", { timeZone: tz });
  return new Date(tzStr).getTime() - new Date(utcStr).getTime();
};

const getNextOccurrence = (dayOfWeek: number, timeOfDay: string, timezone: string): Date => {
  const now = new Date();
  const [targetHour, targetMinute] = timeOfDay.split(":").map(Number);

  // Get current date/time components in the target timezone
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
    hour12: false,
  });
  const parts = formatter.formatToParts(now);
  const get = (type: string) => parts.find(p => p.type === type)?.value ?? "0";

  const nowYear = Number(get("year"));
  const nowMonth = Number(get("month"));
  const nowDay = Number(get("day"));
  const nowHour = Number(get("hour"));
  const nowMinuteVal = Number(get("minute"));

  // Use local Date constructor just to get day-of-week from date components
  const currentDayOfWeek = new Date(nowYear, nowMonth - 1, nowDay).getDay();
  let daysUntil = (dayOfWeek - currentDayOfWeek + 7) % 7;

  // Build the target date (may roll into next month correctly via Date constructor)
  const targetDate = new Date(nowYear, nowMonth - 1, nowDay + daysUntil);
  const targetDateStr = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, "0")}-${String(targetDate.getDate()).padStart(2, "0")}`;
  const targetWallClock = `${targetDateStr}T${String(targetHour).padStart(2, "0")}:${String(targetMinute).padStart(2, "0")}:00`;

  // Parse as UTC, then adjust by timezone offset to get the real UTC moment
  const asUTC = new Date(targetWallClock + "Z");
  const offsetMs = getTimezoneOffsetMs(timezone, asUTC);
  let result = new Date(asUTC.getTime() - offsetMs);

  // Check if target is in the past
  if (daysUntil === 0 && result.getTime() <= now.getTime()) {
    const elapsedMs = now.getTime() - result.getTime();
    if (elapsedMs > LIVE_DURATION_MS) {
      // Past live window — jump to next week
      const nextWeek = new Date(nowYear, nowMonth - 1, nowDay + 7);
      const nextDateStr = `${nextWeek.getFullYear()}-${String(nextWeek.getMonth() + 1).padStart(2, "0")}-${String(nextWeek.getDate()).padStart(2, "0")}`;
      const nextWallClock = `${nextDateStr}T${String(targetHour).padStart(2, "0")}:${String(targetMinute).padStart(2, "0")}:00`;
      const nextAsUTC = new Date(nextWallClock + "Z");
      const nextOffsetMs = getTimezoneOffsetMs(timezone, nextAsUTC);
      result = new Date(nextAsUTC.getTime() - nextOffsetMs);
    }
  }

  return result;
};

interface CountdownBannerProps {
  embed?: boolean;
}

const CountdownBanner = ({ embed = false }: CountdownBannerProps) => {
  const { data: settings, isLoading } = useSSToolsSettings();
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const target = useMemo(() => {
    if (!settings) return null;
    return getNextOccurrence(settings.day_of_week, settings.time_of_day, settings.timezone);
  }, [settings, Math.floor(now / 60000)]); // recalc every minute

  if (isLoading || !settings || !target) {
    return (
      <div className={`flex items-center justify-center ${embed ? "h-full" : "h-screen"}`} style={{ background: "transparent" }}>
        <div className="text-white/50 text-sm">Loading...</div>
      </div>
    );
  }

  const diff = target.getTime() - now;
  const isLive = diff <= 0 && Math.abs(diff) <= LIVE_DURATION_MS;

  const totalSeconds = Math.max(0, Math.floor(diff / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (n: number) => String(n).padStart(2, "0");

  let countdownText: string;
  if (days > 0) {
    countdownText = `${days}d ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  } else {
    countdownText = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }

  return (
    <div
      className={`${embed ? "flex items-center w-full" : "min-h-screen flex items-center justify-center px-4 py-2"}`}
      style={{ background: "transparent" }}
    >
      {/* Banner bar */}
      <div
        className={`${embed ? "w-full" : "w-full max-w-5xl"} flex items-center gap-0 relative`}
        style={{
          background: "linear-gradient(180deg, rgba(30,30,30,0.95) 0%, rgba(15,15,15,0.98) 100%)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "6px",
          boxShadow: "0 4px 30px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)",
          minHeight: "80px",
        }}
      >
        {/* Logo — overlapping left edge */}
        <div className="flex-shrink-0 -ml-4 sm:-ml-6 z-10">
          <img
            src={secretShowsLogo}
            alt="Secret Shows"
            className="w-20 h-20 sm:w-24 sm:h-24 object-contain drop-shadow-lg"
          />
        </div>

        {/* Content */}
        <div className="flex-1 pl-3 sm:pl-5 py-3">
          {isLive ? (
            <>
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-white text-sm sm:text-base font-bold tracking-widest uppercase">
                  SECRET SHOWS IS LIVE!
                </span>
              </div>
              <p className="text-gray-400 text-xs sm:text-sm mt-0.5">
                Exclusive live stream • Members only
              </p>
            </>
          ) : (
            <>
              <div className="flex items-baseline gap-2 sm:gap-3 flex-wrap">
                <span className="text-white text-sm sm:text-base font-bold tracking-widest uppercase">
                  SECRET SHOWS GOES LIVE IN
                </span>
                <span
                  className="text-red-500 font-bold text-2xl sm:text-3xl tracking-wider"
                  style={{
                    fontFamily: "'Digital-7 Mono', monospace",
                    textShadow: "0 0 10px rgba(239,68,68,0.5), 0 0 20px rgba(239,68,68,0.2)",
                  }}
                >
                  {countdownText}
                </span>
              </div>
              <p className="text-gray-400 text-xs sm:text-sm mt-0.5">
                Exclusive live stream • Members only
              </p>
            </>
          )}
        </div>

        {/* Start Stream / Watch Now button */}
        {settings.stream_url && (
          <div className="flex-shrink-0 pr-3 sm:pr-4">
            {isLive ? (
              <a
                href={settings.stream_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-5 sm:px-6 py-2.5 rounded font-bold text-white text-xs sm:text-sm uppercase tracking-wider transition-all"
                style={{
                  background: "linear-gradient(180deg, #c62828 0%, #8b1a1a 100%)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  boxShadow: "0 2px 8px rgba(198,40,40,0.4), inset 0 1px 0 rgba(255,255,255,0.1)",
                }}
              >
                Watch Now <span className="text-base">▸</span>
              </a>
            ) : (
              <button
                disabled
                className="inline-flex items-center gap-1.5 px-5 sm:px-6 py-2.5 rounded font-bold text-xs sm:text-sm uppercase tracking-wider cursor-not-allowed"
                style={{
                  background: "linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "rgba(255,255,255,0.3)",
                }}
              >
                Start Stream <span className="text-base">▸</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CountdownBanner;
