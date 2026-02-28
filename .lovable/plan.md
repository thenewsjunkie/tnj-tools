

## Fix Hall of Frame First Photo Getting Cut Short

### Root Cause
The auto-advance timer uses `setInterval` with `photos.length` in the dependency array. Shortly after mount, the real-time subscription triggers a query invalidation, causing `photos` to refetch. Even though the data hasn't changed, the effect restarts and resets the interval timer -- cutting the first photo's display time short.

### Fix (1 file)

**`src/pages/HallOfFrame.tsx`** -- lines 33-44

Replace `setInterval` with recursive `setTimeout`. After each photo finishes displaying for the full interval duration, schedule the next transition. This way, every photo -- including the first -- always gets the complete display time, even if the effect re-runs due to dependency changes.

```text
Before (setInterval):
  mount -> interval starts -> query refetch -> effect restarts -> timer reset -> photo 1 cut short

After (setTimeout):  
  mount -> setTimeout(full interval) -> transition -> setTimeout(full interval) -> ...
  If effect re-runs mid-wait, cleanup clears the old timeout, and a NEW full-duration timeout starts -- so the current photo still gets a full display cycle.
```

Additionally, store `photos.length` in a ref so the effect doesn't re-run when the query refetches with the same number of photos.

