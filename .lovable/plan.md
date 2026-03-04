

## Move Download Button to Bottom-Right

**File**: `src/components/music/MusicPlayer.tsx`

Move the download `<a>` element from its current standalone centered position to the bottom-right corner of the player card. Change the outer container to `relative` positioning and absolutely position the download button at `bottom-right`, or alternatively place it in a `w-full flex justify-end` wrapper at the bottom of the flex column.

