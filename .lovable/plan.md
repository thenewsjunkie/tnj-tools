

## Remove Local Time Display from Timer

Remove the "current time + timezone" text shown below the countdown/button on the `/timer` page.

### Change

**`src/pages/Timer.tsx`** -- Delete the `<div>` block (around lines 222-232) that renders `{localTime} {tzAbbr}` below the countdown. Also remove the related `localTime` and `tzAbbr` variables since they'll be unused.

