

## Rotate Full-Screen Content for Horizontal Monitor

### What Changes
When the output page is in full-screen mode, apply a CSS rotation so the content displays correctly on a horizontally-mounted monitor. This adds a "Rotate" toggle to the admin Output Control that rotates the full-screen content 90 degrees using a CSS transform.

### How It Works
- A new `rotation` field in the config stores the rotation angle: `0` (default), `90`, `180`, or `270`
- When full-screen mode is active, the entire content container gets a CSS `transform: rotate(Xdeg)` along with swapped width/height so it fills the rotated viewport correctly
- The admin UI gets a simple rotation control (a dropdown or cycle button) next to the orientation toggle

### Changes

**`src/hooks/useOutputConfig.ts`**
- Add `rotation?: number` to the `OutputConfig` interface (values: 0, 90, 180, 270; default 0)

**`src/components/studio/OutputControl.tsx`**
- Add a "Rotation" control below the Layout section with four options: 0, 90, 180, 270 degrees
- Each button saves the chosen rotation value via the existing `save()` helper

**`src/pages/Output.tsx`**
- In the full-screen rendering branch, wrap the content in a container that applies:
  - `transform: rotate(Xdeg)` based on the rotation value
  - For 90/270 degree rotations: swap width and height (`width: 100vh; height: 100vw`) and use `transform-origin: center` so the rotated content fills the viewport correctly
  - For 0/180: no dimension swapping needed
- This also applies to the non-full-screen (column) layout so it works in all modes

### Technical Details
- For 90/270 rotation, the CSS will be:
  ```css
  transform: rotate(90deg);
  transform-origin: center center;
  width: 100vh;
  height: 100vw;
  position: fixed;
  top: 50%;
  left: 50%;
  translate: -50% -50%;
  ```
- No migration needed -- stored in existing `system_settings` JSON
- Real-time sync pushes rotation changes instantly to the output page

