

## Move Countdown Timer and Polls into Video Tools Module

Consolidate the admin page by moving the "Countdown Timer" and "Polls" sections into the existing "Video Tools" collapsible module, and shrink the icon buttons so everything fits neatly.

### Changes

**1. `src/components/admin/VideoTools.tsx`**

- Import `AdminPolls`, `TimerSettings`, and the `Link` component from react-router-dom
- Shrink button grid: reduce button height from `h-24` to `h-16`, icon size from `h-8 w-8` to `h-5 w-5`, and text from `text-sm` to `text-xs`
- Add more columns: change grid to `grid-cols-3 sm:grid-cols-4 md:grid-cols-6` so 6 buttons fit in one row on desktop
- Add two new buttons: "Timer" (Clock icon, orange theme) and "Polls" (BarChart icon, purple theme) -- these will expand/collapse their respective settings inline below the button grid
- Below the button grid, conditionally render `<TimerSettings />` and `<AdminPolls />` panels when their buttons are toggled, with a subtle border/background to visually separate them
- The Polls section header will include the external link to `/admin/manage-polls`

**2. `src/pages/Admin.tsx`**

- Remove the standalone "Polls" `<CollapsibleModule>` block (lines 105-121)
- Remove the standalone "Countdown Timer" `<CollapsibleModule>` block (lines 132-139)
- Remove unused imports: `TimerSettings`, `AdminPolls`, `ExternalLink` (if no longer used elsewhere), and the `isPollDialogOpen` / `PollDialog` setup tied to the top-level Poll button can remain as-is since it's a separate quick-action

### Technical Details

- VideoTools will use local `useState` to track which sub-panel (timer/polls) is expanded
- Only one sub-panel open at a time (clicking one closes the other) to keep things tidy
- Button grid gap reduced from `gap-3` to `gap-2` for a tighter layout
- The Polls external link icon moves into the VideoTools component as a small icon button next to the inline Polls header
