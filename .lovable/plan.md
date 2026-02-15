

## Make Notepad Available at /notepad

### Overview

Create a standalone `/notepad` page that renders the Notepad editor with the same date-aware data loading as the admin Show Prep module. Add navigation links between the two.

### Changes

**1. Create `src/pages/NotepadPage.tsx`**

A standalone page that:
- Reuses the same date selection logic and Supabase loading/saving from ShowPrep (date picker, notepad state, auto-save)
- Renders the `Notepad` component (always open, no toggle)
- Includes a "Back to Admin" link with an ArrowLeft icon in the top corner
- Shows the current date with navigation arrows so users can switch days

**2. Update `src/components/admin/show-prep/Notepad.tsx`**

- Import `Link` from react-router-dom and the `ExternalLink` icon from lucide-react
- Add a small icon-link next to the "Notepad" label in the header that navigates to `/notepad` (using `ExternalLink` icon) -- clicking the icon stops propagation so it doesn't toggle the notepad open/closed

**3. Update `src/components/routing/routes.tsx`**

- Add lazy import for `NotepadPage`
- Add route: `{ path: "notepad", element: <NotepadPage /> }`

### Technical Details

- The standalone NotepadPage will replicate the date-based loading/saving logic from ShowPrep but only for the `notepad` field (no topics, no show prep notes panel)
- The Notepad component itself stays unchanged -- the page wraps it with its own state management
- The `/notepad` route will be public (no AdminRoute wrapper) to allow quick access, matching the pattern of other non-admin pages
- Date navigation uses the same `selectedDate` + `localStorage` persistence pattern from ShowPrep

