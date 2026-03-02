

## Hide Mouse Cursor on Output Page

Add a CSS rule to hide the mouse cursor on the `/output` page after it loads, so the TV display looks clean.

### Change

**Edit `src/pages/Output.tsx`**
- Add a `useEffect` that sets `document.body.style.cursor = 'none'` on mount and restores it on unmount.

This is a single-line addition. The cursor will be hidden as soon as the Output page loads and restored when navigating away.

