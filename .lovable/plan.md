

## Improve Datasheet Regeneration UX

The regenerate flow already shows the section checkboxes and prompt textarea, but it could be much clearer -- especially for correcting wrong results.

### Changes

**File: `src/components/admin/show-prep/DatasheetButton.tsx`**

1. **Better placeholder text on regeneration**: When in editing/regenerate mode, change the textarea placeholder from the generic "Additional context or focus (optional)..." to something like "Clarify or correct the topic (e.g., 'This is the Anna Kepner custody case in Ohio, not the musician')..." so it's obvious this is where you steer the AI.

2. **Show previous prompt if one was used**: When regenerating, if a previous prompt exists, pre-populate the textarea with it (this already happens via the useEffect, but the placeholder should also hint at editing it). Add a small label above the textarea that says "Previous context used" or similar when regenerating with an existing prompt, so the user knows what was sent last time.

3. **Rename the Regenerate button label**: On the refresh icon button in the view mode, add a tooltip that says "Edit and regenerate" instead of just "Regenerate" to make it clear you can change options before re-running.

These are small text/label changes -- no structural or logic changes needed since the edit-before-regenerate flow already works.

