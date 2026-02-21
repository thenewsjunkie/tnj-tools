

## Read Aloud (Audiobook) Feature for the Book Reader

### What You'll Get

A play/pause button in the reader top bar that reads the current page aloud using your browser's built-in text-to-speech. As each page finishes being read, it automatically advances to the next page -- keeping your reading progress in sync just like manual reading. You'll also get speed and voice controls in the settings panel.

### Approach: Browser Speech Synthesis

Using the browser's built-in `SpeechSynthesis` API instead of a cloud TTS service. This is the best fit for book reading because:
- No cost per page (cloud TTS for an entire book would get expensive fast)
- No API keys needed
- Works offline
- Progress tracking works automatically since pages advance through the existing epub navigation

### Changes

**1. `src/components/books/reader/EpubReader.tsx`** -- Expose page text extraction

- Add a `getVisibleText()` method to the `EpubReaderHandle` interface
- This method reads the text content from the currently rendered epub page using `renditionRef.current.getContents()` to access the iframe DOM and extract `innerText`

**2. `src/hooks/books/useReadAloud.ts`** (new) -- Core read-aloud hook

- Manages `SpeechSynthesisUtterance` lifecycle
- State: `isReading`, `isPaused`
- Accepts callbacks: `getVisibleText()`, `onPageFinished()` (to advance to next page)
- When speech ends for a page, calls `onPageFinished` which triggers `epubRef.next()`, waits a brief moment for the page to render, then reads the new page
- Handles play, pause, resume, and stop
- Accepts `rate` (speech speed) and `voiceURI` (selected voice) settings
- Cleans up utterance on unmount

**3. `src/components/books/reader/ReaderTopBar.tsx`** -- Add read-aloud button

- Add a headphones/volume icon button that toggles read-aloud on/off
- Show a different icon when actively reading (e.g., filled vs outline)
- Accept `isReading`, `onToggleReadAloud` props

**4. `src/components/books/reader/ReaderControls.tsx`** -- Add TTS settings

- Add a "Read Aloud" section at the bottom of the settings panel
- Speed slider (0.5x to 2x, default 1x)
- Voice selector dropdown (populated from `speechSynthesis.getVoices()`)
- These settings are passed into the `useReadAloud` hook

**5. `src/pages/books/BookReader.tsx`** -- Wire everything together

- Import and use `useReadAloud` hook
- Pass `epubRef.current?.getVisibleText` and page advance callback
- Add TTS settings state (`rate`, `voiceURI`) alongside existing `ReaderSettings`
- Pass `isReading` and toggle handler to `ReaderTopBar`
- Pass TTS settings to `ReaderControls`
- Stop reading when navigating away or switching panels

### How Progress Tracking Works

No extra work needed. When the read-aloud feature finishes reading a page, it calls `epubRef.next()`. This triggers the existing `relocated` event in `EpubReader`, which already calls `saveProgress()`. So the audiobook position is saved identically to manual reading.

### Technical Details

```text
User clicks Play
  -> useReadAloud calls getVisibleText() 
  -> Creates SpeechSynthesisUtterance with the text
  -> utterance.onend fires when page is done
  -> Calls epubRef.next() to advance
  -> Waits ~500ms for page render
  -> Reads new page text
  -> Loop continues until stopped or book ends

Progress saving happens automatically via the existing
"relocated" event -> saveProgress() flow in EpubReader.
```

### Files

- `src/components/books/reader/EpubReader.tsx` -- Add `getVisibleText()` to handle
- `src/hooks/books/useReadAloud.ts` -- New hook for speech synthesis lifecycle
- `src/components/books/reader/ReaderTopBar.tsx` -- Add read-aloud toggle button
- `src/components/books/reader/ReaderControls.tsx` -- Add speed/voice settings
- `src/pages/books/BookReader.tsx` -- Wire up the hook and pass props

