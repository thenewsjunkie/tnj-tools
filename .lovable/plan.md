

## Reduce Space Under Logo

The logo container has `mb-4 sm:mb-8` (16px / 32px margin-bottom), which creates noticeable gap before the title. Since the subtitle was just removed, this spacing feels even more pronounced.

### Change (1 file)

**`src/pages/SecretShowsLeaderboard.tsx`** (line 105)
- Change `mb-4 sm:mb-8` to `mb-2 sm:mb-4` on the logo wrapper div, cutting the gap in half

