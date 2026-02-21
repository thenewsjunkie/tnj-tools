

## Fix: Empty EPUB Reader (blank page when opening a book)

The EPUB reader appears blank because epub.js needs a container with a concrete pixel height to render content. Currently, the viewer div relies on CSS `flex-1` + `h-full`, which can resolve to 0px height since epub.js measures the container before layout completes.

### Root Cause

In `EpubReader.tsx`, the `renderTo` call uses `width: "100%", height: "100%"`, and the container div uses Tailwind `h-full`. In a flex column layout, this chain of percentage heights can collapse to zero before epub.js measures the container. epub.js then creates an iframe with 0 height, rendering nothing visible.

### Fix

**`src/components/books/reader/EpubReader.tsx`**:
1. Replace the percentage-based height with a ref-based approach that measures the container's actual pixel dimensions before calling `renderTo`
2. Alternatively (simpler): use `position: absolute; inset: 0` on the viewer div inside a `relative flex-1` parent, which guarantees concrete dimensions from the parent's flex sizing
3. Add error handling with a visible error state if epub.js fails to load

Specific changes:
- Change the outer wrapper to `relative flex-1 overflow-hidden` (already is)
- Change the viewer div from `w-full h-full` to `absolute inset-0` so it gets concrete pixel dimensions from the positioned parent
- Add a `.catch()` handler on `rendition.display()` to show an error message
- Add a loading indicator while the book is initializing

**`src/pages/books/BookReader.tsx`**:
- Add `.catch()` error handling on the `createSignedUrl` call so failures are surfaced to the user instead of silently leaving `fileUrl` as null (stuck on "Preparing file...")

### Technical Details

```text
Current layout chain (broken):
  div.flex.flex-col.h-screen       -- has height
    ReaderTopBar                    -- shrinks
    div.relative.flex-1             -- gets remaining height via flex
      div.w-full.h-full (viewerRef) -- h-full = 100% of flex-1, but percentage 
                                       height needs explicit parent height, 
                                       not flex-computed height

Fixed layout chain:
  div.flex.flex-col.h-screen
    ReaderTopBar
    div.relative.flex-1
      div.absolute.inset-0 (viewerRef) -- absolute positioning gives concrete 
                                          dimensions from the positioned parent
```

### Files Modified

- `src/components/books/reader/EpubReader.tsx` -- Fix viewer div positioning + add error handling + loading state
- `src/pages/books/BookReader.tsx` -- Add error handling for signed URL generation
