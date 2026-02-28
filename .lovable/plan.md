

## Hall of Frame - Digital Photo Frame Module

A new module on the Studio Screen page for managing and displaying photos in a slideshow, similar to a Frameo digital photo frame.

### What You Get

**Admin Card (on /admin/studio)**
- Upload photos via file picker or drag-and-drop
- Delete photos
- Reorder photos via drag-and-drop
- Set slideshow interval (seconds between photos)
- Set transition style (fade, slide, zoom)
- Link to the display page

**Display Page (/hall-of-frame)**
- Full-screen photo slideshow with smooth transitions
- Auto-advances based on configured interval
- Pause on click/tap, resume on second click
- Shows photo caption if one exists
- Clean black background, suitable for OBS browser source or a dedicated screen

### Database

New table: `hall_of_frame_photos`
- `id` (uuid, PK)
- `image_url` (text, not null) -- stored in a new `hall_of_frame` storage bucket
- `caption` (text, nullable) -- optional caption overlay
- `display_order` (integer, not null, default 0)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

New table: `hall_of_frame_settings`
- `id` (uuid, PK)
- `interval_seconds` (integer, default 8) -- time between photos
- `transition` (text, default 'fade') -- fade, slide, or zoom
- `updated_at` (timestamptz)

New storage bucket: `hall_of_frame` (public)

RLS: Public SELECT on both tables, authenticated INSERT/UPDATE/DELETE.

### New Files

1. **`src/hooks/useHallOfFrame.ts`** -- hooks for CRUD on photos and settings (useHallOfFramePhotos, useAddHallOfFramePhoto, useDeleteHallOfFramePhoto, useReorderHallOfFramePhotos, useHallOfFrameSettings, useUpdateHallOfFrameSettings)
2. **`src/components/studio/HallOfFrame.tsx`** -- admin card with upload, delete, reorder, and settings controls
3. **`src/pages/HallOfFrame.tsx`** -- the display page with full-screen slideshow

### Modified Files

4. **`src/pages/Admin/StudioScreen.tsx`** -- import and render the HallOfFrame card below SecretShowsLeaderboard
5. **`src/components/routing/routes.tsx`** -- add `/hall-of-frame` route

### Technical Details

- Photo upload uses supabase storage (`hall_of_frame` bucket) with direct client upload
- Drag-and-drop reordering uses `@dnd-kit/sortable` (already installed), updating `display_order` in batch
- Slideshow uses a `useEffect` interval timer, cycling through photos ordered by `display_order`
- Transitions via CSS (opacity fade, translateX slide, or scale zoom) with `transition` duration matching interval
- Settings stored as a single row in `hall_of_frame_settings`, upserted on change
- Real-time subscription on `hall_of_frame_photos` so the display page picks up new uploads immediately without refresh

