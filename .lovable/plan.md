

## Fix Reading Progress Not Being Restored

### Problem

Reading progress IS being saved to the database correctly. The issue is that it's never loaded back when you reopen a book.

The `useBook` hook tries to join `reading_progress` using Supabase's relation syntax:
```
.select("*, reading_progress(percentage, last_read_at, location)")
```

This only works when there's a **foreign key** from `reading_progress.book_id` to `books.id`. That foreign key doesn't exist, so the join silently returns nothing, and `initialLocation` is always `null`.

### Fix

**1. Add the missing foreign key** (database migration)

Add a foreign key constraint from `reading_progress.book_id` to `books.id` with cascade delete (so deleting a book cleans up its progress).

```sql
ALTER TABLE reading_progress
ADD CONSTRAINT reading_progress_book_id_fkey
FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE;
```

**2. Also add foreign keys for related book tables** (while we're at it)

The same issue likely affects `book_bookmarks`, `book_highlights`, and `book_notes` -- they all reference `book_id` but may lack foreign keys:

```sql
ALTER TABLE book_bookmarks
ADD CONSTRAINT book_bookmarks_book_id_fkey
FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE;

ALTER TABLE book_highlights
ADD CONSTRAINT book_highlights_book_id_fkey
FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE;

ALTER TABLE book_notes
ADD CONSTRAINT book_notes_book_id_fkey
FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE;
```

No code changes needed -- the existing `useBook` query and `EpubReader` component already handle the `initialLocation` correctly. The only issue is the missing database relationship.

### Files

- Database migration only (no code file changes)

