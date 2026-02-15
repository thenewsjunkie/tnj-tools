

## Add "Edit Prompt" to Edit the Rundown System Prompt

### What This Does
The "Edit Prompt" menu option will open a dialog where you can view and customize the master system prompt that powers all rundown generations -- the one that defines the 9-section format (Overview, Timeline, Key Players, etc.). Your customized prompt is saved locally so it persists across sessions. The existing "Regenerate" option stays as-is for editing the topic/user input.

### How It Works

1. **Store custom prompt in localStorage** under a key like `rundown_system_prompt`
2. **New dialog** with a large textarea pre-filled with the current system prompt (either your saved custom one or the default)
3. **Pass custom prompt to the edge function** via a new `customSystemPrompt` field in the request body
4. **Edge function** checks for that field and uses it instead of the hardcoded rundown prompt
5. **Reset button** in the dialog to restore the default prompt

### Changes

**File: `src/components/admin/show-prep/StrongmanButton.tsx`**
- Add a new `editPromptOpen` state variable
- Change the "Edit Prompt" menu item to open a new dialog (instead of reusing the generate dialog)
- New dialog contains:
  - A large textarea with the saved system prompt (or the default)
  - A "Reset to Default" button
  - A "Save" button that writes to localStorage
- When generating a rundown, read the custom prompt from localStorage and pass it as `customSystemPrompt` in the request body

**File: `supabase/functions/ask-ai/index.ts`**
- Accept a new optional `customSystemPrompt` field from the request body
- When `rundownMode` is true and `customSystemPrompt` is provided, use it instead of the hardcoded prompt template
- The `${prompt}` interpolation in the default system prompt will be handled by inserting the user's topic into the custom prompt if it contains a `{topic}` placeholder, or appending it

### Default Prompt (shown in the editor)
The full rundown prompt currently hardcoded on lines 57-118 of the edge function will be shown as the default, so you can see exactly what it does and tweak any section.

### UI Flow
1. Click rundown icon -> dropdown menu
2. Click "Edit Prompt" -> dialog opens with the full system prompt in a textarea
3. Edit as desired, click "Save" -> stored in localStorage
4. Next time you generate/regenerate a rundown, your custom prompt is used
5. "Reset to Default" button restores the original

### Technical Details

- localStorage key: `rundown_system_prompt`
- The edge function change is minimal: destructure `customSystemPrompt` from the body, and in the `rundownMode` branch, use `customSystemPrompt || defaultPrompt`
- The `{topic}` placeholder pattern lets the prompt reference the user's topic dynamically (e.g., `I'm preparing a breakdown on: {topic}`)
