

## Add Picture-in-Picture Placement for YouTube Video Feeds

### What Changes
Add a new "PiP" (Picture-in-Picture) placement option for video feeds. When selected, the video will appear as a small overlay in the top-right corner of the Output page, floating above other content.

### Changes (3 files)

**1. `src/hooks/useOutputConfig.ts`**
- Add `"pip"` to the `VideoPlacement` type union (currently `"left" | "right" | "full"`, becomes `"left" | "right" | "full" | "pip"`)

**2. `src/components/studio/OutputControl.tsx`**
- Add `{ value: "pip", label: "PiP" }` to the `PLACEMENT_OPTIONS` array so admins can select it when adding or updating a video feed

**3. `src/pages/Output.tsx`**
- Filter video feeds with `placement === "pip"` separately from the other placements
- Render PiP videos as fixed-position overlays in the top-right corner, styled with:
  - `fixed top-4 right-4` positioning
  - A compact size (~320x180px, 16:9 aspect ratio)
  - `z-50` to float above all other content
  - Rounded corners and a subtle shadow for visibility
  - If multiple PiP videos exist, stack them vertically with spacing

