

## Add Overlay Widgets to Studio Output

Add a configurable overlay system to the Output page, starting with a live clock. These overlays sit on top of all content (like a phone's status bar) and are controlled from the Studio Screen admin panel.

### What You Get

- A real-time clock overlay in the top-left corner of the Output page, displayed in red
- The clock updates every second and shows the current time (e.g., "8:42PM")
- A toggle in the Studio Screen's Output Control section to turn the clock on/off
- The setting is saved to the database and syncs in real-time, so changes appear instantly on the Output page

### Technical Detail

**1. Extend OutputConfig (`src/hooks/useOutputConfig.ts`)**
- Add an `overlays` object to the `OutputConfig` interface:
  ```
  overlays?: {
    clock?: { enabled: boolean; position: "top-left" | "top-right" | "bottom-left" | "bottom-right" }
  }
  ```

**2. Create Clock Overlay component (`src/components/studio/overlays/ClockOverlay.tsx`)**
- A standalone component that renders the current time, updating every second via `setInterval`
- Styled in red, bold, with a semi-transparent dark background pill for readability
- Accepts a `position` prop to determine which corner it appears in
- Uses `date-fns` `format()` consistent with the existing `TimeDisplay` component

**3. Update Output page (`src/pages/Output.tsx`)**
- Read `overlays` from the output config
- Render `ClockOverlay` as a fixed/absolute overlay with a high z-index (above content but below PiP videos) when enabled

**4. Update Output Control admin panel (`src/components/studio/OutputControl.tsx`)**
- Add an "Overlays" section with a toggle for the clock
- Include a position selector (top-left, top-right, bottom-left, bottom-right) so you can place it where you want

**5. Also update OBS Overlay (`src/pages/OBSOverlay.tsx`)**
- Render the same clock overlay so it appears on the OBS source too, reading from the same config

### Files Changed
- `src/hooks/useOutputConfig.ts` -- extend interface
- `src/components/studio/overlays/ClockOverlay.tsx` -- new component
- `src/pages/Output.tsx` -- render overlay
- `src/pages/OBSOverlay.tsx` -- render overlay
- `src/components/studio/OutputControl.tsx` -- add toggle/position controls

