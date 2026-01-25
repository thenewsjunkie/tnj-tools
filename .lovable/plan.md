
## Plan: Replace Hopper Module with Simple Notepad

### Overview
Remove the entire Hopper link-collection feature and replace it with a simple notepad that auto-saves to the database, similar to onlinenotepad.org.

### What You'll Get
A clean, minimalist notepad section that:
- Replaces the "Open Hopper" / "Close Hopper" button
- Auto-saves every 2 seconds (like the rest of Show Prep)
- Has a word counter in the corner
- Persists per-date (each day has its own notes)
- Shows clearly in the collapsible panel

```text
Before (Hopper):
┌─────────────────────────────────────────────┐
│ [     Open Hopper                      ▼]   │
└─────────────────────────────────────────────┘
   (Expandable link collection system)

After (Notepad):
┌─────────────────────────────────────────────┐
│ [     Open Notepad                     ▼]   │
├─────────────────────────────────────────────┤
│                                             │
│   (Large textarea for quick notes)          │
│                                             │
│                              42 words       │
└─────────────────────────────────────────────┘
```

---

### Files to Delete

| File | Reason |
|------|--------|
| `src/components/admin/show-prep/Hopper.tsx` | Core Hopper component (1,462 lines) |
| `src/components/admin/show-prep/CreateTopicDialog.tsx` | Only used by Hopper |
| `src/hooks/useAddToHopper.ts` | Hook for adding to Hopper |

---

### Files to Modify

| File | Change |
|------|--------|
| `src/components/admin/ShowPrep.tsx` | Replace Hopper with Notepad section |
| `src/components/admin/show-prep/PrintShowPrep.tsx` | Remove Hopper-related interfaces and props |
| `src/components/resources/ResourceCard.tsx` | Remove "Add to Hopper" button |
| `src/components/resources/SortableResourceCard.tsx` | Remove `onAddToHopper` prop |

---

### Database Changes

Add a `notepad` column to the existing `show_prep_notes` table:

```sql
ALTER TABLE show_prep_notes 
ADD COLUMN notepad TEXT DEFAULT '';
```

---

### Technical Implementation

**1. ShowPrep.tsx Changes**

Replace Hopper section with a simple collapsible notepad:

```typescript
// State changes
const [isNotepadOpen, setIsNotepadOpen] = useState(false);
const [notepad, setNotepad] = useState("");

// In loadData, add notepad loading:
setNotepad(data.notepad || "");

// In the save effect, add notepad:
notepad: notepad || null,

// Replace the Hopper JSX section:
<div className="w-full border-t border-border pt-4">
  <Button
    variant="outline"
    onClick={() => setIsNotepadOpen(!isNotepadOpen)}
    className="w-full justify-between"
  >
    <span>{isNotepadOpen ? "Close Notepad" : "Open Notepad"}</span>
    {isNotepadOpen ? <ChevronUp /> : <ChevronDown />}
  </Button>
  
  {isNotepadOpen && (
    <div className="mt-4 p-4 bg-muted/50 rounded-lg">
      <Textarea
        value={notepad}
        onChange={(e) => setNotepad(e.target.value)}
        placeholder="Quick notes..."
        className="min-h-[200px] resize-y"
      />
      <div className="text-xs text-muted-foreground text-right mt-2">
        {notepad.trim().split(/\s+/).filter(w => w).length} words
      </div>
    </div>
  )}
</div>
```

**2. PrintShowPrep.tsx Cleanup**

Remove the Hopper interfaces and unused props:

```typescript
// Remove:
interface HopperItem { ... }
interface HopperGroup { ... }

// Update PrintData:
interface PrintData {
  selectedDate: Date;
  topics: { fromTopic: string; toTopic: string; andTopic: string };
  lastMinuteFrom: string;
  rateMyBlank: string;
  potentialVideos: string;
  localTopics: Topic[];
  scheduledSegments: ScheduledSegment[];
  // hopperItems removed
  // hopperGroups removed
}
```

**3. ResourceCard.tsx Cleanup**

Remove the Inbox icon and "Add to Hopper" button:

```typescript
// Remove from interface:
onAddToHopper?: () => void;

// Remove the JSX button for adding to hopper
```

**4. SortableResourceCard.tsx Cleanup**

Remove the `onAddToHopper` prop from the interface and component.

---

### Migration Note

The Hopper database tables (`hopper_items`, `hopper_groups`) will remain in the database - they won't be deleted. This is intentional:
- No data loss
- Tables can be dropped manually later if desired via Supabase dashboard
- Keeps the migration simple and safe

---

### Result

The Show Prep section will have a clean, simple notepad at the bottom for jotting down quick notes during the show. Each day gets its own notepad content that auto-saves with the rest of the show prep data.
