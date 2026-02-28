

## Add Full-Screen Module Option to Output

### What Changes
Add a third placement option -- "Full Screen" -- for modules, so any module (like Live Chat) can span the entire output display instead of being limited to the left or right column.

### How It Works
- A new `fullScreen` field in the config stores which module (if any) is in full-screen mode
- When a module is set to full-screen, it takes over the entire `/output` page, hiding the two-column layout
- In the admin UI, each module gets a third "Full" button alongside Left and Right
- Only one module can be full-screen at a time (selecting full-screen for one clears any previous)
- For Live Chat specifically, the always-mounted iframe approach is preserved

### Changes

**`src/hooks/useOutputConfig.ts`**
- Add `fullScreen?: StudioModule | null` to the `OutputConfig` interface

**`src/components/studio/OutputControl.tsx`**
- Replace the two-column grid with a three-column layout: Left | Full | Right
- Add a "Full" column in the middle (or a "Full Screen" button per module row)
- When a module is toggled to Full, it gets set as `config.fullScreen` and removed from left/right columns
- When toggled off Full, it clears `config.fullScreen`
- Visual: full-screen modules highlighted in a distinct color (e.g., green/purple) to differentiate from column assignments

**`src/pages/Output.tsx`**
- Check `config.fullScreen` first
- If a full-screen module is set, render only that module's component filling the entire screen (`w-full h-full`)
- Skip the two-column layout entirely when full-screen is active
- Still mount orphan chat hidden if Live Chat isn't the full-screen module

### Admin UI Layout
The module buttons will look like this for each module:

```text
Module Name:  [Left]  [Full]  [Right]
```

Each button toggles independently. Selecting "Full" clears the module from Left/Right and sets it as the sole full-screen module.

