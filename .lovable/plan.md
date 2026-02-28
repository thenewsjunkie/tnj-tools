

## Discord Chat Integration into Studio Output

### What we're building
A **chat source switcher** that lets you toggle between the existing Restream chat embed and a new Discord chat display (reading from the `discord_messages` table your bot is populating).

### How it works

1. **Add a `chatSource` setting** to the `OutputConfig` type (`"restream"` or `"discord"`, default `"restream"`)

2. **Create a `DiscordChatEmbed` component** that:
   - Queries the `discord_messages` table for the latest messages (e.g., last 100)
   - Subscribes to realtime inserts so new messages appear instantly
   - Displays messages in a chat-like scrolling list (author avatar, name, message, timestamp)
   - Styled to match the dark studio aesthetic
   - Supports the existing `zoom` prop for the Chat Zoom slider

3. **Update `RestreamChatEmbed` usage in Output/OBS** to conditionally render either the Restream iframe or the new Discord chat based on the `chatSource` config value

4. **Add a chat source toggle** in the `OutputControl` admin panel -- a simple "Restream / Discord" switcher near the existing Chat Zoom slider

### Files to create
- `src/components/studio/DiscordChatEmbed.tsx` -- realtime Discord chat display component

### Files to modify
- `src/hooks/useOutputConfig.ts` -- add `chatSource?: "restream" | "discord"` to `OutputConfig`
- `src/pages/Output.tsx` -- use `chatSource` to pick which chat component to render
- `src/pages/OBSOverlay.tsx` -- same conditional for OBS
- `src/components/studio/OutputControl.tsx` -- add Restream/Discord toggle button

### Technical details

- **No database migration needed** -- the `discord_messages` table already exists with RLS disabled (public read). The `chatSource` setting is stored in the existing `system_settings` JSON config.
- **Realtime subscription** on `discord_messages` table for `INSERT` events keeps the chat live.
- The Restream iframe will still be always-mounted (hidden) when Discord is active, preserving its message history for when you switch back.
- The Discord component auto-scrolls to the bottom on new messages, similar to a typical chat window.

