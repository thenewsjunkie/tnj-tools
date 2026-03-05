

## Add Vertical & Horizontal Crop to VDO.Ninja Feeds

Currently each VDO.Ninja feed has a Size (width) slider. This plan adds two crop sliders — vertical and horizontal — that use CSS `object-fit: none` with `object-position` and `inset` clipping to crop the iframe content from each edge.

Since iframes can't be cropped via `object-fit`, the approach is to use CSS `clip-path: inset()` on the iframe container, which clips content from the top/bottom (vertical crop) and left/right (horizontal crop) symmetrically.

### Data Model

**File: `src/hooks/useOutputConfig.ts`**
- Add `cropTop`, `cropBottom`, `cropLeft`, `cropRight` (all `number`, 0–50, representing percentage) to the `VdoNinjaFeed` interface.

### Admin Controls

**File: `src/components/studio/OutputControl.tsx`**
- For each VDO.Ninja feed card, add two new slider rows below the existing "Size" slider:
  - **Crop V** — a dual-thumb or two separate sliders for top/bottom crop (0–50% each)
  - **Crop H** — two separate sliders for left/right crop (0–50% each)
- Add `updateVdoCrop` helper that updates the specific feed's crop values and saves config.
- To keep it simple: 4 small sliders labeled "Top", "Bottom", "Left", "Right" each 0–50%.

### Output Rendering

**File: `src/pages/Output.tsx`**
- Pass crop values to `VdoNinjaEmbed` component.
- Update `VdoNinjaEmbed` to accept optional `cropTop`, `cropBottom`, `cropLeft`, `cropRight` props.
- Apply `clip-path: inset(${top}% ${right}% ${bottom}% ${left}%)` on the iframe's parent div to crop the feed.

### Files Modified
- `src/hooks/useOutputConfig.ts` — Add crop fields to `VdoNinjaFeed`
- `src/components/studio/OutputControl.tsx` — Add crop sliders per VDO.Ninja feed + helper functions
- `src/pages/Output.tsx` — Pass crop values through and apply `clip-path: inset()` on VDO.Ninja containers

