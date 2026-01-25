
## Plan: Remove Tags Feature from Topics Module

### What's Being Removed
The tags feature in the Topics module - specifically the dropdown menu button (three-dot icon) that contains the tag management interface.

### Files to Modify

| File | Change |
|------|--------|
| `src/components/admin/show-prep/TopicCard.tsx` | Remove TagButton import, handler, and the entire DropdownMenu containing it |
| `src/components/admin/show-prep/TopicList.tsx` | Remove `allTags` prop from interface and TopicCard usage |
| `src/components/admin/show-prep/ShowPrepNotes.tsx` | Remove `allTags` computation and prop passing |

### Files to Delete

| File | Reason |
|------|--------|
| `src/components/admin/show-prep/TagInput.tsx` | No longer used anywhere in Topics module |

---

### Technical Details

**TopicCard.tsx Changes:**

Remove:
- Import of `TagButton` from `./TagInput`
- Import of `MoreHorizontal` icon (no longer needed)
- Import of `DropdownMenu`, `DropdownMenuContent`, `DropdownMenuItem`, `DropdownMenuTrigger`
- The `allTags` prop from the interface
- The `handleTagsChange` function
- The entire `DropdownMenu` block (lines 298-320)

**TopicList.tsx Changes:**

Remove:
- `allTags: string[]` from the interface
- `allTags={allTags}` prop from TopicCard component

**ShowPrepNotes.tsx Changes:**

Remove:
- The `allTags` computation block (lines 173-176)
- `allTags={allTags}` prop from TopicList component

---

### What's Preserved

- The `tags?: string[]` field in the Topic type (types.ts) - keeping this avoids breaking existing data
- Tag functionality in TopicArchive.tsx - historical topics with tags will still display and be filterable
- No database changes needed

---

### Result

The three-dot dropdown menu button will be completely removed from topic cards, simplifying the UI. The remaining action buttons will be: Strongman, Hot Take, Bullets, Edit/Save, and Delete.
