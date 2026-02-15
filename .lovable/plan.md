

## Fix Rundown Getting Cut Off

### Problem
Rundowns use the `gpt-4o-search-preview` model with `max_tokens: 10000`. This should generally be enough, but with detailed web search citations and the 9-section format requesting "3-5 detailed bullet points per section," responses can exceed that limit -- especially for complex topics with many sources.

### Solution
Increase the `max_tokens` for search mode from `10,000` to `16,000` in the edge function. The `gpt-4o-search-preview` model supports up to 16,384 output tokens, so we should use that full capacity for rundowns.

### Change

**File: `supabase/functions/ask-ai/index.ts`** (line 144)

```
// Before
max_tokens: datasheetMode ? 1000 : isSearchMode ? 10000 : 1500,

// After
max_tokens: datasheetMode ? 1000 : isSearchMode ? 16000 : 1500,
```

One line change, then redeploy the edge function.
