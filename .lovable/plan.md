

## Auto-Fetch Relevant Image for Rundown Pages

### What We're Building

When a rundown page loads and the topic has no manually-added images, we'll automatically search for a relevant image using the Wikipedia API based on the topic title. The image gets saved back to the topic data so it only fetches once.

### Approach: Wikipedia REST API

Wikipedia's REST API is free, requires no API key, and supports CORS. It can return page summaries with thumbnail images for any search term. This is the simplest and most reliable option.

### Implementation

**1. New Edge Function: `supabase/functions/fetch-topic-image/index.ts`**

A lightweight edge function that:
- Accepts a topic title as input
- Searches Wikipedia's REST API (`/w/api.php?action=query&generator=search...`) for the topic
- Returns the best matching page's main image (original size, not thumbnail)
- Falls back gracefully if no image is found

Wikipedia API call:
```
https://en.wikipedia.org/api/rest_v1/page/summary/{search_term}
```

This returns a JSON response with `originalimage.source` -- a high-res image URL perfect for a hero image.

**2. Update `src/pages/RundownPage.tsx`**

- After the topic data loads, check if `topic.images` is empty
- If empty, call the edge function with `topic.title`
- Display the fetched Wikipedia image as the hero image
- Store the result in local state (no need to persist back -- it fetches fresh each time, which keeps it simple)

The image display will show:
- A loading skeleton while fetching
- The Wikipedia image if found
- Nothing if no image is found (same as current behavior)

**3. No config.toml changes needed**

The edge function can use the default JWT verification since it's called from authenticated admin pages.

Actually, to keep it simple and avoid JWT issues, we'll set `verify_jwt = false` in config.toml.

### Technical Details

- Wikipedia REST API is free and has generous rate limits
- The `/page/summary/` endpoint returns the lead image for any article
- We use the `originalimage` field for high-res images suitable for the hero display
- If the exact title doesn't match, we fall back to a search query using the Wikipedia Action API
- No new secrets or API keys required

### Files Modified
1. `supabase/functions/fetch-topic-image/index.ts` (new) -- Wikipedia image search edge function
2. `supabase/config.toml` -- add verify_jwt config for the new function
3. `src/pages/RundownPage.tsx` -- auto-fetch and display Wikipedia image when no manual images exist
