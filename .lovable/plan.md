

## Add Caption Editing to Hall of Frame

Allow editing captions on existing photos in the admin Hall of Frame card.

### Changes

**1. `src/hooks/useHallOfFrame.ts`**
- Add a new `useUpdateHallOfFrameCaption` mutation hook that updates the `caption` column on `hall_of_frame_photos` by photo ID

**2. `src/components/studio/HallOfFrame.tsx`**
- Make the caption text in each `SortablePhoto` item editable -- clicking the caption text turns it into an inline input field
- On blur or Enter, save the new caption via the update mutation
- On Escape, cancel the edit
- Show a pencil icon or similar affordance to indicate editability

### Behavior
- Click the caption text (or a small edit icon) on any photo row to enter edit mode
- An input field replaces the text, pre-filled with the current caption
- Press Enter or click away to save; press Escape to cancel
- Empty input saves as null (removes caption)
- Toast confirmation on successful update

### Technical Notes
- No database changes needed -- the existing RLS policy already allows authenticated UPDATE on `hall_of_frame_photos`
- The mutation simply does `.update({ caption }).eq("id", photoId)`
- Inline editing keeps the UI compact without needing a dialog

