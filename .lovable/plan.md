
## New Module: Art Mode

A new "Art Mode" module that displays uploaded images in an elegant frame style, with configurable display duration and transition effects. It follows the same patterns as the existing Ads module.

### 1. Add Storage Bucket
Create a `art_mode` public storage bucket via SQL migration for storing uploaded art images.

### 2. New Hook: `src/hooks/useArtMode.ts`
- Stores config in `system_settings` under key `studio_art_mode_config`
- Config shape:
  ```text
  ArtModeConfig {
    images: ArtModeImage[]       // { id, imageUrl, label }
    intervalSeconds: number      // display duration per image (default 30)
    permanent: boolean           // if true, no rotation (show first/selected image)
    transition: "fade" | "slide" | "zoom" | "none"  // transition effect
    frameStyle: "gold" | "dark" | "minimal" | "none" // decorative frame style
  }
  ```
- Realtime subscription on system_settings for live updates
- `useArtModeConfig()` query hook + `useUpdateArtModeConfig()` mutation hook

### 3. New Component: `src/components/studio/ArtModeManager.tsx`
Admin card (styled like AdsManager) with:
- Image grid with upload (reusing `upload-show-note-image` edge function) and delete
- Label input for each image
- Interval slider/input (seconds, min 5) with a "Permanent" toggle that locks to the first image
- Transition effect selector (fade/slide/zoom/none)
- Frame style selector (gold/dark/minimal/none)

### 4. New Component: `src/components/studio/ArtModeDisplay.tsx`
Display component for the /output page:
- Full-container image display with `object-contain` to show the entire artwork
- Decorative CSS frame border based on `frameStyle` setting
- Auto-rotation with the selected transition effect
- When `permanent` is true, shows first image without cycling
- Black background for gallery feel

### 5. Register as Studio Module
- **`src/hooks/useOutputConfig.ts`**: Add `"art-mode"` to the `StudioModule` union type and `STUDIO_MODULES` array with label "Art Mode"
- **`src/pages/Output.tsx`**: Import `ArtModeDisplay` and add to `MODULE_COMPONENTS` map
- **`src/pages/OBSOverlay.tsx`**: Same import and registration

### 6. Add Manager to Studio Screen
- **`src/pages/Admin/StudioScreen.tsx`**: Import and render `<ArtModeManager />` alongside the other manager cards

### Files Created
- `src/hooks/useArtMode.ts`
- `src/components/studio/ArtModeManager.tsx`
- `src/components/studio/ArtModeDisplay.tsx`

### Files Modified
- `src/hooks/useOutputConfig.ts` (add "art-mode" to type + modules list)
- `src/pages/Output.tsx` (register component)
- `src/pages/OBSOverlay.tsx` (register component)
- `src/pages/Admin/StudioScreen.tsx` (add manager card)
