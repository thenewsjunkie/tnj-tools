

## News Alerts Overlay from @cnnbrk on X

### How will we know when new posts arrive?

Twitter/X API does **not** offer free webhook-style push notifications. The practical approach is **polling** -- an edge function fetches the latest tweets from @cnnbrk every 30-60 seconds, compares against the last seen tweet ID stored in `system_settings`, and flags new ones. The Output page subscribes to a Supabase table via realtime to instantly display new alerts as they're detected.

This means there's a ~30-60 second delay between a tweet being posted and it appearing on screen, which is standard for this kind of integration.

### Prerequisites

You'll need **Twitter/X API credentials** (Bearer Token). You currently don't have any `TWITTER_` secrets configured. You'll need to create a Twitter Developer App at [developer.x.com](https://developer.x.com) and get a Bearer Token.

### Architecture

```text
[Cron / Frontend Poll]
        |
        v
[Edge Function: fetch-news-alerts]
  - Calls X API: GET /2/users/:id/tweets
  - Compares against last_seen_tweet_id in system_settings
  - Inserts new tweets into a news_alerts table
        |
        v
[Supabase Realtime]
        |
        v
[NewsAlertOverlay component on Output page]
  - Subscribes to news_alerts table
  - Animates new alerts with a ticker/banner style
```

### Implementation Steps

**1. Add Twitter Bearer Token secret**
- Request the user's X/Twitter Bearer Token and store it as `TWITTER_BEARER_TOKEN`.

**2. Create `news_alerts` database table**
- Columns: `id`, `tweet_id` (text, unique), `text` (text), `author` (text), `created_at`, `displayed` (boolean, default false)
- RLS: public read access (it's for the overlay display)

**3. Create edge function `fetch-news-alerts`**
- Fetch latest tweets from @cnnbrk using X API v2 (`GET https://api.x.com/2/users/by/username/cnnbrk` to get user ID, then `GET https://api.x.com/2/users/:id/tweets?max_results=5&since_id=...`)
- Store last seen tweet ID in `system_settings` under key `news_alerts_last_tweet_id`
- Insert any new tweets into `news_alerts`
- Also support a `?test=true` query param that just returns the latest tweet for testing

**4. Update `OutputConfig` types**
- Add `newsAlert` to the `OverlayConfig` interface: `{ enabled: boolean; position: "top" | "bottom"; pollInterval?: number }`

**5. Create `NewsAlertOverlay` component**
- Positioned at top or bottom of the Output screen
- Subscribes to `news_alerts` table via Supabase realtime
- On new row: animate a breaking news banner sliding in, display for ~15 seconds, then slide out
- Styled with a red "BREAKING NEWS" label and the tweet text scrolling/displayed

**6. Add controls to `OutputControl.tsx`**
- Under the Clock overlay section, add a "News Alerts" toggle with position selector (top/bottom)
- Add a "Test" button that calls the edge function with `?test=true` and inserts a sample alert
- Add a poll interval input (default 60 seconds)

**7. Frontend polling**
- The Output page will call the edge function on an interval (configurable, default 60s) to check for new tweets
- Alternatively, set up a pg_cron job to call the edge function automatically

**8. Render in Output page**
- Import and render `NewsAlertOverlay` alongside `ClockOverlay` when enabled

### Files to Create/Modify

| File | Action |
|------|--------|
| `supabase/functions/fetch-news-alerts/index.ts` | Create - edge function for X API polling |
| `supabase/config.toml` | Edit - add config for fetch-news-alerts |
| `src/components/studio/overlays/NewsAlertOverlay.tsx` | Create - the overlay display component |
| `src/components/studio/OutputControl.tsx` | Edit - add news alert controls + test button |
| `src/hooks/useOutputConfig.ts` | Edit - add newsAlert to OverlayConfig type |
| `src/pages/Output.tsx` | Edit - render NewsAlertOverlay |
| Database migration | Create `news_alerts` table |

### Key Trade-off

Polling every 60 seconds means tweets appear within ~1 minute of being posted. This is the best we can do without an enterprise-level Twitter API plan. The test button lets you verify the overlay works immediately without waiting for a real tweet.

