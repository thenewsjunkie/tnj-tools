

## Fix: Rundown Page Not Finding Topics

### Problem

The `RundownPage` fetches data from `show_prep_notes` and tries to parse it using the **old hour-based format** (`HourBlock[]`), iterating through `hour.topics`. However, the data was migrated to a **flat format** (`{ topics: [...] }`), so the parsing logic never finds the matching topic.

### Solution

Update the query function in `src/pages/RundownPage.tsx` (lines 108-113) to handle both the new flat format and the old hour-based format for backward compatibility:

**Current (broken):**
```typescript
const hours = data.topics as unknown as HourBlock[];
for (const hour of hours) {
  const found = hour.topics?.find((t: Topic) => t.id === topicId);
  if (found) return found;
}
```

**Fixed:**
```typescript
const rawData = data.topics as unknown;

// New flat format: { topics: [...] }
if (rawData && typeof rawData === "object" && Array.isArray((rawData as any).topics)) {
  const found = (rawData as any).topics.find((t: Topic) => t.id === topicId);
  if (found) return found;
}
// Old hour-based format: { hours: [...] }
else if (rawData && typeof rawData === "object" && Array.isArray((rawData as any).hours)) {
  for (const hour of (rawData as any).hours) {
    const found = hour.topics?.find((t: Topic) => t.id === topicId);
    if (found) return found;
  }
}

throw new Error("Topic not found");
```

Also switch `.single()` to `.maybeSingle()` to avoid errors when no row exists for that date.

### Files Modified
1. `src/pages/RundownPage.tsx` -- fix topic parsing to match current data format
