

## Limit OBS Overlay Leaderboard to 10

### Change (1 file)

**`src/pages/OBSOverlay.tsx`**
- Add a wrapper component `OBSLeaderboard` that renders `<SecretShowsLeaderboard limit={10} />`
- Update the `MODULE_COMPONENTS` map to use `OBSLeaderboard` instead of the raw `SecretShowsLeaderboard`

Same pattern already used in `Output.tsx`.

