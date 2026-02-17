

## Fix: Rundown Disappearing Due to React Query Race Condition

### Root Cause

The `useEffect([noteData])` sync in `ShowPrepNotes.tsx` unconditionally overwrites `localTopics` whenever React Query refetches data. With the default `staleTime` of 0, a background refetch can return stale DB data (before the save completes), wiping out the just-generated rundown.

### Solution

Make `localTopics` the source of truth after initial load. Only sync from DB on initial load or date change -- not on every refetch.

### Changes

**`src/components/admin/show-prep/ShowPrepNotes.tsx`**

1. Add a `hasLoadedRef` that tracks whether initial data has been synced for the current date.
2. Reset `hasLoadedRef` to `false` when `dateKey` changes.
3. In the sync `useEffect`, only set `localTopics` from `noteData` when `!hasLoadedRef.current`. After the first sync, mark it as loaded.
4. This prevents background refetches from overwriting local edits or in-flight saves.

```text
Before (simplified):
useEffect(() => {
  if (noteData) {
    setLocalTopics(parse(noteData.topics));  // runs on EVERY refetch
  }
}, [noteData]);

After (simplified):
useEffect(() => {
  if (hasLoadedRef.current) return;  // skip after initial load
  if (noteData) {
    setLocalTopics(parse(noteData.topics));
    hasLoadedRef.current = true;
  } else if (noteData === null && !isLoading) {
    setLocalTopics([]);
    hasLoadedRef.current = true;
  }
}, [noteData, isLoading]);

// Reset on date change
useEffect(() => {
  hasLoadedRef.current = false;
}, [dateKey]);
```

This is a minimal, targeted fix. No other files need to change.
