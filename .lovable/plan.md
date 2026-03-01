

## Update YouTube Video Feed Placement Options

### Changes

**1. Update `VideoPlacement` type** in `src/hooks/useOutputConfig.ts`
- Remove `"left"` and `"right"` placements
- Rename `"full"` to `"center"` (full-screen behavior)
- Replace `"pip"` with `"pip-left"` and `"pip-right"`
- New type: `"center" | "pip-left" | "pip-right"`

**2. Update placement options** in `src/components/studio/OutputControl.tsx`
- Replace the 4-option list with 3 options: **Center**, **PiP Left**, **PiP Right**

**3. Update `src/pages/Output.tsx`** rendering logic
- **Center**: renders full-screen (same as current `"full"` behavior)
- **PiP Left**: fixed overlay in top-left corner, 2x current size (w-[640px] instead of w-80)
- **PiP Right**: fixed overlay in top-right corner, 2x current size
- Remove all references to `leftVideos` and `rightVideos` filtering

### Technical details

**Type change:**
```
"left" | "right" | "full" | "pip"  -->  "center" | "pip-left" | "pip-right"
```

**PiP sizing:** Current PiP is `w-80` (320px). Doubling to `w-[640px]` with `aspect-video` gives a 640x360 overlay.

**Migration:** Any existing video feeds with old placements (`left`, `right`, `full`, `pip`) will be handled gracefully -- `full` maps to `center` behavior, and `pip` defaults to `pip-right`. The `left`/`right` placements simply won't match any filter and won't render (user can reassign them).

