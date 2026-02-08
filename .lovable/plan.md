

## Show Prep Printout Updates

Three changes: remove Main Character, sort scheduled segments, and add Google Trending Searches.

### 1. Remove "Today's Main Character" from printout
Remove the yellow box and its CSS from `PrintShowPrep.tsx`.

### 2. Sort scheduled segments by time
Update `getAllScheduledSegments` in `scheduledSegments.ts` to sort results using the same `parseTime` logic already in `getScheduledSegments`. Currently it filters but doesn't sort.

### 3. Add Google Top Searches to the printout

**New edge function: `fetch-trends/index.ts`**
- Standalone edge function that hits the Google Trends daily trends API (same approach already used in `fetch-news/trends.ts`)
- Returns top 10 trending search queries for the US in the last 24 hours
- No API keys needed -- uses the public Google Trends endpoint
- CORS-enabled so it can be called from the frontend

**Update `ShowPrep.tsx` `handlePrint`**
- Call the `fetch-trends` edge function before generating the print document
- Pass the results into `generatePrintDocument`

**Update `PrintShowPrep.tsx`**
- Add `googleTrends: string[]` to the `PrintData` interface
- Render a numbered list of top 10 Google searches below the Scheduled section in the right column
- Styled with a light blue background to distinguish it from scheduled segments

### Files changed

| File | Change |
|------|--------|
| `supabase/functions/fetch-trends/index.ts` | New edge function |
| `supabase/config.toml` | Add `[functions.fetch-trends]` with `verify_jwt = false` |
| `src/components/admin/show-prep/scheduledSegments.ts` | Add sort to `getAllScheduledSegments` |
| `src/components/admin/show-prep/PrintShowPrep.tsx` | Remove Main Character, add Google Trends section |
| `src/components/admin/ShowPrep.tsx` | Fetch trends data in `handlePrint` |

