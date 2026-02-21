

## Add "Edit Book" to the Book Card Menu

Add an "Edit Details" option to the existing dropdown menu that opens a dialog where you can edit the book's title, author, description, and tags.

### Changes

**1. `src/components/books/library/BookCardMenu.tsx`** -- Add edit dialog

- Add an "Edit Details" menu item with a Pencil icon between "Fetch Cover" and "Delete"
- Add a new Dialog (using the existing `Dialog` component) that opens when "Edit Details" is clicked
- The dialog contains a simple form with inputs for:
  - Title (text input, required)
  - Author (text input)
  - Description (textarea)
  - Tags (text input, comma-separated)
- On save, update the book record in Supabase and invalidate the books query
- The dialog uses `onClick={(e) => e.stopPropagation()}` to prevent card navigation

### Technical Details

- Uses the existing `Dialog` component from `@/components/ui/dialog`
- Uses `Input`, `Label`, and `Textarea` components already in the project
- Updates the `books` table directly via `supabase.from("books").update(...)` -- same pattern as the existing `fetchCover` function
- Tags are stored as `text[]` in the database, so they're split/joined on commas
- No database changes needed -- all editable fields already exist on the `books` table

### Files Modified

- `src/components/books/library/BookCardMenu.tsx` -- Add "Edit Details" menu item and edit dialog

