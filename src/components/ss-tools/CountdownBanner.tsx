import { useState, useEffect, useMemo } from "react";
import { useSSToolsSettings } from "@/hooks/useSSToolsSettings";
import secretShowsLogo from "@/assets/secret-shows-logo.png";

const getNextOccurrence = (dayOfWeek: number, timeOfDay: string, timezone: string): Date => {
  const now = new Date();
  const [hours, minutes] = timeOfDay.split(":").map(Number);

  // Get current date parts in the target timezone
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
    hour12: false,
  });
  const parts = formatter.formatToParts(now);
  const get = (type: string) => parts.find(p => p.type === type)?.value ?? "0";

  // Current day-of-week in the target timezone
  const nowInTZ = new Date(
    `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}:${get("second")}`
  );
  const currentDay = nowInTZ.getDay();

  let daysUntil = (dayOfWeek - currentDay + 7) % 7;

  // Build target date in the target timezone
  const targetLocal = new Date(nowInTZ);
  targetLocal.setDate(targetLocal.getDate() + daysUntil);
  targetLocal.setHours(hours, minutes, 0, 0);

  // If target is already past today in TZ, jump to next week
  if (daysUntil === 0 && targetLocal <= nowInTZ) {
    targetLocal.setDate(targetLocal.getDate() + 7);
  }

  // Convert targetLocal (wall-clock time in `timezone`) to real UTC timestamp
  const targetStr = targetLocal.toLocaleString("en-US", { timeZone: "UTC" });
  const tzStr = targetLocal.toLocaleString("en-US", { timeZone: timezone });
  const offsetMs = new Date(tzStr).getTime() - new Date(targetStr).getTime();

  return new Date(targetLocal.getTime() - offsetMs);
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

  const currentTimeInTZ = new Intl.DateTimeFormat("en-US", {
    timeZone: settings?.timezone ?? "UTC",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  }).format(now);

  const tzAbbr = new Intl.DateTimeFormat("en-US", {
    timeZone: settings?.timezone ?? "UTC",
    timeZoneName: "short",
  }).formatToParts(now).find(p => p.type === "timeZoneName")?.value ?? "";

  const diff = target.getTime() - now;
  const isLive = diff <= 0;

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
              <p className="text-gray-500 text-xs mt-2 font-mono">
                {currentTimeInTZ} {tzAbbr}
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
