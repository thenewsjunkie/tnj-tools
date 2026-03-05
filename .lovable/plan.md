

## Tighten Discord Chat Message Spacing

The screenshot shows large gaps between Discord messages on `/output`. The current code uses `space-y-1` on the container and `py-1` on each message row — but when scaled up via the zoom feature (e.g., 200-300%), these small gaps become visually large.

### Changes

**`src/components/studio/DiscordChatEmbed.tsx`**:
- Change container from `space-y-1` to `space-y-0` to remove inter-message gaps
- Change message row padding from `py-1` to `py-0.5` for tighter vertical spacing
- Reduce container padding from `p-3` to `p-2`

This keeps messages readable but eliminates the excessive whitespace visible in the screenshot.

