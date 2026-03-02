

## Adjust Clock Overlay Size, Spacing, and Add Seconds

### Changes

**File: `src/components/studio/overlays/ClockOverlay.tsx`** -- 3 tweaks:

1. **Reduce font size by 1x**: Change `text-7xl` to `text-5xl` (bringing it down one step)
2. **Add top spacing**: Increase the position offset from `top-4` to `top-8` in the `POSITION_CLASSES` for the two top positions
3. **Add seconds to the format**: Change the time format from `"h:mmaa"` to `"h:mm:ssaa"` so seconds are displayed

