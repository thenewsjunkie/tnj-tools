

## Double PiP Size (640px to 1280px)

Change all four PiP container widths from `w-[640px]` to `w-[1280px]` in `src/pages/Output.tsx`.

There are 4 occurrences across two rendering paths (full-screen module mode and standard mode), covering both PiP Left and PiP Right positions. The `aspect-video` class ensures the height scales proportionally.

### Technical Detail

**File: `src/pages/Output.tsx`** -- 4 edits, all identical:
- Lines 216, 225, 278, 287: Replace `w-[640px]` with `w-[1280px]`

No other files are affected.

