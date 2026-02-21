

## Move Audio Player Bar to Top, Keep Reading Controls on Bottom

### Current Layout
- Top: `ReaderTopBar` (title, nav buttons)
- Bottom: `AudioPlayerBar` (when reading) OR `ReaderBottomBar` (when not reading)

### New Layout
- Top: `ReaderTopBar` (always)
- Below top bar: `AudioPlayerBar` (when reading, sits just under the top bar)
- Bottom: `ReaderBottomBar` (always visible, shows progress/nav regardless of reading state)

### Changes

**File: `src/pages/books/BookReader.tsx`**

Reorder the JSX so:
1. `ReaderTopBar` renders first (unchanged)
2. `AudioPlayerBar` renders directly after `ReaderTopBar` (above the epub content) when `isReading` is true
3. The epub/pdf reader renders in the middle
4. `ReaderBottomBar` always renders at the bottom (remove the `!isReading` condition)

Current structure:
```
<ReaderTopBar />
<EpubReader />
{isReading && <AudioPlayerBar />}
{!isReading && <ReaderBottomBar />}
```

New structure:
```
<ReaderTopBar />
{isReading && <AudioPlayerBar />}
<EpubReader />
<ReaderBottomBar />
```

### Technical Details

- Move the `AudioPlayerBar` block (around lines 161-173) to render between `ReaderTopBar` and the epub/pdf reader
- Change the `ReaderBottomBar` block (around lines 175-182) to always render by removing the `{isEpub && !isReading &&` condition, keeping just `{isEpub &&`
- No changes to `AudioPlayerBar.tsx` or `ReaderBottomBar.tsx` components themselves

