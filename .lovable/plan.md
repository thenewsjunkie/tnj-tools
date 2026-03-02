

## Increase Clock Overlay Size and Add Pill Border

### Changes

**File: `src/components/studio/overlays/ClockOverlay.tsx`** -- Update the styling on the clock span:

1. **Triple the font size**: Change `text-2xl` to `text-7xl` (approximately 3x larger)
2. **Add a pill border**: Add a visible border (e.g., `border-2 border-red-500/60`) and increase the border radius with `rounded-full` for a proper pill shape
3. **Scale padding proportionally**: Increase `px-3 py-1` to `px-8 py-3` to match the larger text

No other files need changes.

