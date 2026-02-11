

## Shorten Yahoo Trending Headlines

The Yahoo RSS feed returns full article titles which are often very long (e.g., "Nancy Guthrie's family speaks out after tragic accident on Interstate 95"). These need to be truncated to short, punchy headlines.

### Change

**`supabase/functions/fetch-trends/index.ts`** -- Update the `fetchYahooTrends` function to truncate each title to a short headline:
- Truncate at the first colon, dash, or pipe character (common headline separators) to grab just the key subject
- If no separator found, cap at 50 characters with an ellipsis
- This keeps Yahoo items comparable in length to the short Google search terms

Example:
- Before: `"Nancy Guthrie's family speaks out after tragic accident on Interstate 95 — here's what we know"`
- After: `"Nancy Guthrie's family speaks out after tragic..."`
- Or if it has a separator: `"Super Bowl 2025: Bad Bunny halftime show details"` becomes `"Super Bowl 2025"`

Only one file needs to change -- the edge function. The printout template already renders whatever strings it receives.

