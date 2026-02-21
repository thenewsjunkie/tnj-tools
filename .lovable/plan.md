

## Hover Settings Overlay on Book Cards + Fetch Cover Feature

### What You'll Get

When you hover over a book in the library, a settings gear icon will appear. Clicking it opens a small menu with options like "Edit details", "Fetch cover", and "Delete". The "Fetch cover" option will search the Open Library API using the book's title and author to find a cover image, then save it to your book record.

### Changes

**1. `src/components/books/library/BookCard.tsx`** -- Add hover overlay

- In grid view: overlay a semi-transparent dark layer on hover with a settings (gear/ellipsis) icon button in the top-right corner
- Clicking the settings button opens a dropdown menu (using the existing DropdownMenu component) with:
  - "Fetch Cover" (only shown when no cover exists) -- searches Open Library for a cover
  - "Edit" -- navigates to an edit view or opens an inline editor
  - "Delete" -- deletes the book with confirmation
- The overlay button uses `e.stopPropagation()` so clicking it doesn't navigate to the reader
- In list view: show a small ellipsis button on the right side on hover, same dropdown

**2. `src/components/books/library/BookCardMenu.tsx`** (new) -- Extracted dropdown menu component

- Receives `book` prop and callbacks for each action
- Contains the DropdownMenu with menu items
- "Fetch Cover" item calls the Open Library API directly from the client:
  - Searches `https://openlibrary.org/search.json?title=TITLE&author=AUTHOR&limit=1`
  - Extracts the `cover_i` field from the first result
  - Constructs the cover URL: `https://covers.openlibrary.org/b/id/COVER_ID-L.jpg`
  - Updates the book's `cover_url` in Supabase
  - Invalidates the books query to refresh the UI
- "Delete" item shows a confirmation dialog before deleting

**3. No edge function needed** -- Open Library API is free, public, and has no CORS restrictions, so it can be called directly from the browser.

**4. No database changes needed** -- The `books` table already has a `cover_url` column.

### Technical Details

Open Library cover fetch logic:
```text
1. GET https://openlibrary.org/search.json?title={title}&author={author}&limit=1
2. Extract docs[0].cover_i from response
3. If found: cover URL = https://covers.openlibrary.org/b/id/{cover_i}-L.jpg
4. UPDATE books SET cover_url = coverUrl WHERE id = book.id
5. Invalidate ["books"] query
```

The dropdown uses `modal={false}` to avoid focus-trapping conflicts (per existing project pattern). The gear button in the overlay uses `e.stopPropagation()` and `e.preventDefault()` to prevent the parent button's click-to-navigate behavior.

### Files

- `src/components/books/library/BookCard.tsx` -- Add hover overlay with settings trigger
- `src/components/books/library/BookCardMenu.tsx` -- New dropdown menu with Fetch Cover, Edit, Delete actions

