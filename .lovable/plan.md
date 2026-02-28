

## Add Brightness/Contrast Controls to Output Page

### Approach
Add brightness and contrast sliders to the OutputControl card in Studio Screen admin. The values will be stored in the existing `OutputConfig` in `system_settings`, and applied as CSS `filter: brightness() contrast()` on the `/output` page container. Real-time sync is already in place.

### Changes

**`src/hooks/useOutputConfig.ts`**
- Add `brightness` (default 100) and `contrast` (default 100) fields to the `OutputConfig` interface

**`src/components/studio/OutputControl.tsx`**
- Add two Slider components (from existing ui/slider) below the existing controls:
  - Brightness: range 50-200, default 100
  - Contrast: range 50-200, default 100
- Each slider updates the config on change via the existing `save()` helper
- Show current percentage value next to each slider

**`src/pages/Output.tsx`**
- Read `brightness` and `contrast` from config
- Apply `style={{ filter: \`brightness(\${b}%) contrast(\${c}%)\` }}` to the root `div`

### Technical Details
- No database migration needed -- values are stored as JSON in the existing `system_settings` row
- Defaults to 100% (no change) when not set
- Real-time subscription already handles syncing changes to the output page instantly
- Slider component already exists at `src/components/ui/slider.tsx`

