

## Add Rotation/Cycling Mode for Output Columns

### What It Does
When you assign multiple modules to a column (e.g., Leaderboard + Hall of Frame in the left column), instead of stacking them both at once, the Output page will show one at a time and cycle between them on a timer -- similar to how the Hall of Frame cycles through photos.

### How It Works (Admin Side)
Add a "Rotate" toggle per column in the Output Control card. When enabled for a column:
- Only one module is visible at a time, filling the full column height
- It cycles to the next module on a configurable interval (default: 30 seconds)
- A smooth fade transition between modules

When "Rotate" is off (the default), the current behavior stays -- all modules stack vertically.

### Changes (3 files)

**1. `src/hooks/useOutputConfig.ts`**
- Add two optional fields to `OutputConfig`:
  - `leftRotate?: boolean` -- whether the left column cycles
  - `rightRotate?: boolean` -- whether the right column cycles
  - `rotateInterval?: number` -- seconds between rotations (default 30, shared by both columns)

**2. `src/components/studio/OutputControl.tsx`**
- Add a "Rotate" toggle button next to each column header (Left Column / Right Column)
- Add a rotation interval input (only shown when at least one column has rotation enabled)
- Toggling saves to the config immediately like existing controls

**3. `src/pages/Output.tsx`**
- Update `OutputColumn` to accept a `rotate` prop
- When `rotate` is true and multiple non-chat modules exist:
  - Track a `visibleIndex` state that increments on a timer
  - Render all modules but only show the current one (using CSS visibility or conditional rendering)
  - Apply a fade transition between swaps
  - Chat module is excluded from rotation (always shown or hidden based on its own logic)
- When `rotate` is false, keep current stacking behavior

### Technical Detail

```text
Column config: [leaderboard, hall-of-frame, ads]  +  rotate: true

Time 0-30s:   Show leaderboard (full height)
Time 30-60s:  Fade to hall-of-frame (full height)
Time 60-90s:  Fade to ads (full height)
Time 90-120s: Back to leaderboard
...and so on
```

Chat is always treated separately -- if it's in the column, it gets its own space below the rotating module (or is hidden per existing logic). Only non-chat modules participate in rotation.

