

## Remove Days Block from Timer

Modify the countdown display in `src/pages/Timer.tsx` to remove the "Days" block and fold day values into hours (e.g., 2 days 3 hours becomes 51 hours).

### Changes to `src/pages/Timer.tsx`

1. Update the countdown calculation (around line 163) to not separate days and hours:
   - Change `hours` to include days: `const totalHours = Math.floor(diff / 3600000);`
   - Remove the `days` field from the returned object

2. Update the display array (around line 293) to remove the Days entry:
   - Remove `{ value: countdown.days, label: "Days" }`
   - The Hours block will now show the total hours (e.g., 51 instead of 3)

3. Update the `pad` function or the hours display to handle 3+ digit values -- use `String(n).padStart(2, "0")` which already handles numbers over 99 fine (it only pads if under 2 digits).

