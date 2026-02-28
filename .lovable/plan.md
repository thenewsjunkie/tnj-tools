

## Add Subtract Ability to Subscription Gifters

Allow subtracting gifted subs from a user's count in the admin SecretShowsLeaderboard card.

### Approach

Add a +/- toggle next to the gift count input so you can switch between adding and subtracting gifts from a user's total.

### Changes

**1. `src/components/studio/SecretShowsLeaderboard.tsx`**

- Add a toggle button (or +/- button) next to the number input that switches between "add" and "subtract" mode
- Pass a negative or positive `giftCount` to the mutation based on the mode
- Visual indicator: green/+ for adding, red/- for subtracting

**2. `src/hooks/useSecretShowsGifters.ts`**

- Update `useAddSecretShowsGifter` mutation to handle negative gift counts:
  - When subtracting, clamp `total_gifts` to a minimum of 0 (prevent negative totals)
  - Update the monthly_gifts entry accordingly
  - Toast confirmation will show "Removed X gift(s) from username"

### UI Layout

The form row will change from:

`[Username] [Count] [+]`

to:

`[Username] [Count] [+/-] [Submit]`

Where +/- is a small toggle button that switches between add (green) and subtract (red) modes.

