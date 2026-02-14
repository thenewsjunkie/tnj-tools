

## Fix: Timezone Offset Direction Bug

The `getNextOccurrence` function in `src/pages/Timer.tsx` applies the timezone offset in the wrong direction, causing the countdown to be off.

### Root Cause

Line 71 currently reads:
```
const result = new Date(utcGuess.getTime() + diffMinutes * 60000);
```

It should be:
```
const result = new Date(utcGuess.getTime() - diffMinutes * 60000);
```

### What Went Wrong

For America/New_York (UTC-5) with a target of 17:00:
- `utcGuess` is set to 17:00 UTC
- In EST, that displays as 12:00 (noon)
- `diffMinutes` = (12 x 60) - (17 x 60) = -300
- Adding -300 minutes shifts to 12:00 UTC (7 AM EST) -- **wrong**
- Subtracting -300 minutes shifts to 22:00 UTC (5 PM EST) -- **correct**

### Change

**`src/pages/Timer.tsx`**, line 71 -- Change `+` to `-` in the offset calculation.

