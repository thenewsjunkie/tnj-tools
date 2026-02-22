

## Remove /books (Baudible) Feature

Delete all files and routes related to the Baudible e-book reader feature.

### Files to Delete (22 files)

**Pages (4):**
- `src/pages/books/BookReader.tsx`
- `src/pages/books/BooksLibrary.tsx`
- `src/pages/books/BooksSettings.tsx`
- `src/pages/books/BooksUpload.tsx`

**Components (14):**
- `src/components/books/library/BookCard.tsx`
- `src/components/books/library/BookCardMenu.tsx`
- `src/components/books/library/LibraryToolbar.tsx`
- `src/components/books/reader/AudioPlayerBar.tsx`
- `src/components/books/reader/BookmarksList.tsx`
- `src/components/books/reader/EpubReader.tsx`
- `src/components/books/reader/HighlightsPanel.tsx`
- `src/components/books/reader/PdfReader.tsx`
- `src/components/books/reader/ReaderBottomBar.tsx`
- `src/components/books/reader/ReaderControls.tsx`
- `src/components/books/reader/ReaderTopBar.tsx`
- `src/components/books/reader/TableOfContents.tsx`
- `src/components/books/upload/FileDropzone.tsx`
- `src/components/books/upload/MetadataEditor.tsx`

**Hooks (6):**
- `src/hooks/books/useBookmarks.ts`
- `src/hooks/books/useBooks.ts`
- `src/hooks/books/useHighlights.ts`
- `src/hooks/books/useNotes.ts`
- `src/hooks/books/useReadAloud.ts`
- `src/hooks/books/useReadingProgress.ts`

### Files to Modify (1)

**`src/components/routing/routes.tsx`** -- Remove the 4 book routes (`/books`, `/books/upload`, `/books/read/:id`, `/books/settings`) and their lazy imports.

### Database Tables

The following tables will remain in the database but will no longer be used by the app:
- `books`
- `reading_progress`
- `book_bookmarks`
- `book_highlights`
- `book_notes`

These can be dropped later via a migration if desired.

### Note on voiceUtils

`src/utils/voiceUtils.ts` was created for Baudible's read-aloud feature. It will be kept since it contains general-purpose voice utilities, but can be removed too if not needed elsewhere.

