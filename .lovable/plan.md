

## Fix: Hall of Frame First Photo Still Cut Short

### Root Cause

The `setTimeout` effect depends on `interval` (line 47). Here's what happens:

1. Component mounts -- `settings` is `undefined`, so `interval` = default `8000`
2. Timer starts for photo 1
3. Settings query resolves -- `interval` recalculates (even if still 8000, React sees a new render cycle)
4. Real-time subscription fires on the settings table, triggering another refetch
5. Each time `interval` reference updates in the dependency array, the effect restarts, resetting the timer

### Fix (1 file)

**`src/pages/HallOfFrame.tsx`** -- lines 16, 33-47

- Store `interval` in a ref (`intervalRef`) alongside `photosLengthRef`
- Remove `interval` from the effect's dependency array
- Use `intervalRef.current` inside the `setTimeout` call
- The effect will only depend on `[paused, currentIndex]` -- meaning it only restarts when we deliberately advance to the next photo or toggle pause

```
// Refs
const photosLengthRef = useRef(photos.length);
photosLengthRef.current = photos.length;
const intervalRef = useRef(interval);
intervalRef.current = interval;

// Effect deps: only [paused, currentIndex]
useEffect(() => {
  if (paused || photosLengthRef.current <= 1) return;
  const timer = setTimeout(() => {
    setTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % photosLengthRef.current);
      setTransitioning(false);
    }, 800);
  }, intervalRef.current);
  return () => clearTimeout(timer);
}, [paused, currentIndex]);
```

This ensures the timer is never restarted by background data fetches -- only by actual photo transitions or pause/unpause actions.

