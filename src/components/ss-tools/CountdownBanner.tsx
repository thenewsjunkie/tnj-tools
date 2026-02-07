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

const CountdownBanner = () => {
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
      <div className="flex items-center justify-center h-screen bg-black">
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
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black flex items-center justify-center p-4">
      <div className="w-full max-w-4xl flex flex-col sm:flex-row items-center gap-6 sm:gap-10">
        {/* Logo */}
        <div className="flex-shrink-0">
          <img
            src={secretShowsLogo}
            alt="Secret Shows"
            className="w-28 h-28 sm:w-36 sm:h-36 object-contain"
          />
        </div>

        {/* Content */}
        <div className="flex-1 text-center sm:text-left">
          {isLive ? (
            <>
              <h1 className="text-white text-xl sm:text-2xl font-bold tracking-widest uppercase mb-2">
                SECRET SHOWS IS LIVE!
              </h1>
              <p className="text-gray-400 text-sm mb-6">
                Exclusive live stream — Members only
              </p>
              {settings.stream_url && (
                <a
                  href={settings.stream_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-8 py-3 rounded-lg font-bold text-white text-lg uppercase tracking-wider bg-gradient-to-r from-red-700 to-red-500 hover:from-red-600 hover:to-red-400 transition-all shadow-lg shadow-red-900/40"
                >
                  Start Stream
                </a>
              )}
            </>
          ) : (
            <>
              <h1 className="text-white text-lg sm:text-xl font-bold tracking-widest uppercase mb-1">
                SECRET SHOWS GOES LIVE IN
              </h1>
              <div
                className="text-red-500 font-bold text-5xl sm:text-6xl tracking-wider my-3"
                style={{ fontFamily: "'Digital-7 Mono', monospace" }}
              >
                {countdownText}
              </div>
              <p className="text-gray-400 text-sm">
                Exclusive live stream — Members only
              </p>
            </>
          )}
        </div>

        {/* Start Stream button (visible but disabled when not live) */}
        {!isLive && settings.stream_url && (
          <div className="flex-shrink-0">
            <button
              disabled
              className="px-8 py-3 rounded-lg font-bold text-white/40 text-lg uppercase tracking-wider bg-gray-800 cursor-not-allowed"
            >
              Start Stream
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CountdownBanner;
