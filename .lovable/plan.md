

## Fix Rundown Save Reliability and Persist System Prompt to Database

### Problem

1. **Rundown not saving**: When a rundown is generated in `StrongmanButton`, it calls `onChange(strongman)` which updates `localTopics` state in `ShowPrepNotes`. But the save is debounced by 1 second. If the React Query cache invalidates or the component re-renders during that window, the `useEffect` that syncs from `noteData` overwrites `localTopics` with stale data, losing the rundown.

2. **System prompt reverting**: The rundown system prompt is stored in `localStorage` (`rundown_system_prompt`), which gets cleared on browser/environment resets.

### Solution

#### 1. Immediate save on rundown generation

Instead of relying on the debounced auto-save, perform an immediate save when a rundown is generated. This means passing a `saveNow` callback down through the component tree so `StrongmanButton` can trigger it after updating the topic.

**Files changed:**
- `src/components/admin/show-prep/ShowPrepNotes.tsx` -- expose an immediate save function and pass it down
- `src/components/admin/show-prep/TopicList.tsx` -- pass-through the save function
- `src/components/admin/show-prep/TopicCard.tsx` -- pass-through to StrongmanButton
- `src/components/admin/show-prep/StrongmanButton.tsx` -- call immediate save after generating rundown

The flow becomes:
1. Rundown generates successfully
2. `onChange(strongman)` updates local state
3. Immediately call `onImmediateSave()` which saves without waiting for debounce

#### 2. Move system prompt to database

Use the existing `system_settings` table (key-value store with JSONB values, already has open RLS) to persist the rundown system prompt.

**Database**: No schema changes needed. The `system_settings` table already exists with `key` (text PK) and `value` (jsonb).

**Files changed:**
- `src/components/admin/show-prep/StrongmanButton.tsx`:
  - Replace `localStorage.getItem/setItem("rundown_system_prompt")` with reads/writes to `system_settings` table using key `"rundown_system_prompt"`
  - Load prompt from DB when the edit dialog opens
  - Save prompt to DB via upsert on save
  - Pass the DB-stored prompt to the edge function instead of from localStorage

### Technical Details

**ShowPrepNotes.tsx changes:**
- Extract `saveNotes` into a stable ref-based function that can be called immediately
- Add a `saveImmediately` function that calls `saveNotes` with current topics right away
- Pass `onSaveImmediately` prop to `TopicList`

**StrongmanButton.tsx changes:**
- Add a new `onSaveImmediately` prop
- After successful rundown generation, call `onChange(strongman)` then `onSaveImmediately()`
- Replace localStorage reads with: `supabase.from("system_settings").select("value").eq("key", "rundown_system_prompt").maybeSingle()`
- Replace localStorage writes with: `supabase.from("system_settings").upsert({ key: "rundown_system_prompt", value: { prompt: systemPromptInput } })`

**TopicList.tsx and TopicCard.tsx:**
- Thread through the `onSaveImmediately` callback prop
