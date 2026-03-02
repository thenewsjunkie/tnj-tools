

## Fix Discord Chat Messages Not Filling Full Width

**Problem**: When Discord is selected as the chat source, short messages only take up as much horizontal space as the text needs, leaving the right side of the container empty. The layout looks lopsided.

**Root Cause**: The message text wraps tightly around the content. The outer message row doesn't stretch to fill the container width.

**Solution**: Make each message row span the full width of the container by adding `w-full` to the message row div. This ensures the row stretches edge-to-edge regardless of how short the message text is. The content inside already uses `flex-1` so it will fill correctly once the parent is full-width.

### Technical Detail

**File: `src/components/studio/DiscordChatEmbed.tsx`** -- 1 edit:

- **Line 90**: Add `w-full` to the message row's className so each chat line stretches across the entire container width instead of shrinking to fit content.

```tsx
// From:
<div key={msg.id} className="flex items-start gap-2 py-1 hover:bg-white/5 rounded px-1">

// To:
<div key={msg.id} className="w-full flex items-start gap-2 py-1 hover:bg-white/5 rounded px-1">
```

This is a single-line CSS fix. No other files need changes.

