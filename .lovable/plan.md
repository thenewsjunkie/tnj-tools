
## Remove Subtitle Line from Leaderboard

### What
Remove the "Top supporters gifting Secret Shows subscriptions" subtitle text from the Secret Shows leaderboard component.

### Change (1 file)

**`src/pages/SecretShowsLeaderboard.tsx`** (lines 112-114)
- Delete the `<p>` element containing the subtitle text
- This single change removes it everywhere the component is rendered: standalone page, Output page, and OBS overlay
