

## Baudible Phase 1: E-book Library + Reader

Build the e-book reader portion of Baudible under `/books`, using the existing Supabase backend and auth system.

### Routes

- `/books` -- Library page (grid/list of uploaded e-books, search, sort, filters)
- `/books/upload` -- Upload page (drag-drop EPUB/PDF, metadata editor)
- `/books/read/:id` -- E-book reader (EPUB via epub.js, PDF via pdf.js)
- `/books/settings` -- Baudible settings (reading preferences export)

All routes wrapped in `AdminRoute` so only the authenticated admin can access them.

### Database Tables (Migration)

**books**
- `id` uuid PK
- `title` text NOT NULL
- `author` text
- `description` text
- `cover_url` text
- `language` text DEFAULT 'en'
- `tags` text[] DEFAULT '{}'
- `file_type` text NOT NULL (epub | pdf)
- `file_url` text NOT NULL
- `file_size` bigint
- `checksum` text
- `created_at` timestamptz DEFAULT now()
- `updated_at` timestamptz DEFAULT now()

**reading_progress**
- `id` uuid PK
- `book_id` uuid FK -> books(id) ON DELETE CASCADE
- `location` text (CFI for EPUB, page number for PDF)
- `percentage` float DEFAULT 0
- `last_read_at` timestamptz DEFAULT now()
- UNIQUE(book_id)

**book_bookmarks**
- `id` uuid PK
- `book_id` uuid FK -> books(id) ON DELETE CASCADE
- `location` text NOT NULL (CFI or page)
- `label` text
- `created_at` timestamptz DEFAULT now()

**book_highlights**
- `id` uuid PK
- `book_id` uuid FK -> books(id) ON DELETE CASCADE
- `cfi_range` text NOT NULL
- `color` text DEFAULT 'yellow'
- `text_excerpt` text
- `created_at` timestamptz DEFAULT now()

**book_notes**
- `id` uuid PK
- `book_id` uuid FK -> books(id) ON DELETE CASCADE
- `cfi_range` text (nullable -- can be general note)
- `text` text NOT NULL
- `created_at` timestamptz DEFAULT now()

RLS: authenticated-only for all operations (single admin user).

### Storage

New Supabase storage bucket: `book_files` (private, served via authenticated access).

### New NPM Packages

- `epubjs` -- EPUB rendering with CFI-based position tracking
- `pdfjs-dist` -- PDF rendering

### File Structure

```text
src/
  pages/
    books/
      BooksLibrary.tsx         -- grid/list, search, sort, filters
      BooksUpload.tsx          -- drag-drop upload + metadata editor
      BookReader.tsx           -- EPUB/PDF reader shell
      BooksSettings.tsx        -- export data, reading prefs
  components/
    books/
      library/
        BookCard.tsx           -- cover, title, author, progress bar
        LibraryToolbar.tsx     -- search, sort, view toggle, filters
      upload/
        FileDropzone.tsx       -- drag-drop area
        MetadataEditor.tsx     -- edit title/author/tags/cover after upload
      reader/
        EpubReader.tsx         -- epub.js wrapper with controls
        PdfReader.tsx          -- pdf.js wrapper with controls
        ReaderControls.tsx     -- font, theme, layout toggles
        TableOfContents.tsx    -- TOC drawer
        BookmarksList.tsx      -- bookmark management
        HighlightsPanel.tsx    -- highlights + notes panel
        ReaderTopBar.tsx       -- back button, title, settings icon
      shared/
        ProgressBar.tsx        -- reading progress indicator
  hooks/
    books/
      useBooks.ts             -- CRUD queries for books table
      useReadingProgress.ts   -- save/load progress (debounced)
      useBookmarks.ts         -- bookmark CRUD
      useHighlights.ts        -- highlight CRUD
      useNotes.ts             -- note CRUD
```

### Key Implementation Details

**EPUB Reader (epub.js)**
- Renders reflowable EPUB content
- Stores position as CFI string
- Supports font family (serif/sans), font size, line height, margins
- Themes: light / dark / sepia (CSS injection)
- Paginated vs scroll mode toggle
- TOC from epub.js navigation
- Search within book via epub.js search API
- Tap regions for prev/next on mobile
- Keyboard shortcuts (arrow keys, space) on desktop

**PDF Reader (pdf.js)**
- Page-by-page rendering on canvas
- Stores position as page number
- Zoom controls
- Keyboard navigation

**Progress Saving**
- Debounced save (2 second delay) on location change
- Saves CFI/page + percentage + timestamp
- Optimistic UI updates via React Query

**Upload Flow**
1. User drops EPUB or PDF file
2. Client computes SHA-256 checksum, checks for duplicates
3. File uploaded to `book_files` bucket
4. For EPUB: client-side metadata extraction (title, author, cover from OPF)
5. Metadata editor shown for review/edit
6. Book record inserted into `books` table

**Library Features**
- Grid (cover art cards) and list view toggle
- Search by title/author
- Sort: recently read, title, author, date added, progress
- Filter by tags
- Progress bar on each card

**Export**
- Export all highlights/notes/bookmarks for a single book as JSON
- Export entire library metadata as JSON (from settings page)

### What's Deferred to Phase 2

- Audiobook player (upload, chapters, playback, sleep timer)
- Offline/PWA support
- Brightness overlay slider
- Highlight colors (phase 1 uses single color)
- Password change in settings
- Storage usage overview

