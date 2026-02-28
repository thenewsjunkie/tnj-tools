

## Add Vertical/Horizontal Layout Toggle to Output

### What Changes
Add an orientation setting so the two-column layout can switch between **horizontal** (side-by-side, current default) and **vertical** (stacked top/bottom).

### How It Works
- A new `orientation` field in the config: `"horizontal"` (default) or `"vertical"`
- In horizontal mode, columns sit side-by-side with `flex-row` (current behavior)
- In vertical mode, columns stack with `flex-col`, each taking half the height
- The admin toggle is a simple two-option button group in OutputControl

### Changes

**`src/hooks/useOutputConfig.ts`**
- Add `orientation?: "horizontal" | "vertical"` to `OutputConfig` (default `"horizontal"`)

**`src/components/studio/OutputControl.tsx`**
- Add a small toggle below the module placement grid with two buttons: "Horizontal" and "Vertical"
- Clicking updates `config.orientation` via the existing `save()` helper

**`src/pages/Output.tsx`**
- Read `config.orientation` (default `"horizontal"`)
- Change the two-column container at line 196 from `flex` (always row) to conditionally use `flex-row` or `flex-col`
- Change the divider from vertical (`w-px`) to horizontal (`h-px`) when in vertical mode
- Each "column" uses `flex-1` either way, so it fills half the space in both orientations

### Technical Details
- No migration needed -- stored in the existing `system_settings` JSON
- Real-time sync already handles pushing changes to the output page instantly
- Full-screen mode is unaffected (it bypasses the column layout entirely)

