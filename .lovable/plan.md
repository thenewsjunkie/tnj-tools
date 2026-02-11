

## Add Yahoo Trending Stories to Show Prep Printout

### What changes

**1. Update `fetch-trends` edge function** to also scrape Yahoo's trending searches from `https://search.yahoo.com/`. The page has bold topic names (e.g., "Nancy Guthrie", "Bad Bunny Super Bowl Show") that can be extracted. Return them alongside Google trends as `yahooTrends: string[]`.

**2. Update `ShowPrep.tsx`** to pass the new `yahooTrends` array into the print document generator.

**3. Update `PrintShowPrep.tsx`**:
- Add `yahooTrends: string[]` to the `PrintData` interface
- Render a compact "Yahoo Trending" section next to (or below) the Google Trends section
- Use a two-column layout for both trend lists side-by-side to save space, with small font (11px) and tight spacing
- Style with a light purple/violet background to distinguish from Google's blue

### Layout in printout (right column)

```text
Scheduled
  9:00 AM  News
  10:00 AM Segment X
  ...

+---------------------------+---------------------------+
| Google Top Searches       | Yahoo Trending            |
| 1. Topic A                | 1. Story A                |
| 2. Topic B                | 2. Story B                |
| ...                       | ...                       |
+---------------------------+---------------------------+
```

Both lists rendered as compact numbered lists at 11px font, side-by-side in a flex row to minimize vertical space.

### Files changed

| File | Change |
|------|--------|
| `supabase/functions/fetch-trends/index.ts` | Add Yahoo scraping, return `yahooTrends` array |
| `src/components/admin/ShowPrep.tsx` | Pass `yahooTrends` to print generator |
| `src/components/admin/show-prep/PrintShowPrep.tsx` | Add `yahooTrends` to interface, render side-by-side with Google trends |

