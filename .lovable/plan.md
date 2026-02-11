

## Yahoo Trends: 5 Stories, Below Google

Two small changes:

### 1. `supabase/functions/fetch-trends/index.ts`
Change `trends.slice(0, 10)` to `trends.slice(0, 5)` in `fetchYahooTrends` to only return 5 stories.

### 2. `src/components/admin/show-prep/PrintShowPrep.tsx`
Change the trending layout from side-by-side flex row to a stacked layout -- Google on top, Yahoo below. Remove the `display: flex` wrapper and render them as two separate blocks with a small gap.

### Files changed

| File | Change |
|------|--------|
| `supabase/functions/fetch-trends/index.ts` | Slice Yahoo to 5 instead of 10 |
| `src/components/admin/show-prep/PrintShowPrep.tsx` | Stack Yahoo below Google instead of side-by-side |

