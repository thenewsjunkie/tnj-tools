

## TelePrompter Module for Studio Screen

### Overview
A full-featured teleprompter built as a new Studio Screen admin card (control panel) and a dedicated full-screen display page (`/teleprompter`) that can be opened in a separate window or browser source.

### Features
**Admin Control Card** (on Studio Screen):
- Textarea to load/paste a script
- Play / Pause / Reset controls
- Speed slider (adjustable scroll speed, e.g. 1-10 scale)
- Font size slider (for the display)
- Mirror mode toggle (horizontal flip for use with a physical teleprompter mirror)
- "Open TelePrompter" link to open the display in a new window
- Script is persisted in `system_settings` (key: `teleprompter_config`) so it syncs in real-time to the display page

**Display Page** (`/teleprompter`):
- Full-screen black background with large white text
- Smooth auto-scrolling at the configured speed
- Responds in real-time to play/pause/reset/speed/font-size/mirror changes from admin
- Clean, distraction-free reading view
- Countdown marker line (a fixed horizontal guide line in the center of the screen showing where to read)

### Configuration stored in `system_settings`
```text
key: "teleprompter_config"
value: {
  script: string,
  isPlaying: boolean,
  speed: number (1-10, default 3),
  fontSize: number (24-72, default 36),
  mirror: boolean (default false),
  scrollPosition: number (0-100 percentage, for reset)
}
```

### Files to create
- `src/components/studio/TelePrompterControl.tsx` -- Admin card with script input and playback controls
- `src/hooks/useTelePrompter.ts` -- Hook to read/write teleprompter config from `system_settings` with realtime subscription
- `src/pages/TelePrompter.tsx` -- Full-screen display page

### Files to modify
- `src/pages/Admin/StudioScreen.tsx` -- Add `<TelePrompterControl />` to the module list
- `src/components/routing/routes.tsx` -- Add `/teleprompter` route

### Technical approach
- Uses the existing `system_settings` table pattern (same as OutputConfig) -- no migration needed
- Realtime subscription on `system_settings` with `key=eq.teleprompter_config` keeps the display page in sync with admin controls
- Scrolling is implemented with `requestAnimationFrame` for smooth performance, incrementing `scrollTop` based on the speed value
- The admin card follows the same visual pattern as OutputControl / OBSOverlayControl (Card with gradient background, colored accents)

