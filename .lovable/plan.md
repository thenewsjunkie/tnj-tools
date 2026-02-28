

## Fix Discord Chat: Realtime Updates and Bottom-Anchored Messages

### Problem 1: No realtime updates
The `discord_messages` table is **not added to the Supabase Realtime publication**. This means the `postgres_changes` subscription silently receives nothing. A database migration is needed:

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE public.discord_messages;
```

As a safety net, a **polling fallback** will also be added so messages still appear even if Realtime has hiccups.

### Problem 2: Messages stuck at top
The Restream iframe naturally anchors chat to the bottom (newest messages at bottom, filling upward). The Discord component currently renders messages top-down in a scrollable container. Fix: use `flex-col justify-end` layout so messages anchor to the bottom of the container, matching Restream's behavior.

---

### Changes

**1. Database migration** -- Add `discord_messages` to realtime publication
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE public.discord_messages;
```

**2. Update `src/components/studio/DiscordChatEmbed.tsx`**
- Add a polling fallback (every 3 seconds, with backoff) alongside the existing realtime subscription
- Deduplicate messages by ID when merging realtime and polled data
- Change the layout to `flex flex-col justify-end` so messages stack from the bottom up, matching Restream's behavior
- Keep auto-scroll to bottom on new messages

