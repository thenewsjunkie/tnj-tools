
## Rename Strongman to Rundown (Deep Dive) with New Prompt

### Overview

Replace the "Strongman" feature with "Rundown" -- a comprehensive deep-dive research tool for topics. This involves renaming labels/icons across the UI, replacing the AI system prompt, and updating the print template.

### Changes

**1. `src/components/admin/show-prep/types.ts`**
- Keep the `Strongman` interface as-is (no data migration needed), but add a type alias or just continue using it internally. The data shape (content, generatedAt, prompt) stays the same -- only labels change.

**2. `src/components/admin/show-prep/StrongmanButton.tsx`**
- Rename the file conceptually (or keep filename, just change UI labels)
- Change icon from `BicepsFlexed` to `Search` (or `FileSearch`, `BookOpen` -- a research-oriented icon)
- Change all UI text: "Strongman Argument" becomes "Rundown" / "Deep Dive"
- Change button title from "Generate strongman argument" to "Generate rundown"
- Change toast messages accordingly
- Change the `strongmanMode` flag in the `ask-ai` call to `rundownMode: true`
- Change the color theme from blue to a distinct color (e.g., purple with `text-purple-500`) to differentiate from Datasheet

**3. `src/components/admin/show-prep/TopicCard.tsx`**
- Update the `StrongmanButton` usage -- the prop name `strongman` stays (data compatibility), but the component will show "Rundown" labels

**4. `supabase/functions/ask-ai/index.ts`**
- Add a new `rundownMode` flag (alongside keeping `strongmanMode` for backward compat, or just replace it)
- Replace the strongman system prompt with the user's deep-dive prompt:
  - Sections: Overview, Timeline, Key Players, Core Issues, Verified Facts vs Claims, Impact/Stakes, Reactions, What Happens Next, Unanswered Questions, 3 Big Takeaways
  - Instruct to include source links, separate facts from claims
- Increase `max_tokens` from 800 to ~2500 since this is a comprehensive breakdown
- The user's topic title will be injected where `[INSERT TOPIC HERE]` appears

**5. `src/components/admin/show-prep/PrintStrongman.tsx`**
- Rename header from "Strongman Argument Analysis" to "Rundown - Deep Dive"
- Change emoji from muscle to magnifying glass or similar
- Update color scheme in print CSS (blue to purple or keep neutral)
- Adjust print styles to accommodate longer content (the deep dive will be multi-page, so remove the one-page constraint)

### Files Modified
1. `src/components/admin/show-prep/StrongmanButton.tsx` -- icon, labels, mode flag
2. `src/components/admin/show-prep/PrintStrongman.tsx` -- header, styling
3. `supabase/functions/ask-ai/index.ts` -- new prompt, increased token limit
4. `src/components/admin/show-prep/TopicCard.tsx` -- minor label updates if needed
