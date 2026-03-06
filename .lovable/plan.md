

## Fix: Confetti Not Firing on Live Updates + Mass Confetti on Refresh

### Root Cause

There are two bugs in `src/pages/SecretShowsLeaderboard.tsx`:

1. **Refresh triggers mass confetti**: On mount, `gifters` starts as `[]` (query loading). The first render guard catches this empty array and stores it as the "previous" state. When the query resolves with the full list, every single gifter appears as "brand new" — triggering confetti for ALL of them with bursts scaled by their total gifts.

2. **Live updates don't trigger confetti**: The diffing approach via `useEffect` on the `gifters` array depends on React Query refetch producing a new reference. This is fragile and can miss updates due to query cache timing (the admin mutation invalidates the same query key before the realtime event arrives, so by the time the OBS page processes it, the data may already be cached).

### Fix

Replace the fragile `useEffect` diffing approach with a **direct Supabase realtime subscription** that receives the actual old/new row data from Postgres. This is reliable and eliminates both bugs:

**In `src/pages/SecretShowsLeaderboard.tsx`:**

- Add a new `useEffect` that subscribes to `postgres_changes` on `secret_shows_gifters` directly
- On `INSERT`: fire confetti scaled by `payload.new.total_gifts`
- On `UPDATE`: fire confetti scaled by `payload.new.total_gifts - payload.old.total_gifts` (the delta)
- Remove the old `useEffect` that diffs `gifters` array — keep only the animation state updates (highlight/pulse CSS) based on the realtime payload
- The `isFirstRender` guard is no longer needed since realtime events only fire on actual DB changes, not on initial data load

**Key details:**
- Use `payload.old` and `payload.new` from Postgres changes to calculate delta directly
- Cap bursts at 50 to prevent performance issues
- The `fireConfetti` function stays the same
- CSS animations (pulse, shift, new entry) still get applied via state sets triggered by the realtime callback
- The `prevGiftersRef` diffing for rank changes can stay, but confetti firing moves to the realtime handler

