

## Smoother, Full-Word Text Highlighting

### Problem

The `SpeechSynthesisUtterance.onboundary` event provides `charIndex` (reliable) but `charLength` is frequently `0` or inaccurate across browsers. This causes partial or missing word highlights. Additionally, removing and re-inserting DOM `<mark>` elements every few hundred milliseconds causes visual flickering.

### Solution

Two changes to make highlighting smooth and word-accurate:

**1. Derive word length from the utterance text itself** (`useReadAloud.ts`)

Instead of relying on `e.charLength`, store the full utterance text and extract the word boundary by scanning forward from `charIndex` to the next whitespace/punctuation character. Pass the correct full-word length to `onWordBoundary`.

- Store the utterance text in a ref
- In `onboundary`, use a regex like `/\S+/` starting at `charIndex` to find the full word
- Pass the actual word length instead of `e.charLength`

**2. Use a smoother highlight technique** (`EpubReader.tsx`)

Instead of destroying and recreating `<mark>` elements each time (which causes layout reflow and flicker):

- On first highlight call, inject a `<style>` tag into the iframe with a `.tts-highlight` class that includes a smooth `background-color` transition
- Keep the previous mark element reference; only replace it when the word actually changes
- Add `transition: background-color 0.15s ease` and a slightly larger padding for better readability
- Use `scrollIntoView({ behavior: 'smooth', block: 'nearest' })` on the mark to keep the highlighted word visible in scroll mode

### Technical Details

**File: `src/hooks/books/useReadAloud.ts`**

- Add a `textRef` that stores the current utterance text
- Change the `onboundary` handler:
  ```
  const text = textRef.current;
  const match = text.slice(e.charIndex).match(/^\S+/);
  const wordLength = match ? match[0].length : (e.charLength || 1);
  onWordBoundary(e.charIndex, wordLength);
  ```

**File: `src/components/books/reader/EpubReader.tsx`**

- In `highlightWord`, after creating the `<mark>`, call `mark.scrollIntoView({ behavior: 'smooth', block: 'nearest' })` so the highlighted word stays visible during scrolled reading
- Add a one-time style injection into the iframe document for the `.tts-highlight` class with a subtle transition and padding
- Change the highlight style to use a softer underline + background combo for a less jarring look:
  - `background: rgba(59, 130, 246, 0.2)`
  - `box-shadow: 0 2px 0 0 rgba(59, 130, 246, 0.6)` (underline effect)
  - `transition: all 0.1s ease`
  - `padding: 1px 2px; margin: -1px -2px; border-radius: 3px`

### Files

- `src/hooks/books/useReadAloud.ts` -- Derive full word length from utterance text instead of relying on `e.charLength`
- `src/components/books/reader/EpubReader.tsx` -- Smoother highlight style with transitions, scrollIntoView, and injected CSS

