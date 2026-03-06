

## Auto-Switch to Leaderboard on Gift Update + Scale Confetti by Gift Count

### 1. OBS Overlay: Auto-switch to leaderboard on gift updates

In `src/pages/OBSOverlay.tsx`:
- Subscribe to realtime changes on `secret_shows_gifters` table
- When an update is detected, force `currentIndex` to the leaderboard module index
- Set a 60-second timeout, after which resume normal cycling by clearing the override
- Use a `useRef` to track the override timer so re-triggers reset it

### 2. Scale confetti by gift count

In `src/pages/SecretShowsLeaderboard.tsx`, the `fireConfetti` function currently fires a fixed amount of confetti. Change it to accept and use the gift count difference:
- When a gifter's `total_gifts` changes, calculate the delta (`newTotal - oldTotal`)
- Loop the confetti burst `delta` times (capped at a reasonable max like 50 to avoid browser freeze), firing each burst with a small stagger (e.g. 100ms apart)
- For new gifters, use their `total_gifts` as the multiplier

### Technical details

**OBSOverlay.tsx** — new effect:
```typescript
// Listen for leaderboard updates and temporarily pin to it
useEffect(() => {
  const leaderboardIdx = enabledModules.indexOf("leaderboard");
  if (leaderboardIdx === -1 || mode === "manual") return;

  const channel = supabase
    .channel("obs-leaderboard-trigger")
    .on("postgres_changes", 
      { event: "*", schema: "public", table: "secret_shows_gifters" },
      () => {
        setCurrentIndex(leaderboardIdx);
        // Clear any existing timer, set 60s override
        clearTimeout(overrideTimerRef.current);
        overrideTimerRef.current = setTimeout(() => {
          // Resume cycling from next module
          setCurrentIndex((leaderboardIdx + 1) % enabledModules.length);
        }, 60000);
      }
    ).subscribe();

  return () => { supabase.removeChannel(channel); };
}, [enabledModules, mode]);
```
The auto-cycle effect needs to be paused during the 60s override — track this with a `isOverriding` state that the cycle interval checks.

**SecretShowsLeaderboard.tsx** — in the `useEffect` that detects changes:
- Calculate `delta = gifter.total_gifts - prevEntry.gifter.total_gifts`
- Call `fireConfetti` in a loop `delta` times with staggered timeouts
- Cap at 50 bursts to prevent performance issues

