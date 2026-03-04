

## Restyle Music Player with Logo

### Changes

**Copy logo to project**
- Copy `user-uploads://NewsJunkie_AppIcon.ai` → `public/images/newsjunkie-logo.ai` (note: .ai files may not render in browsers — will also need to handle fallback, but let's try it as an image source first since many .ai files contain embedded previews)

**`src/components/music/MusicPlayer.tsx`** — Redesign layout to a more conventional player arrangement:

New layout (vertical, centered, clean):
1. **Logo** at top center — the NewsJunkie app icon, fixed size (~64x64), always shown regardless of song cover art
2. **Song info** below logo — title (bold) and artist (lighter) centered
3. **Progress bar** — red slider with time stamps on either side
4. **Controls row** — skip back, play/pause (large circle button), skip forward, centered
5. **Volume** — small row below controls with volume icon + slider

This is a more standard/intuitive player flow: branding → what's playing → where in the track → transport controls → volume.

Cover art from individual songs will not be shown (logo replaces it). If cover art per-song is desired later it can be added back.

### Files
- Copy: `user-uploads://NewsJunkie_AppIcon.ai` → `public/images/newsjunkie-logo.png` (rename to .png for browser compat — .ai won't render)
- Modify: `src/components/music/MusicPlayer.tsx`

