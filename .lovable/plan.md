

## Fix: Debounced Save Overwrites DB on Component Remount

### Root Cause

The debounced auto-save fires on every `localTopics` change, including the initial load from React Query cache. When the component remounts (e.g., after a page refresh or navigation), the React Query cache may contain stale data (without the strongman). The flow:

1. Component mounts, `hasLoadedRef = false`
2. React Query provides cached (stale) data -- no strongman
3. `setLocalTopics(staleData)` fires, `hasLoadedRef = true`
4. Debounced save triggers 1 second later, PATCHES DB with stale data -- strongman is lost
5. Fresh DB refetch is ignored because `hasLoadedRef = true`

### Fix

Add a `hasUserEditedRef` flag that starts as `false` and only flips to `true` when the user (or code like StrongmanButton) explicitly changes topics. The debounced save only runs when `hasUserEditedRef.current` is `true`.

### Changes (single file)

**`src/components/admin/show-prep/ShowPrepNotes.tsx`**:

1. Add `hasUserEditedRef = useRef(false)` -- tracks whether topics changed from user action vs initial DB load
2. Reset it to `false` on date change (alongside `hasLoadedRef`)
3. In `handleTopicsChange`, set `hasUserEditedRef.current = true` before calling `setLocalTopics`
4. In the debounced save `useEffect`, skip saving when `!hasUserEditedRef.current`
5. In `handleSaveImmediately`, also update the React Query cache after saving so future cache reads have correct data

This ensures:
- Initial load from cache never triggers an overwrite
- Only explicit user edits or rundown generations trigger saves
- The query cache stays in sync after immediate saves

