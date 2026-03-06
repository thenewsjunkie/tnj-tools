

## Fix: Set Replica Identity Full for Correct Confetti Scaling

### Problem
The `secret_shows_gifters` table has default replica identity (primary key only). This means Supabase Realtime's `payload.old` only contains `id` — not `total_gifts`. So on UPDATE events, `oldRow.total_gifts` is `undefined`, and the delta becomes `newRow.total_gifts - 0 = newRow.total_gifts` (the entire total, not the increment).

The realtime subscription itself works fine — no OBS refresh needed. The confetti just fires the wrong number of times.

### Fix
One database migration:

```sql
ALTER TABLE public.secret_shows_gifters REPLICA IDENTITY FULL;
```

This makes Postgres include all old column values in the WAL, so `payload.old.total_gifts` is populated correctly. The delta calculation in `SecretShowsLeaderboard.tsx` will then work as intended.

No code changes needed — the existing logic is correct once it receives the full old row.

