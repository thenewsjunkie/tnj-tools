

## Complete EPUB Reading Experience

The book loads but there are no visible controls, no way to navigate chapters, and several panel features are disconnected. Here's everything that needs to be fixed.

### Problems Found

1. **No visible page navigation** -- only invisible tap zones on left/right edges; no prev/next buttons
2. **No progress indicator** -- no way to see how far into the book you are
3. **Table of Contents doesn't navigate** -- clicking a chapter just closes the panel without going there
4. **No TOC or Highlights buttons** in the top bar -- only Bookmarks and Settings are accessible
5. **Bookmarks don't navigate** -- clicking a bookmark closes the panel but doesn't jump to the location
6. **No way to add a bookmark** at the current position
7. **EpubReader doesn't expose its rendition** -- external components (TOC, bookmarks, highlights) can't trigger navigation

### Solution

**1. Expose rendition from EpubReader via a ref**

Add a `React.useImperativeHandle` to EpubReader so the parent (BookReader) can call `navigateTo(cfi)` and `getCurrentLocation()` on it. This enables TOC, bookmarks, and highlights panels to navigate.

**2. Add a bottom control bar with:**
- Previous/Next page buttons (visible, always available)
- A progress bar showing current percentage
- Current chapter label (from TOC)
- Page indicator (e.g., "42%")

**3. Fix the top bar to include all panel toggles:**
- Add a Table of Contents button (List icon)
- Add a Highlights/Notes button (Highlighter icon)
- Add a "Bookmark this page" button that saves the current CFI location
- Keep existing Settings button

**4. Wire up TOC navigation:**
- When a TOC item is clicked, call `readerRef.navigateTo(href)` then close the panel

**5. Wire up Bookmark navigation:**
- When a bookmark is clicked, call `readerRef.navigateTo(location)` then close the panel

**6. Wire up Highlight navigation:**
- When a highlight is clicked, call `readerRef.navigateTo(cfi)` then close the panel

**7. Progress memory already works** via the `relocated` event handler and `useSaveProgress` hook -- the CFI is saved on every page turn and restored on load via `initialLocation`

### Files to Create/Modify

- **`src/components/books/reader/EpubReader.tsx`** -- Add `forwardRef` with imperative handle exposing `navigateTo()` and `getCurrentCfi()`. Add visible prev/next buttons at bottom edges.

- **`src/components/books/reader/ReaderBottomBar.tsx`** (new) -- Bottom control bar with prev/next buttons, progress percentage, and chapter name.

- **`src/components/books/reader/ReaderTopBar.tsx`** -- Add TOC, Highlights, and Add Bookmark buttons alongside existing Bookmarks and Settings buttons.

- **`src/pages/books/BookReader.tsx`** -- Create a ref to EpubReader, wire up TOC/bookmark/highlight navigation callbacks, pass progress state down to bottom bar, add Add Bookmark handler using current CFI.

### Technical Details

EpubReader imperative handle:
```text
useImperativeHandle(ref, () => ({
  navigateTo: (target: string) => renditionRef.current?.display(target),
  getCurrentCfi: () => currentCfiRef.current,
}));
```

Bottom bar receives `percentage` (0-100) and `chapterLabel` from the `relocated` event, which already fires on every page turn.

Top bar buttons:
```text
[Back] [Title...] [TOC] [Highlights] [Add Bookmark] [Bookmarks] [Settings]
```

Navigation flow for TOC/Bookmarks/Highlights:
```text
User clicks item in panel
  -> parent calls readerRef.current.navigateTo(cfi_or_href)
  -> panel closes
  -> relocated event fires -> progress saved
```
