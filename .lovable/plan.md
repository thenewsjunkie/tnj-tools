

## TelePrompter: Clear Button, Fix Editing, Add Highlight Tool

### Problem
1. No way to clear the script text
2. Editing text jumps cursor to end (every keystroke saves to Supabase, triggers realtime invalidation, resets the textarea)
3. No way to highlight words/phrases with color

### Solution
Replace the plain `<Textarea>` with a **TipTap rich text editor** (already used in the Notepad component) and add a highlight extension. Use local state with debounced saves to fix the cursor issue.

### Changes

**`src/hooks/useTelePrompter.ts`**
- No schema changes needed. The `script` field will now store HTML strings instead of plain text (backward compatible).

**`src/components/studio/TelePrompterControl.tsx`**
- Replace `<Textarea>` with a TipTap editor instance using `StarterKit`, `Underline`, `Placeholder`, and `@tiptap/extension-highlight` (with `multicolor: true`)
- Use **local editor state** with a debounced `save()` (e.g., 500ms) on `onUpdate` to prevent cursor jumps. Only sync external changes back to editor when they differ (same pattern as Notepad).
- Add a **Clear** button (Trash2 icon) next to Play/Reset that sets `script: ""`
- Add a **highlight toolbar row** with 4-5 color swatches (yellow, green, cyan, pink, orange). Clicking a color applies/toggles highlight on the current selection. Add a "remove highlight" button.
- Keep existing speed/fontSize/mirror controls unchanged.

**`src/pages/TelePrompter.tsx`**
- Change from rendering `{script}` as plain text to rendering with `dangerouslySetInnerHTML` so HTML tags (bold, highlights, etc.) display correctly.
- Add CSS for `mark` elements with the highlight colors so they render visibly against the black background.

### Dependencies
- Install `@tiptap/extension-highlight` (new dependency)

### File Summary

| File | Change |
|------|--------|
| `src/components/studio/TelePrompterControl.tsx` | Replace Textarea with TipTap editor, add clear button, add highlight color picker toolbar, debounced saves |
| `src/pages/TelePrompter.tsx` | Render script as HTML with `dangerouslySetInnerHTML`, add highlight color CSS |

