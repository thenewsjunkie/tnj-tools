

## Remove Datasheet Feature from Topics

### Changes

**File: `src/components/admin/show-prep/TopicCard.tsx`**
- Remove the `DatasheetButton` import (line 12)
- Remove the `DatasheetButton` component usage (lines 153-156)

**File: `src/components/admin/show-prep/types.ts`**
- Remove the `Datasheet` interface
- Remove the `datasheet` property from the `Topic` interface

**File: `src/components/admin/show-prep/DatasheetButton.tsx`**
- Delete this file entirely (it's no longer needed)

**File: `src/components/admin/show-prep/PrintDatasheet.tsx`**
- Delete this file entirely (it's no longer needed)

### Notes
- The `ask-ai` edge function still supports `datasheetMode` but that's harmless since nothing will call it with that flag anymore. Leaving it avoids unnecessary edge function redeployment.
- Existing topic data in the database may still have `datasheet` fields in the JSON -- this is harmless and will simply be ignored.

