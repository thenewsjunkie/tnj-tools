

## Fix: Wikipedia Image Search Failing for Complex Titles

### Problem

The `fetch-topic-image` edge function searches Wikipedia using the exact topic title (e.g., "Olympic Curling Cheating Controversy"). Wikipedia has no article matching that phrase, so both the direct page summary and search fallback return no results. Meanwhile, simpler queries like "Curling" or "Olympic Curling" return good images.

### Solution

Update `supabase/functions/fetch-topic-image/index.ts` to try progressively simpler search strategies when the full title fails:

1. Try the full title (current behavior)
2. If no image found, try individual significant words from the title (skip common stop words like "the", "a", "controversy", "scandal", etc.)
3. Pick the first result that returns an image

**Example for "Olympic Curling Cheating Controversy":**
- Full title lookup fails
- Search fallback fails  
- Try "Olympic Curling" -- returns a curling image

### Technical Details

**File: `supabase/functions/fetch-topic-image/index.ts`**

After the existing search fallback (which tries the full title), add a keyword extraction step:
- Split the title into words
- Filter out common stop words (the, a, an, of, in, on, for, and, controversy, scandal, etc.)
- Try searching with the remaining keywords joined together
- If still nothing, try just the first 1-2 significant words

This keeps the existing logic intact and only adds extra attempts when the full title yields nothing.

### Files Modified
1. `supabase/functions/fetch-topic-image/index.ts` -- add progressive keyword fallback search
