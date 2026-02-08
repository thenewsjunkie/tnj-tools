

## Move "Next Day" Arrow to Topic Action Bar

The ArrowRight button currently sits in a separate row at the bottom of every topic card, adding unnecessary vertical height. It will be moved inline with the other action buttons (strongman, take, bullets, edit, delete) in the top-right action bar.

### Change

**File: `src/components/admin/show-prep/TopicCard.tsx`**

1. Remove the standalone bottom section (the `div` with `flex justify-end mt-1` containing the ArrowRight button) -- approximately lines 228-237.
2. Insert the ArrowRight button into the existing action button row, placed just before the delete (trash) button. This keeps it accessible but out of the way, and eliminates the extra vertical row entirely.

The button styling will match the existing action buttons: `h-6 w-6 p-0` ghost variant with muted foreground color.

