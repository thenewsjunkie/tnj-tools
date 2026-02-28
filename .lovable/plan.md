

## Fix: Hall of Frame Shuffle Not Advancing

### The Bug
The auto-advance timer never starts. Here's why:

1. On mount, `shuffledOrder` starts as an empty array `[]`
2. The timer effect checks `shuffledOrderRef.current.length <= 1` and exits early (length is 0)
3. The shuffle effect then populates `shuffledOrder` and sets `posInOrder` to 0
4. But `posInOrder` was already 0, so the timer effect's dependency array `[paused, posInOrder]` hasn't changed -- the effect never re-runs
5. Result: the slideshow is permanently stuck on one photo

### The Fix (1 file)

**`src/pages/HallOfFrame.tsx`**

Add `shuffledOrder` to the timer effect's dependency array (line 86):

```
// Before
}, [paused, posInOrder]);

// After
}, [paused, posInOrder, shuffledOrder]);
```

This ensures the timer effect re-runs when the shuffled order is first populated (and on any reshuffle), so the auto-advance timer actually starts.

