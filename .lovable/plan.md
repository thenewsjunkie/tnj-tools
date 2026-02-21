

## Fix: Timeout fires even after successful book load

### Root Cause

In `EpubReader.tsx`, the 15-second timeout sets an error message unconditionally. It does not check whether `isReady` has already been set to `true`. Since `setError` is called after the book has rendered, it overwrites the working state and hides the content.

### Fix

In the timeout callback, check if the book has already loaded before showing the error. The simplest approach: clear the timeout when `isReady` becomes `true`.

### Changes

**`src/components/books/reader/EpubReader.tsx`**:
- Store the timeout ID in a ref so it persists across renders
- Add a second `useEffect` that clears the timeout when `isReady` becomes `true`
- Alternatively (simpler): in the `.then()` callback of `rendition.display()` where `setIsReady(true)` is called, also call `clearTimeout(timeout)` — but this requires the timeout to be declared before `display()` is called, which it already is after the last edit

Looking at the current code structure: the timeout is declared after `rendition.display().then(() => setIsReady(true))`, so the timeout variable is in scope. The fix is to clear the timeout inside the `.then()` callback.

### Technical Detail

```text
Current flow:
  rendition.display() -> .then(() => setIsReady(true))  // book loads at ~3s
  setTimeout(() => setError("..."), 15000)               // fires at 15s, overwrites

Fixed flow:
  const timeout = setTimeout(() => setError("..."), 15000)
  rendition.display() -> .then(() => { setIsReady(true); clearTimeout(timeout); })
```

The timeout declaration needs to be moved before the `rendition.display()` call, and `clearTimeout(timeout)` added to the `.then()` success handler.

### Files Modified

- `src/components/books/reader/EpubReader.tsx` — Move timeout before display(), clear it on successful load

