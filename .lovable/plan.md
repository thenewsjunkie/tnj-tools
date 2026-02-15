

## Rundown Detail Page

### What We're Building

A dedicated full-page view for each topic's rundown (deep dive). When a rundown exists, the user can open it as its own page with a clean, stream-friendly layout. The page will include a back button, the topic name and icon at the top, the full rundown content formatted with clear section headers, and a print summary button.

### Route

`/admin/rundown/:date/:topicId` -- protected by AdminRoute. The date and topic ID identify which topic's rundown to load from the `show_prep_notes` table.

### New Files

**1. `src/pages/RundownPage.tsx`**

The main page component:
- Reads `date` and `topicId` from URL params
- Fetches the `show_prep_notes` row for that date
- Finds the matching topic by ID from the JSONB topics array
- Renders the rundown in a polished, readable layout

Layout structure:
- Top bar: Back to Admin button (left), Print Summary button (right)
- Header section: FileSearch icon + topic title in large text, subtitle showing "Rundown -- Deep Dive", generated date, and the take if one exists
- Content area: The rundown text rendered with proper markdown-to-HTML formatting -- section headers styled with purple left borders, numbered/bulleted lists, bold text, clear spacing between sections
- Dark mode compatible with good contrast
- Max width container (~prose width) centered on the page for readability on stream

The markdown formatting will parse:
- `## Section Headers` into styled h2/h3 with purple accents
- `**bold text**` into strong tags
- Numbered lists (`1. item`) and bullet lists (`- item`)
- Double newlines as paragraph breaks

**2. Update `src/components/admin/show-prep/StrongmanButton.tsx`**

Add an "Open Full Page" button (ExternalLink icon) in the header bar next to Print and Regenerate. When clicked, navigates to `/admin/rundown/{date}/{topicId}`.

This requires passing the `date` prop into `StrongmanButton`.

**3. Update `src/components/admin/show-prep/TopicCard.tsx`**

Pass the `date` prop through to `StrongmanButton`.

**4. Update `src/components/routing/routes.tsx`**

Add the new route:
```
{
  path: "admin/rundown/:date/:topicId",
  element: <AdminRoute><RundownPage /></AdminRoute>
}
```

**5. Update `src/components/admin/show-prep/PrintStrongman.tsx`**

Add a new `printRundownSummary` export -- a shorter, one-page print format that serves as a reminder/reference card rather than the full deep dive. It will include:
- Topic title
- Generated date
- The "3 Big Takeaways" section (extracted from the content if possible)
- A note saying "Full rundown available at /admin"

### Visual Design (Stream-Friendly)

- Dark background with high-contrast text
- Purple accent color for section headers (matching the existing rundown theme)
- Clean typography with generous spacing
- Section headers have a left purple border for visual scanning
- The FileSearch icon displayed prominently at the top
- Responsive but optimized for ~1920x1080 display

### Technical Details

- Data is fetched from `show_prep_notes` by date, then the specific topic is found by matching `topic.id`
- No new database tables or columns needed
- The content formatting logic (markdown to styled HTML/JSX) will be extracted into a shared utility so both the page and the print template can use it
- Uses existing React Query patterns for data fetching
- Uses `useNavigate` for the back button and `useParams` for reading route params

