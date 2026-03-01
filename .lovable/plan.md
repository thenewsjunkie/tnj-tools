

## Simplify Art Mode to Full-Screen Images Only

Remove all decorative elements from Art Mode so images display edge-to-edge with no frame, no label, and no padding.

### Changes

**File: `src/components/studio/ArtModeDisplay.tsx`**

1. Remove the `FRAME_STYLES` object and all frame-related logic
2. Remove the `p-6` / `p-3` padding from the root container so images go edge-to-edge
3. Remove the label overlay (`current.label` bottom gradient section) entirely
4. Change the image to fill the entire container using `w-full h-full object-cover` (or `object-contain` to preserve aspect ratio without cropping -- will use `object-contain` to avoid cutting off artwork)
5. Remove the intermediate wrapper div that applied frame styles -- render the image directly inside the root container

The result: a black background with the image centered and filling the screen, nothing else.

### Before vs After

**Before**: Padded container, gold/dark border frame, label text at bottom
**After**: Full-screen black background, image fills the space, no text or borders

### Technical Detail

The component simplifies from ~90 lines to ~50 lines. The transition logic (fade/slide/zoom) stays intact -- only the visual decoration is removed. The root container remains `absolute inset-0 bg-black` with the image using `w-full h-full object-contain` to fill the space while preserving aspect ratio.

