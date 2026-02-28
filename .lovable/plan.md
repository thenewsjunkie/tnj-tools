

## Make Leaderboard Background Transparent

### Problem
The outer container has a solid dark gradient background (`bg-gradient-to-b from-[#0a0a0a] via-[#1a1a2e] to-[#0a0a0a]`), which is visible in OBS. The background should be fully transparent so only the logo, title, and row cards are visible.

### Change (1 file)

**`src/pages/SecretShowsLeaderboard.tsx`** (line 102)
- Remove the `bg-gradient-to-b from-[#0a0a0a] via-[#1a1a2e] to-[#0a0a0a]` classes from the outer container div
- Replace with `bg-transparent`
- The individual leaderboard rows already have their own background (`bg-gradient-to-r from-amber-500/10` for top 3, `bg-white/[0.03]` for others) so they'll retain their subtle card styling against the transparent backdrop
- The logo and title text will float over the transparent background as expected

