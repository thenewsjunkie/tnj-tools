

# SS Tools - Secret Shows Countdown Timer

## Overview
Add a new "SS Tools" feature with an embeddable countdown timer that counts down to a configurable weekly Secret Shows live stream. When the countdown expires, it shows a "Start Stream" button linking to the live stream.

## What Will Be Built

### 1. Database Table: `ss_tools_settings`
A settings table to store the configurable day, time, timezone, and stream URL:
- `id` (uuid, primary key)
- `day_of_week` (integer, 0=Sunday through 6=Saturday)
- `time_of_day` (text, e.g. "19:00")
- `timezone` (text, e.g. "America/New_York")
- `stream_url` (text, the link when countdown expires)
- `updated_at` (timestamp)

### 2. Embeddable Countdown Page: `/sstools`
A minimal, dark-themed page matching the mockup:
- Secret Shows logo on the left
- "SECRET SHOWS GOES LIVE IN" text with a red digital countdown (MM:SS or HH:MM:SS)
- "Exclusive live stream - Members only" subtitle
- Red "START STREAM" button that appears/activates when countdown reaches zero
- Designed to be embedded as an iframe on thenewsjunkie.com
- No chrome/navigation -- just the banner widget

### 3. Admin Configuration
In the Admin page, add an "SS Tools" collapsible module where you can:
- Select the day of the week (dropdown)
- Set the time (time picker)
- Set timezone
- Set the stream URL
- Save settings to the database

### 4. Navigation Update
- Replace the "Full Truth" link in TNJ Links with "SS Tools" pointing to `/sstools`

### 5. Logo Asset
- Copy the uploaded Secret Shows logo into `src/assets/secret-shows-logo.png` for use in the countdown widget

## Technical Details

### New Files
| File | Purpose |
|------|---------|
| `src/pages/SSTools.tsx` | Embeddable countdown page |
| `src/components/ss-tools/CountdownBanner.tsx` | The countdown banner component |
| `src/components/ss-tools/SSToolsAdmin.tsx` | Admin settings panel |
| `src/assets/secret-shows-logo.png` | Logo asset |

### Modified Files
| File | Change |
|------|--------|
| `src/components/TNJLinks.tsx` | Replace "Full Truth" link with "SS Tools" link |
| `src/components/routing/routes.tsx` | Add `/sstools` route |
| `src/utils/routeUtils.ts` | Add `/sstools` to OBS/embed exclusion list |
| `src/pages/Admin.tsx` | Add SS Tools admin module |
| Database migration | Create `ss_tools_settings` table |

### Countdown Logic
- Reads `day_of_week`, `time_of_day`, and `timezone` from the database
- Calculates the next occurrence of that weekly time
- Counts down in real-time using `setInterval`
- When timer hits zero, the "START STREAM" button becomes active and links to the configured URL
- Timer then resets to count down to the following week

### Styling
- Dark background with gradient matching the mockup
- Logo positioned on the left side
- Large bold text with red digital-style countdown numbers
- Red gradient "START STREAM" button on the right
- Compact banner format suitable for iframe embedding

