

## Combine Edit and Delete into a Dropdown Menu

Replace the separate Edit (pencil) and Delete (trash) buttons with a single "more actions" button (three-dot/ellipsis icon) that opens a dropdown menu containing both actions. This removes one button from the action bar.

### Change

**File: `src/components/admin/show-prep/TopicCard.tsx`**

1. Add imports for `DropdownMenu`, `DropdownMenuTrigger`, `DropdownMenuContent`, `DropdownMenuItem` from `@/components/ui/dropdown-menu`, and `MoreVertical` from `lucide-react`.
2. Remove the separate Edit/Save toggle button and the Delete button.
3. When in editing mode, keep the Check (save) button visible standalone since the user needs quick access to finish editing.
4. When not editing, replace both Edit and Delete with a single `MoreVertical` dropdown containing:
   - "Edit" menu item with Pencil icon
   - "Delete" menu item with Trash2 icon styled in destructive color
5. Also move "Move to next day" into this same dropdown to save even more space (three actions collapsed into one button).

This reduces the action bar by 1-2 buttons while keeping all functionality accessible.

### Technical Details

```text
Before:  [Strongman] [Take] [Bullets] [Edit] [Arrow] [Delete]
After:   [Strongman] [Take] [Bullets] [Check*] [More ...]
                                                  |-- Edit
                                                  |-- Move to next day
                                                  |-- Delete

* Check button only visible while editing
```

The dropdown trigger uses the same `h-6 w-6 p-0` ghost button styling as the other action buttons for visual consistency.

