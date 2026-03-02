

## Remove News Alerts Feature

Clean removal of the entire news alerts system across all layers.

### Changes

**1. Delete files**
- `supabase/functions/fetch-news-alerts/index.ts` -- the edge function
- `src/components/studio/overlays/NewsAlertOverlay.tsx` -- the overlay component

**2. Delete deployed edge function**
- Remove `fetch-news-alerts` from Supabase

**3. Database migration**
- Drop the `news_alerts` table
- Remove the `news_alerts_last_tweet_id` row from `system_settings`

**4. Edit `src/pages/Output.tsx`**
- Remove the `NewsAlertOverlay` import
- Remove the polling `useEffect` block (lines ~143-162)
- Remove both `NewsAlertOverlay` render lines (lines ~214 and ~267)

**5. Edit `src/hooks/useOutputConfig.ts`**
- Remove `newsAlert` from the `OverlayConfig` interface (line 27)

**6. Edit `src/components/studio/OutputControl.tsx`**
- Remove the entire "News Alerts" overlay section (the block starting around line 404 with the Newspaper icon, toggle, position selector, poll interval, and Test button)
- Remove the `Newspaper` import from lucide-react

**7. Edit `supabase/config.toml`**
- Remove the `[functions.fetch-news-alerts]` config entry

**8. Edit `src/integrations/supabase/types.ts` and `src/integrations/supabase/types/database.ts`**
- Remove the `news_alerts` table type definitions

**9. Edit `src/index.css`**
- Remove the `slideDown`, `slideUp`, `slideDownOut`, `slideUpOut` keyframes and animation utilities if they were added solely for this feature

**10. Remove `TWITTER_BEARER_TOKEN` secret**
- No longer needed

