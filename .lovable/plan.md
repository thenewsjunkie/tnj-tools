

## Fix Secret Shows Gifters Realtime on OBS Overlay

### Problem
The `secret_shows_gifters` table is not added to the Supabase Realtime publication (`supabase_realtime`). This means the `postgres_changes` subscription in `useSecretShowsGifters` never receives any events, so the OBS Overlay leaderboard doesn't update when gifts are added.

### Fix
Run a single SQL migration to add the table to the realtime publication:

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE secret_shows_gifters;
```

### No Code Changes Needed
The existing `useSecretShowsGifters` hook already has the correct realtime subscription code -- it subscribes to `postgres_changes` on the `secret_shows_gifters` table and invalidates the React Query cache on any change. Once the table is in the publication, everything will work automatically with the flashy animations and confetti already built into the leaderboard.

