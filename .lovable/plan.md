

## Convert Rundown Button from Pop-up to Dropdown Menu

### Problem
Currently, clicking the rundown icon (FileSearch) immediately opens a large pop-up (Popover) with either a generation form or the full rundown content. You want it to behave like the three-dot menu instead -- showing a compact dropdown with action options.

### Changes

**File: `src/components/admin/show-prep/StrongmanButton.tsx`**

Replace the `Popover` with a `DropdownMenu` that shows contextual options:

**When no rundown exists yet:**
- "Generate Rundown" -- opens the generation pop-up (a separate dialog/popover triggered from the menu item)

**When a rundown already exists:**
- "View Rundown" -- opens the pop-up to read it
- "Open Full Page" -- navigates to `/admin/rundown/{date}/{topicId}`
- "Print" -- triggers the print function
- "Regenerate" -- opens the generation form pre-filled with the previous prompt

### How It Works
1. The main button click opens a `DropdownMenu` (same pattern as the three-dot menu)
2. Menu items trigger specific actions: some navigate directly, others open a secondary `Popover` or `Dialog` for the generation form / content viewer
3. The icon still shows purple when a rundown exists (visual indicator preserved)

### Technical Approach
- Replace the outer `Popover` wrapper with `DropdownMenu`
- Add state (`viewOpen`, `generateOpen`) to control secondary popovers for viewing content and generating
- Keep the existing generation logic and content display, just move them into on-demand dialogs triggered by menu items

