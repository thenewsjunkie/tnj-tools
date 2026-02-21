

## Auto-Extract EPUB Cover Art and Metadata on Upload

Currently, when you upload an EPUB, Baudible only grabs the filename as the title. It never opens the EPUB to read metadata (title, author, description, cover image). This plan adds client-side EPUB parsing during the upload step.

### What Changes

**`src/pages/books/BooksUpload.tsx`** — After the user drops/selects an EPUB file:
1. Use `epubjs` to open the file as an `ArrayBuffer`
2. Extract metadata from the OPF package: title, author (creator), description
3. Extract the cover image from the EPUB (epub.js provides `book.coverUrl()`)
4. Upload the extracted cover image to the `book_files` bucket (as a separate image file)
5. Pre-fill the metadata editor with the extracted title, author, description, and cover preview
6. Save the `cover_url` when creating the book record

**`src/components/books/upload/MetadataEditor.tsx`** — Add:
- A cover image preview (if extracted or manually uploaded)
- An optional "Upload cover" button for manual override

**`src/hooks/books/useBooks.ts`** — The `useCreateBook` mutation already supports `cover_url`, so no change needed there.

**`src/components/books/library/BookCard.tsx`** — Already handles `cover_url` display, but covers are stored in the private `book_files` bucket. Need to generate signed URLs for cover images the same way book files are served, OR upload covers to a public bucket. Simplest approach: upload cover images to the existing public bucket or make a small `book_covers` public bucket.

### Technical Details

```text
Upload Flow (updated):

1. User drops EPUB file
2. epubjs opens the file in-memory (no server needed)
3. Extract: book.packaging.metadata -> title, creator, description
4. Extract: book.coverUrl() -> blob URL of cover image
5. Convert cover blob to File, upload to storage as `covers/{uuid}.jpg`
6. Pre-fill metadata form with extracted values + cover preview
7. User reviews/edits, clicks "Add to Library"
8. Book record saved with cover_url pointing to uploaded cover
```

### Storage for Covers

Create a new **public** `book_covers` bucket (or reuse `book_files` and make covers accessible via signed URL). A public bucket is simpler since covers are not sensitive and avoids signed URL overhead for the library grid.

### Migration

One SQL migration to create the `book_covers` public storage bucket with appropriate policies.

### Files Modified

- `src/pages/books/BooksUpload.tsx` — Add EPUB metadata extraction logic
- `src/components/books/upload/MetadataEditor.tsx` — Add cover preview and manual cover upload
- `src/components/books/library/BookCard.tsx` — Use public cover URL (may need minor adjustment)
- New migration for `book_covers` bucket

### Edge Cases

- PDFs: No automatic cover extraction (pdf.js can render page 1 as a thumbnail — deferred for now, but worth noting)
- EPUBs without embedded covers: Gracefully skip, show default icon
- Large cover images: Resize client-side before upload (optional optimization)
