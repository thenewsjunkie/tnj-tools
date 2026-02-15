

## Increase Rundown Length

### Problem
Rundowns are being cut short because `max_tokens` is set to 4,500 for search mode.

### Changes

**File: `supabase/functions/ask-ai/index.ts`** (line 137)

1. Increase `max_tokens` from `4500` to `10000` for search mode (rundown/strongman) -- this gives the model room for all 9 sections plus citations
2. Optionally bump `search_context_size` from `"medium"` to `"high"` so the model gathers more source material before generating the response

That's the only change -- one line, two values. No frontend changes needed.

