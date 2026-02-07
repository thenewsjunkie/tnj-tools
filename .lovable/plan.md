

# Fix: Countdown Timer Off by 10 Hours

## Problem
The `getNextOccurrence` function in `CountdownBanner.tsx` has a flawed timezone conversion that causes a ~10 hour offset when configured for "America/New_York". The issue is in the manual UTC offset estimation approach, which double-converts or misapplies the timezone offset.

## Root Cause
The current code:
1. Gets the current day-of-week in the target timezone (OK)
2. Builds a target date string using `toLocaleDateString` (OK)
3. Then creates a `Date` object from that string and tries to manually adjust for timezone offset -- this is where it breaks. `new Date("2026-02-13T19:00:00")` is interpreted in the **browser's local timezone**, and then the code applies an additional offset calculation that doesn't correctly account for this.

## Fix
Replace the complex manual timezone math with a straightforward approach:
1. Use `Intl.DateTimeFormat` to get the current date/time components in the target timezone
2. Calculate days until the target day-of-week
3. Build the target date/time in the target timezone
4. Convert to UTC by computing the actual offset between UTC and the target timezone at that moment

Simplified logic:

```typescript
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

  // Convert targetLocal (which represents a wall-clock time in `timezone`)
  // to a real UTC timestamp by finding the offset
  const targetStr = targetLocal.toLocaleString("en-US", { timeZone: "UTC" });
  const tzStr = targetLocal.toLocaleString("en-US", { timeZone: timezone });
  const offsetMs = new Date(tzStr).getTime() - new Date(targetStr).getTime();

  return new Date(targetLocal.getTime() - offsetMs);
};
```

The key fix: instead of building a date string and parsing it (which assumes browser-local timezone), we work entirely with `Date` arithmetic and only convert timezone offset at the final step.

## File Changed
| File | Change |
|------|--------|
| `src/components/ss-tools/CountdownBanner.tsx` | Replace `getNextOccurrence` and remove `getTimezoneOffset` helper with corrected timezone logic |

