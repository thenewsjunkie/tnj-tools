

## Reduce Discord Chat Vertical Spacing

The screenshot shows excessive gaps between messages. The issue is the combination of `leading-12` (48px line-height) on single-line text plus `py-1` row padding — the line-height adds blank space above and below each text line.

### Changes in `src/components/studio/DiscordChatEmbed.tsx`

- Change text from `text-2xl leading-12` to `text-2xl leading-tight` — this keeps the large font but removes the excess vertical padding around text
- Change row alignment from `items-start` to `items-center` so text centers against the avatar without needing `mt-1` on avatars
- Remove `mt-1` from both avatar elements
- Remove `py-1` from message rows (set to `py-0`)
- Reduce container padding from `p-4` to `p-2`

This will pack messages tightly while keeping the doubled element sizes.

