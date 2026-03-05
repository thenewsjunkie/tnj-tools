

## Increase Discord Chat Text Size

The avatar is `w-6 h-6` (24px). The text is `text-sm` (14px). To match the avatar height visually, bump the text to `text-base` (16px) and increase line-height.

### Change in `src/components/studio/DiscordChatEmbed.tsx`

- Line 97: Change `text-sm` to `text-base leading-6` so the text line-height matches the 24px avatar height

