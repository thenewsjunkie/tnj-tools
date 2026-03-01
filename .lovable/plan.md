

## Consolidate Studio Screen Layout

Two changes: consolidate the rotate controls row in Output Control, and wrap every module in collapsible sections (collapsed by default) on the Studio Screen.

### 1. OutputControl.tsx -- Merge rotate controls onto one line

Combine "Rotate Left", "Rotate Right" switches and the "Rotate every X seconds" input into a single row:

```text
Rotate Left [toggle]  Rotate Right [toggle]  |  Every [30] seconds
```

- Remove the separate `{anyRotateEnabled && ...}` conditional block for interval
- Always show the interval input inline (just visually muted when no rotation is enabled)
- Lines 237-261 replaced with a single `flex items-center gap-3` row

### 2. StudioScreen.tsx -- Wrap all modules in CollapsibleModule

Use the existing `CollapsibleModule` component (from `src/components/admin/CollapsibleModule.tsx`) to wrap each studio component. All default to collapsed (`defaultOpen={false}`).

Each module gets a unique `id` for localStorage persistence:
- `studio-output` -- Output Control
- `studio-obs` -- OBS Overlay
- `studio-ads` -- Ads Manager
- `studio-art-mode` -- Art Mode
- `studio-leaderboard` -- Secret Shows Leaderboard
- `studio-hall-of-frame` -- Hall of Frame
- `studio-teleprompter` -- TelePrompter
- `studio-chat` -- Live Chat

The children components keep their existing Card styling inside the collapsible wrapper.

### Files Modified
- `src/components/studio/OutputControl.tsx` -- merge rotate row
- `src/pages/Admin/StudioScreen.tsx` -- wrap all modules in CollapsibleModule with `defaultOpen={false}`

