
## Make Notepad Date-Independent

### Overview

Decouple the notepad content from the per-date `show_prep_notes` table. Instead, store it in the existing `system_settings` table with a fixed key, so the same notepad content persists regardless of which date is selected.

### Changes

**1. `src/components/admin/ShowPrep.tsx`**

- Remove `notepad` from the per-date `loadData` function (stop reading `data.notepad`)
- Remove `notepad` from the debounced save effect (stop writing `notepad` to `show_prep_notes`)
- Add a separate `useEffect` to load notepad from `system_settings` where `key = 'notepad_content'`
- Add a separate debounced `useEffect` to save notepad to `system_settings` (upsert with key `'notepad_content'`, value as `{ content: notepad }`)
- The notepad loading should not depend on `dateKey` -- it loads once on mount

**2. `src/pages/NotepadPage.tsx`**

- Replace the Supabase load/save logic: read from `system_settings` where `key = 'notepad_content'` instead of `show_prep_notes`
- Remove the date-based save (upsert to `show_prep_notes`)
- Save to `system_settings` with key `'notepad_content'` and value `{ content: notepad }`
- Keep the `DateSelector` removed since it's no longer relevant -- replace the header with just the back link and a "Notepad" title
- Remove the date navigation entirely (no `DateSelector`, no date state)

### Technical Details

- The `system_settings` table already exists with columns: `key` (text, PK), `value` (jsonb), `updated_at`
- RLS on `system_settings` allows all operations (policy: `true`), so no auth issues
- The notepad value will be stored as `{ "content": "<html string>" }` in the `value` jsonb column
- Both ShowPrep and NotepadPage will read/write the same `system_settings` row, keeping them in sync
- The `notepad` column in `show_prep_notes` can remain in the schema (no migration needed) -- it simply won't be used going forward
