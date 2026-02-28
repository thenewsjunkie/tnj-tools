

## Secret Shows Subscription Leaderboard

Build a leaderboard for gifted Secret Shows premium subscriptions, integrated into the Studio Screen with the Secret Shows logo.

### Database

**New table: `secret_shows_gifters`**
- `id` (uuid, PK, default gen_random_uuid())
- `username` (text, not null, unique)
- `total_gifts` (integer, default 0)
- `monthly_gifts` (jsonb, default '{}') -- e.g. {"2026-02": 5}
- `last_gift_date` (timestamptz, nullable)
- `created_at` (timestamptz, default now())
- `updated_at` (timestamptz, default now())

RLS: public SELECT, authenticated INSERT/UPDATE/DELETE.

### Files

**1. Copy logo to project**
- Copy `user-uploads://SECRET_SHOWS_LOGO_1-2.png` to `src/assets/secret-shows-logo.png`

**2. New: `src/components/studio/SecretShowsLeaderboard.tsx`**
- Admin control panel card on Studio Screen
- Shows top 5 gifters in a compact preview with the Secret Shows logo
- "View Full Leaderboard" link to `/secret-shows-leaderboard`
- Buttons to add/edit gifter entries (username + gift count)
- Dark themed card with gold/amber accents matching the Secret Shows branding

**3. New: `src/pages/SecretShowsLeaderboard.tsx`**
- Public-facing page at `/secret-shows-leaderboard`
- Shows top 20 gifters with the Secret Shows logo prominently displayed
- Dark background with a premium, branded look
- Ranked list with gold/silver/bronze styling for top 3
- Displays username, total gifts, and monthly gifts

**4. New: `src/hooks/useSecretShowsGifters.ts`**
- React Query hook to fetch and manage secret shows gifter data
- Functions: fetch top N gifters, add gifter, update gift count

**5. Update: `src/pages/Admin/StudioScreen.tsx`**
- Replace placeholder "Control Panel" with the SecretShowsLeaderboard component
- Import and render the admin leaderboard card

**6. Update: `src/components/routing/routes.tsx`**
- Add route for `/secret-shows-leaderboard` (public, no auth required)

### Visual Design

The leaderboard page will feature:
- The Secret Shows logo centered at the top
- Dark background (#0a0a0a / #1a1a2e gradient)
- Gold (#FFD700) rank numbers for top 3, amber for the rest
- Each row: rank number, username, gift count with a subtle glow effect
- Responsive grid layout

### Studio Screen Control Panel

The admin card will include:
- Secret Shows logo (small)
- Quick-add form: username input + gift count + "Add" button
- Top 5 preview list
- Link to full leaderboard page

