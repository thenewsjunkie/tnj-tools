

## Style Discord Chat to Match Restream Chat

### Current Differences
- Discord shows timestamp — Restream does not. Remove it.
- Discord puts message content on a new line below the username. Restream puts everything inline (avatar → bold username colon → message text).
- Discord username is `text-indigo-300`. Should match Restream's blue style more closely.

### Changes

**`src/components/studio/DiscordChatEmbed.tsx`** — Update the message row layout (lines 89-107):

1. Remove the timestamp `<span>` (line 104) and the `formatTime` helper (lines 72-75)
2. Change the message layout from two-line (name above, content below) to single-line inline: `<span>username:</span> <span>message</span>` all in one flowing block
3. Keep avatar, keep existing sizing and colors

The updated message row will look like:
```tsx
<div key={msg.id} className="w-full flex items-start gap-2 py-1 hover:bg-white/5 rounded px-1">
  {/* avatar unchanged */}
  <p className="min-w-0 flex-1 text-sm break-words">
    <span className="font-bold text-indigo-400">{msg.author_name}: </span>
    <span className="text-gray-200">{msg.content}</span>
  </p>
</div>
```

This matches the Restream inline format: avatar, bold colored username with colon, then message text flowing on the same line.

