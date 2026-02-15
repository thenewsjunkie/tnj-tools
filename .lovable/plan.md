

## Remove Auto-Image, Add Manual Image Upload Button to Rundowns

### What Changes

1. **Remove the automatic Wikipedia image fetch** -- delete the `useEffect` that calls `fetch-topic-image`, and remove the `wikiImage`/`wikiImageLoading` state
2. **Remove the Skeleton loading state** for the auto-fetched image
3. **Show manual images only** -- if the topic already has images in `topic.images`, display the hero image as before
4. **Add a small upload icon button** in the header area (next to the title or below the metadata) that lets you manually add a hero image. Clicking it opens a file picker, uploads the image to Supabase storage, and saves the URL into `topic.images`

### File: `src/pages/RundownPage.tsx`

- Remove `wikiImage` and `wikiImageLoading` state variables
- Remove the `useEffect` block that auto-fetches Wikipedia images (lines 131-152)
- Remove `hasManualImages` and `heroImage` computed values that reference `wikiImage`
- Replace the hero image section with:
  - If `topic.images?.length > 0`: show the existing hero image as before
  - If no images: show a small, subtle button with an `ImagePlus` icon that opens a file input
- Add a hidden `<input type="file">` and handler that:
  - Uploads the selected image to the `show-notes-images` Supabase storage bucket
  - Updates the topic's `images` array in the `show_prep_notes` database record
  - Displays the newly uploaded image as the hero

### Technical Details

- Reuse the existing `show-notes-images` storage bucket (already used by other show prep features)
- On upload, update the topic in `show_prep_notes.topics` JSON by finding the topic by ID and adding the image URL to its `images` array
- Add a remove/delete button on the hero image so you can clear it if needed

