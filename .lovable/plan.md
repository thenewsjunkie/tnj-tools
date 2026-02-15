

## Fix "View Rundown" Dialog Not Opening

### Problem
When clicking "View Rundown" from the dropdown menu, the dialog doesn't appear. This is a known Radix UI issue where the DropdownMenu (which is modal by default) interferes with the Dialog opening -- the dropdown steals focus back as it closes, causing the dialog to immediately close or never mount.

### Fix

**File: `src/components/admin/show-prep/StrongmanButton.tsx`**

Add `modal={false}` to the `DropdownMenu` component (line 92):

```tsx
<DropdownMenu modal={false}>
```

This single prop change prevents the DropdownMenu from locking focus/pointer-events on the document body, allowing the Dialog to open correctly when triggered from a menu item.

### Why This Works
Radix UI's DropdownMenu defaults to `modal={true}`, which adds a dismissal layer and traps focus. When a menu item triggers a Dialog, the dropdown's cleanup (removing pointer-event locks, restoring focus) races with the Dialog's setup. Setting `modal={false}` avoids this conflict entirely.

