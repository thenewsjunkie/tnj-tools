

## Remove Overlays from OBS Overlay Page

The OBS Overlay page (`/obs-overlay`) currently renders the Clock overlay (line 78 of `src/pages/OBSOverlay.tsx`), but overlays should only appear on `/output`.

### Change

**Edit `src/pages/OBSOverlay.tsx`**
- Remove the `ClockOverlay` import (line 11)
- Remove the `overlays` variable from `useOutputConfig` destructuring (line 30)
- Remove the `{overlays?.clock?.enabled && <ClockOverlay ... />}` render line (line 78)

This is a 3-line cleanup. The Output page (`/output`) will continue to show overlays as before.

