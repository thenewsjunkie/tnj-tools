

## Lock VDO.Ninja URL with Emergency Edit

The user wants the VDO.Ninja feed URL to be locked (non-editable) by default, with an emergency override to edit it when needed. Currently the URL is displayed as plain text but can be freely removed/re-added.

### Changes

**File: `src/components/studio/OutputControl.tsx`**

- Add a per-feed `editingVdoUrl` state (tracking which feed index is being edited, or `null`)
- Replace the plain text URL display (line 438) with:
  - **Default (locked)**: Show the URL as truncated text with a small pencil/edit icon button
  - **Editing**: Show an `Input` field pre-filled with the current URL, plus a Save and Cancel button
- When saved, update the feed URL in the config via a new `updateVdoUrl` helper
- Keep add/remove functionality unchanged — this only locks the URL from accidental changes after a feed is added

### Behavior
- URL shows as read-only text by default (current behavior, but now intentionally locked)
- Small edit icon appears on hover or always visible
- Clicking edit reveals an inline input to change the URL
- Save validates the new URL and persists it; Cancel reverts

### Files
- `src/components/studio/OutputControl.tsx` — Add editing state + inline edit UI for VDO.Ninja feed URLs

