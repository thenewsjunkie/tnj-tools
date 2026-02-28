

## Autocomplete Username Input for Subscription Gifters

Add typeahead/autocomplete to the username field in the admin SecretShowsLeaderboard card so that typing a name searches existing gifters and lets you select a match to add gifts to their record.

### Changes

**1. Update `src/components/studio/SecretShowsLeaderboard.tsx`**

- Replace the plain `<Input>` for username with a custom autocomplete dropdown
- As the user types, filter the full gifter list (not just top 5) to show matching usernames in a dropdown below the input
- Clicking a suggestion fills the input with that username
- The existing `useAddSecretShowsGifter` hook already handles the upsert logic (checks if username exists and adds to their total), so no backend changes are needed

**2. Update `src/hooks/useSecretShowsGifters.ts`**

- Add a new hook `useAllSecretShowsGifterNames` (or increase the limit on an existing query) to fetch all usernames for autocomplete matching
- This ensures the search works across the full 109-entry dataset, not just the top 5 shown in the preview

### Behavior

- Typing in the username field filters existing gifters by partial match (case-insensitive)
- A dropdown appears below the input showing matching usernames with their current gift count
- Clicking a suggestion populates the input field
- Submitting adds the specified gift count to that user's existing total (already handled by the upsert logic in the hook)
- If no match is found, the user can still type a new name to create a new entry

### Technical Notes

- The autocomplete dropdown will be built with basic React state (no new dependencies needed) -- a filtered list rendered in an absolutely-positioned div below the input
- Uses `onFocus`, `onChange`, and `onBlur` events to show/hide the dropdown
- The existing mutation hook already does upsert (check exists, update or insert), so no database or hook logic changes are required beyond fetching the full username list

