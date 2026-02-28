

## Fix: Hall of Frame Showing Deleted Photos in OBS Overlay

### Problem
When photos are deleted from the admin, the Hall of Frame slideshow (used in OBS Overlay) continues trying to display them. This happens because:

1. The `shuffledOrder` array stores indices into the `photos` array, but it only regenerates when `photos.length` changes
2. If the query refetches while the slideshow is mid-cycle, the `posInOrder` state can point to an index that maps to a photo that no longer exists
3. The realtime subscription correctly invalidates the query, but the shuffle state is not properly synchronized with the new data

### Fix

**`src/pages/HallOfFrame.tsx`** -- Two changes:

1. **Use `photos` (not just `photos.length`) as the dependency for shuffled order regeneration.** Currently the effect at line ~60 uses `photos.length` as its dependency. If 3 photos become 3 different photos (unlikely but possible), or if the data updates in a way that length stays the same, the indices become stale. Change dependency to a stable key derived from the photo IDs.

2. **Add a safety guard for out-of-bounds indices.** If `shuffledOrder` references an index >= the current `photos.length`, reset to 0 and regenerate the shuffle. This is the defensive fix that prevents broken images even during race conditions.

### Technical Detail

```text
Current flow (broken):
  photos.length changes -> regenerate shuffledOrder -> reset posInOrder to 0
  BUT: posInOrder can advance BEFORE the effect runs, pointing to a stale index

Fixed flow:
  photos (by ID) changes -> regenerate shuffledOrder -> reset posInOrder to 0
  PLUS: before rendering, if currentIndex >= photos.length, clamp to 0
  PLUS: if photo at currentIndex is undefined, skip rendering
```

### Changes

**`src/pages/HallOfFrame.tsx`**
- Change the `useEffect` dependency from `photos.length` to a string of joined photo IDs (e.g., `photos.map(p => p.id).join(',')`) so that any change in the photo list triggers a reshuffle
- Add a bounds check: if `currentIndex >= photos.length`, immediately reset `posInOrder` to 0 and regenerate the shuffle
- Keep the existing `if (!photo) return null` guard as a final safety net

This is a small, targeted fix -- no new files, no database changes.

