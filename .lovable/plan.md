

## Add Lock & On/Off Switch for VDO.Ninja Feeds

Two features for each VDO.Ninja feed card:

### 1. On/Off Switch
- Add an `enabled` boolean to `VdoNinjaFeed` interface (default `true`)
- Add a small Switch toggle in the feed card header, before the URL
- When off, the feed is skipped in `Output.tsx` rendering (filtered out)
- All settings remain preserved — just toggled invisible

### 2. Lock Settings
- Add a `locked` boolean to `VdoNinjaFeed` interface (default `false`)
- Add a Lock/Unlock icon button in the feed card header
- When locked: disable placement buttons, size slider, crop sliders, remove button, and URL edit button (visually dim them with `opacity-40 pointer-events-none`)
- The on/off switch remains usable even when locked

### Files Modified

**`src/hooks/useOutputConfig.ts`** — Add `enabled?: boolean` and `locked?: boolean` to `VdoNinjaFeed` interface

**`src/components/studio/OutputControl.tsx`**:
- Import `Lock`, `Unlock` icons
- Add lock toggle helper (`updateVdoLocked`) and enable toggle helper (`updateVdoEnabled`)
- In each feed card header: add Switch for on/off + Lock/Unlock button
- Wrap placement, size, crop, remove, and edit controls with a disabled state when `locked`

**`src/pages/Output.tsx`** — Filter `vdoNinjaFeeds` to only include feeds where `enabled !== false`

