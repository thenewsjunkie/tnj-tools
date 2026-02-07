

# Add Settings and Embed Code to /sstools Page

## Overview
Add the SSToolsAdmin settings panel and an embed code copy button directly to the `/sstools` page, so you can configure and grab the embed code without needing to go to the admin panel.

## Changes

### 1. Update `src/pages/SSTools.tsx`
- Add a toggle/gear icon button in the top-right corner to show/hide the settings panel
- When toggled, show the `SSToolsAdmin` component in a collapsible overlay or panel above the countdown
- Add an "Embed Code" section with a pre-formatted iframe snippet and a "Copy" button
- The embed URL will use the published/preview URL pointing to `/sstools`

### 2. Update `src/components/ss-tools/CountdownBanner.tsx`
- Accept an optional prop to render the settings panel and embed code section below the countdown banner
- Alternatively, keep the banner as-is and layer the admin UI on top in the page component

## Approach
The `/sstools` page will be updated to:
1. Show the countdown banner as the main content (unchanged)
2. Add a small gear icon button (top-right corner) that toggles an admin panel overlay
3. The overlay will contain:
   - The existing `SSToolsAdmin` settings form
   - An "Embed Code" section with a textarea showing the iframe HTML and a copy-to-clipboard button

The iframe embed code will look like:
```html
<iframe src="https://[project-url]/sstools" width="100%" height="200" frameborder="0" style="border:none;"></iframe>
```

## Technical Details

### Modified Files
| File | Change |
|------|--------|
| `src/pages/SSTools.tsx` | Add gear icon toggle, settings panel overlay, and embed code copy section |

### No new files needed
The existing `SSToolsAdmin` component will be reused as-is. The embed code section will be built inline in the page component.

### Implementation Notes
- Uses `navigator.clipboard.writeText()` for copy functionality with a toast confirmation
- Settings panel styled with a semi-transparent dark background to match the page theme
- Gear icon uses `Settings` from lucide-react
- Copy button uses `Copy`/`Check` icons from lucide-react for feedback

