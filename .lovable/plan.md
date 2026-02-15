
## Make Rundown Content Richer and More Detailed

### Problem

The rundown generation is capped at **2,500 tokens** (`max_tokens: 2500` in `ask-ai/index.ts`). That's roughly 1,800 words -- not nearly enough for the prompt which asks GPT to cover 9 detailed sections plus "3 Big Takeaways." The model runs out of room and produces shallow, one-line bullets for each section.

### Solution

Two changes in `supabase/functions/ask-ai/index.ts`:

**1. Increase `max_tokens` from 2,500 to 4,500**

This gives GPT enough room to actually flesh out each of the 9 sections with multiple detailed bullets, quotes, dates, and context. 4,500 tokens is roughly 3,000-3,500 words -- a proper briefing document.

**2. Strengthen the system prompt to demand depth**

Add explicit instructions to the rundown prompt telling the model to be thorough and avoid surface-level summaries. Specifically:
- Add "Write at least 3-5 detailed bullet points per section"
- Add "Do not summarize in one sentence what deserves a paragraph"
- Add "Include specific names, dates, numbers, and quotes wherever possible"

### Files Modified

1. **`supabase/functions/ask-ai/index.ts`**
   - Line 134: Change `max_tokens` for rundown/strongman mode from `2500` to `4500`
   - Lines 56-115: Add depth instructions to the rundown system prompt (e.g., "Write at least 3-5 detailed bullets per section. Be thorough -- this is a full briefing, not a summary.")

### Notes

- This will use slightly more OpenAI tokens per generation (roughly 2x cost per rundown), but the quality improvement should be significant
- Existing rundowns won't change -- only newly generated ones will be longer. Users can regenerate any topic to get the richer version
- The model being used (gpt-4o) is fully capable of producing this level of detail; it was just being cut short by the token limit
