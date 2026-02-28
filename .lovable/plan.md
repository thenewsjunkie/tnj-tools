

## Fit Top 10 Leaderboard in Output View

### Problem
The leaderboard fetches 20 entries and when rendered in a single Output column, the 10th item gets cut off at the bottom of the viewport.

### Solution (2 files)

**1. `src/pages/SecretShowsLeaderboard.tsx`**
- Accept an optional `limit` prop (default: 20 to preserve standalone behavior)
- Pass that limit to `useSecretShowsGifters(limit)` instead of hardcoded 20
- Use `h-screen flex flex-col` layout so the header (logo + title) takes its natural space and the list fills the remainder equally
- Apply `flex-1` to the list container and `flex-1` to each row so all 10 rows share the available height evenly — no overflow, no cutoff

**2. `src/pages/Output.tsx`**
- Pass `limit={10}` when rendering the leaderboard module
- Since `MODULE_COMPONENTS` maps to plain components, we'll create a small wrapper: `OutputLeaderboard` that renders `<SecretShowsLeaderboard limit={10} />` and use that in the map instead

This keeps the standalone `/secret-shows-leaderboard` page at 20 entries while the Output page shows exactly 10 that fill the viewport perfectly.
