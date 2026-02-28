

## Add Shuffle Mode to Hall of Frame

### What Changes
Instead of cycling through photos in order (1, 2, 3, ..., 10, 1, 2, ...), the slideshow will play photos in a randomized order. Each cycle will show every photo exactly once in a shuffled sequence before reshuffling for the next cycle -- so no photo repeats until all have been shown.

### Changes (1 file)

**`src/pages/HallOfFrame.tsx`**

- Add a `shuffledOrder` state that holds a shuffled array of indices (e.g. `[4, 1, 7, 0, 9, ...]`)
- Add a `posInOrder` state tracking position within the shuffled sequence (instead of `currentIndex` directly indexing `photos`)
- On mount and whenever `photos.length` changes, generate a new shuffled order using Fisher-Yates shuffle
- When advancing, increment `posInOrder`; when it reaches the end of the shuffled array, reshuffle and reset to 0
- The displayed photo becomes `photos[shuffledOrder[posInOrder]]`
- Ensures no photo is shown twice in a row across reshuffles (the last photo of one cycle won't be first of next)

### How It Works

```text
Photos: [A, B, C, D, E]

Cycle 1 (shuffled): [C, A, E, B, D]  -- shows C, A, E, B, D
Cycle 2 (reshuffled, avoiding D first): [B, E, A, C, D]  -- shows B, E, A, C, D
...and so on
```

Each photo gets equal screen time, no repeats until the full set has been displayed.

