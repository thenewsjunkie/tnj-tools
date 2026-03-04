

## Fix Music Embed Appearance

The issue is that `MusicEmbed.tsx` uses `bg-background` which resolves to the dark theme background (since your app defaults to dark theme), and `min-h-screen` which forces a full viewport height — both problematic when embedded in an iframe.

The screenshot shows the player sitting on a large black rectangle because:
1. `bg-background` = dark theme = black/near-black
2. `min-h-screen` = fills the entire iframe height even though the player is small

### Changes

**File**: `src/pages/MusicEmbed.tsx`

- Replace `min-h-screen` with `min-h-0` so the embed only takes up as much space as the player needs
- Replace `bg-background` with `bg-white` (or `bg-transparent`) so it blends with the host page instead of forcing a dark background
- This matches how other embeds in the project (polls, GIFs) handle their styling

### Files
- `src/pages/MusicEmbed.tsx` — Update container classes

