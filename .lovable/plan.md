

## Embeddable Countdown Timer with Admin Controls

This plan adds two things: a standalone `/timer` page for iframe embedding and a "Countdown Timer" admin module on the existing `/admin` page.

---

### 1. Database: `timer_settings` table

Create a single-row config table to persist timer settings:

| Column | Type | Default |
|--------|------|---------|
| `id` | uuid | `gen_random_uuid()` |
| `target_datetime` | timestamptz | `NULL` |
| `stream_url` | text | `''` |
| `button_label` | text | `'Watch Now'` |
| `logo_url` | text | `NULL` |
| `theme` | text | `'dark'` |
| `created_at` | timestamptz | `now()` |
| `updated_at` | timestamptz | `now()` |

RLS: public SELECT for all, authenticated-only INSERT/UPDATE.

---

### 2. Storage

Use the existing Supabase storage -- create a `timer_logos` public bucket for logo uploads.

---

### 3. `/timer` page (embeddable)

New file: `src/pages/Timer.tsx`

- Fully transparent background (body/html/root all transparent -- handled in `index.html` script by adding `/timer` to the transparency check alongside `/alerts`)
- Fetches settings from `timer_settings` table on mount, subscribes to realtime changes
- Renders countdown blocks: **Days / Hours / Minutes / Seconds** in a clean modern style (big numbers, small labels, card-like blocks with subtle borders)
- Updates every second via `setInterval`
- Shows current local time + timezone abbreviation underneath in small text
- When countdown hits zero: hides countdown, shows a styled button with the configured label linking to `stream_url`
- If `logo_url` is set, shows a centered logo image above the timer (no reserved space if unset)
- Reads `?theme=light|dark` query param to toggle text color (white text for dark, dark text for light; background stays transparent either way)
- System font stack only, no heavy assets
- No scrollbars, no margins on the page-level container
- Added to `OBS_EMBED_ROUTES` in `routeUtils.ts` to exclude GlobalQueueManager

---

### 4. Admin module on `/admin`

New file: `src/components/admin/TimerSettings.tsx`

- Added as a new `CollapsibleModule` on the Admin page
- Shows current server time (fetched from Supabase `now()`) and browser local time with timezone info
- Form fields:
  - **Target date/time** picker (with timezone selector, defaults to America/New_York, stores as UTC)
  - **Stream URL** (validated as valid URL)
  - **Button label** (text input, defaults to "Watch Now")
  - **Logo**: upload to `timer_logos` bucket with preview, or remove
- Save button persists to `timer_settings` (upsert single row)
- **Live preview panel**: an iframe showing `/timer` embedded at ~600x200 so changes can be verified immediately
- Validation: datetime must be valid and in the future, stream URL must be a valid URL, uploaded file must be an image

---

### 5. Routing and headers

- Add `/timer` route in `routes.tsx` (public, no AdminRoute wrapper)
- Add `/timer` to `index.html` transparency script
- Add `/timer` to `OBS_EMBED_ROUTES` in `routeUtils.ts`
- Add `/timer/*` to `_headers` file for CORS/iframe embedding headers

---

### 6. Files to create/modify

| File | Action |
|------|--------|
| **Migration SQL** | Create `timer_settings` table + `timer_logos` bucket |
| `src/pages/Timer.tsx` | **New** -- embeddable countdown page |
| `src/components/admin/TimerSettings.tsx` | **New** -- admin form + preview |
| `src/pages/Admin.tsx` | Add TimerSettings CollapsibleModule |
| `src/components/routing/routes.tsx` | Add `/timer` route |
| `src/utils/routeUtils.ts` | Add `/timer` to OBS_EMBED_ROUTES |
| `index.html` | Add `/timer` to transparency check |
| `public/_headers` | Add `/timer/*` CORS headers |

---

### Example embed snippet (provided in admin UI)

```html
<iframe src="https://YOURDOMAIN/timer" 
  style="width:600px;height:200px;border:0;background:transparent;" 
  scrolling="no" allowtransparency="true">
</iframe>
```

