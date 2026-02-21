

## Fix: EPUB Reader Stuck on "Loading book..."

### Root Cause

The signed URL works for authenticated requests, but epub.js internally uses `XMLHttpRequest` to fetch the file. This request:
1. Does not include the Supabase auth headers
2. May hit CORS restrictions on the private storage bucket

epub.js silently fails to load the file, so `rendition.display()` never resolves and `isReady` stays `false`.

### Solution

Instead of passing the signed URL directly to epub.js, fetch the EPUB file as an `ArrayBuffer` first using the browser's `fetch()` API, then pass the ArrayBuffer to `ePub()`. epub.js supports this — `ePub(arrayBuffer)` works without any external network requests.

### Changes

**`src/pages/books/BookReader.tsx`**:
- Change the signed URL effect to fetch the actual EPUB/PDF file content as an ArrayBuffer (for EPUBs) or keep the signed URL (for PDFs, since pdf.js handles its own fetch fine with public URLs)
- For EPUBs: fetch the signed URL, get the ArrayBuffer, and pass it down
- For PDFs: continue passing the signed URL as before

**`src/components/books/reader/EpubReader.tsx`**:
- Change the `fileUrl` prop to accept either a string URL or an `ArrayBuffer`
- Update the `ePub()` call to use the ArrayBuffer when provided
- Add a timeout fallback so if display hangs for more than 15 seconds, show an error message instead of loading forever

### Technical Details

```text
Current flow (broken):
  BookReader gets signed URL -> passes URL to EpubReader
  EpubReader calls ePub(url) -> epub.js tries to fetch URL via XHR
  XHR fails silently (no auth headers / CORS) -> display() never resolves

Fixed flow:
  BookReader gets signed URL -> fetches ArrayBuffer via fetch()
  BookReader passes ArrayBuffer to EpubReader
  EpubReader calls ePub(arrayBuffer) -> epub.js uses in-memory data
  No network request needed -> display() resolves immediately
```

### Files Modified

- `src/pages/books/BookReader.tsx` — Fetch EPUB as ArrayBuffer before passing to reader
- `src/components/books/reader/EpubReader.tsx` — Accept ArrayBuffer, add loading timeout

