

## Fix Rundown View Text Color and Add "Edit Prompt" Menu Option

### 1. Fix text color in View Rundown dialog

The rundown content on line 147 uses a plain `div` with `text-sm` but no explicit text color, so it inherits from the parent and becomes invisible in dark mode. Add `text-foreground` to ensure it's always readable.

**File: `src/components/admin/show-prep/StrongmanButton.tsx`**
- Line 147: Change `<div className="whitespace-pre-wrap text-sm">` to `<div className="whitespace-pre-wrap text-sm text-foreground">`

### 2. Add "Edit Prompt" menu option

Add a new dropdown menu item (with a Pencil icon) that opens the generate dialog pre-filled with the saved prompt, allowing you to tweak and re-run it.

**File: `src/components/admin/show-prep/StrongmanButton.tsx`**
- Add `Pencil` to the lucide-react import (line 4)
- Insert a new `DropdownMenuItem` after "Print" and before "Regenerate" (around line 123):
  ```tsx
  <DropdownMenuItem onClick={() => { setIsRegenerating(true); setGenerateOpen(true); }}>
    <Pencil className="h-4 w-4 mr-2" />
    Edit Prompt
  </DropdownMenuItem>
  ```
  This reuses the same regenerate dialog (which pre-fills the previous prompt) so you can edit the prompt text before hitting Generate.

Two small changes, one file.
