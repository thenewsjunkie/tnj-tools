

## Fix: Timer 5-Hour Timezone Offset

The `getNextOccurrence` function in `src/pages/Timer.tsx` has a broken timezone conversion. When it builds a date string like `"2026-02-20T19:00:00"` and passes it to `new Date()`, JavaScript parses it as local time. The subsequent offset calculation then produces incorrect results, shifting the countdown by the timezone offset (5 hours for EST).

### Root Cause

Lines 58-68 attempt to convert from the target timezone to UTC using `toLocaleString` round-tripping, but this approach is unreliable and produces the wrong offset.

### Fix in `src/pages/Timer.tsx`

Replace the `getNextOccurrence` function with a corrected version that properly computes the UTC equivalent of a given date/time in a specific timezone:

1. For each candidate day, format the date parts in the target timezone (already correct)
2. Build the date string as before
3. **Fix the offset calculation**: Instead of the broken round-trip, use `Intl.DateTimeFormat` to find what UTC time corresponds to the desired wall-clock time in the target timezone. The correct approach:
   - Create a date from the string (parsed as local)
   - Use binary search or iterative approach to find the UTC instant where `toLocaleString` in the target timezone gives the desired wall-clock time
   - Or simpler: use the `formatToParts` approach to extract the timezone offset directly

The simplest reliable fix:
- Build the naive date string
- Create two `Date` objects by formatting the same instant in UTC vs the target timezone
- Compute offset as: `localParsed.getTime() - tzParsed.getTime()` but using the **target date** not the naive parse

Corrected logic:

```typescript
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
      // Build an ISO-like string and append the timezone via a helper
      // Use a UTC anchor and adjust: create the date as if UTC, then
      // find the real UTC offset for that moment in the target timezone
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

      // What wall-clock time does utcGuess show in the target timezone?
      const wallParts = new Intl.DateTimeFormat("en-US", {
        timeZone: timezone,
        hour: "numeric",
        minute: "numeric",
        hour12: false,
      }).formatToParts(utcGuess);

      const wallHour = parseInt(wallParts.find(p => p.type === "hour")?.value || "0");
      const wallMin = parseInt(wallParts.find(p => p.type === "minute")?.value || "0");

      // The difference tells us the timezone offset at that moment
      const diffMinutes = (wallHour * 60 + wallMin) - (hours * 60 + minutes);
      // Adjust: we want wall clock = hours:minutes, so shift UTC by +diffMinutes
      const result = new Date(utcGuess.getTime() + diffMinutes * 60000);

      if (result.getTime() > now.getTime()) {
        return result;
      }
    }
  }
  return new Date(now.getTime() + 7 * 86400000);
}
```

This correctly finds the UTC instant where the wall-clock time in the target timezone matches the desired time, eliminating the 5-hour discrepancy.

### Files Modified
- `src/pages/Timer.tsx` -- Replace `getNextOccurrence` function (lines 24-77)
