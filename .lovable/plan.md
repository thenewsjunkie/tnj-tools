

## Enhanced Read Aloud: Text Highlighting, Player UI, and Controls

### What Changes

Three major improvements to the audiobook experience:

1. **Live text highlighting** -- Words are highlighted in the book as they're spoken, so you can follow along visually
2. **Dedicated audio player bar** -- A proper media-player-style bar appears at the bottom when reading aloud, with play/pause, stop, skip forward/back, speed control, and voice picker
3. **Inline controls** -- Speed and voice are accessible directly from the player bar instead of buried in the settings panel

---

### Changes

**1. `src/hooks/books/useReadAloud.ts`** -- Add word-boundary tracking

- Use the `SpeechSynthesisUtterance.onboundary` event (fires for each word) to emit the current `charIndex` and `charLength`
- Add a new callback `onWordBoundary(charIndex: number, charLength: number)` that fires as each word is spoken
- Expose the current word position in the hook's return value
- Return `play`, `pause`, and `stop` as separate functions (instead of just `toggle`)

**2. `src/components/books/reader/EpubReader.tsx`** -- Add text highlighting in the iframe

- Add a new imperative method `highlightWord(charIndex: number, charLength: number)` and `clearHighlight()` to the handle
- Implementation: collect all text nodes from the epub iframe's body, walk through them to find the text node + offset matching `charIndex`, create a DOM `Range`, and apply a highlight using a temporary `<mark>` element or CSS custom highlight
- Use a `<mark>` element with a bright background color (theme-aware) that gets removed/replaced on each boundary event
- Add a `clearHighlight()` method that removes any existing mark elements

**3. `src/components/books/reader/AudioPlayerBar.tsx`** (new) -- Floating audio player

- A sleek bar that appears above the bottom bar when reading is active
- Layout:
  - Left: Stop button (square icon), Previous page button, Play/Pause button, Next page button
  - Center: Current chapter label or "Reading aloud..."
  - Right: Speed selector (dropdown with 0.5x, 0.75x, 1x, 1.25x, 1.5x, 2x), Voice selector (dropdown)
- Props: `isReading`, `isPaused`, `onPlay`, `onPause`, `onStop`, `onPrev`, `onNext`, `ttsSettings`, `onTTSChange`, `chapterLabel`
- Styled with a subtle background blur and border, similar to the existing top/bottom bars

**4. `src/components/books/reader/ReaderTopBar.tsx`** -- Simplify

- Remove the read-aloud toggle button from the top bar (it moves to the bottom player bar)
- Add a simple "Start Read Aloud" button that only shows when NOT currently reading (to initiate it)
- When reading is active, the AudioPlayerBar handles all controls

**5. `src/pages/books/BookReader.tsx`** -- Wire up highlighting and new player

- Pass `onWordBoundary` callback from the hook to trigger `epubRef.current.highlightWord()`
- Pass `clearHighlight` when stopping
- Render `AudioPlayerBar` conditionally when `isReading` is true
- Move TTS settings out of the settings panel and into the player bar props
- Keep TTS settings in the settings panel too as a secondary place to configure defaults

**6. `src/components/books/reader/ReaderControls.tsx`** -- Keep TTS section

- Keep the existing TTS settings section in the settings panel (it serves as a "defaults" configuration)
- No major changes needed

---

### How Text Highlighting Works

```text
Speech starts for page text
  -> onboundary fires with charIndex=42, charLength=5
  -> EpubReader.highlightWord(42, 5) is called
  -> Walk all text nodes in iframe body
  -> Sum character lengths until we find the node containing offset 42
  -> Create a Range around that word
  -> Remove previous <mark>, wrap new range in <mark class="tts-highlight">
  -> CSS: .tts-highlight { background: rgba(59, 130, 246, 0.3); border-radius: 2px; }

Page ends -> clearHighlight() removes any <mark> elements
```

### Audio Player Bar Layout

```text
+---------------------------------------------------------------+
| [Stop] [Prev] [Play/Pause] [Next]   "Chapter 3"   [1x v] [Voice v] |
+---------------------------------------------------------------+
```

### Files

- `src/hooks/books/useReadAloud.ts` -- Add `onWordBoundary` callback, expose separate play/pause/stop
- `src/components/books/reader/EpubReader.tsx` -- Add `highlightWord()` and `clearHighlight()` methods
- `src/components/books/reader/AudioPlayerBar.tsx` -- New floating player component
- `src/components/books/reader/ReaderTopBar.tsx` -- Simplify read-aloud button
- `src/pages/books/BookReader.tsx` -- Wire highlighting and new player bar
- `src/components/books/reader/ReaderControls.tsx` -- Minor: keep TTS section as-is

