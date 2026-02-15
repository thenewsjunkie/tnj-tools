

## Add Media Links Section to Rundown Page

### What it does
Adds a new section below the hero image (and above the full rundown content) where you can paste video URLs (X/Twitter, YouTube, or any platform). Each link will show a thumbnail preview, and clicking it opens the video in a new tab. You can add and remove links.

### Data Storage
Add a new `mediaLinks` field to the `Strongman` type in `src/components/admin/show-prep/types.ts`:

```
interface MediaLink {
  id: string;
  url: string;
  title?: string;
  thumbnail?: string;
}

interface Strongman {
  content: string;
  generatedAt: string;
  prompt?: string;
  mediaLinks?: MediaLink[];
}
```

This keeps media links stored alongside the rundown data in the existing `show_prep_notes` JSON -- no database schema changes needed.

### Thumbnail Fetching
The project already has a `fetch-link-metadata` edge function that:
- Fetches YouTube thumbnails via oEmbed API
- Fetches Twitter/X metadata via oEmbed API  
- Fetches og:image for any other URL

We will call this function when a user pastes a URL to automatically pull the thumbnail and title.

### UI on RundownPage
Between the hero image and rundown content sections, add a "Media" area:
- An input field with an "Add" button to paste a URL
- A horizontal grid of thumbnail cards (aspect-ratio 16:9)
- Each card shows the thumbnail image (or a placeholder icon if none found), the title below, and opens the URL in a new tab on click
- An X button on hover to remove a link
- Cards arranged in a responsive 2-3 column grid

### Files to modify

1. **`src/components/admin/show-prep/types.ts`** -- Add `MediaLink` interface and `mediaLinks` field to `Strongman`

2. **`src/pages/RundownPage.tsx`** -- Add the media links section with:
   - State for the URL input
   - Function to add a link (calls `fetch-link-metadata` for thumbnail/title)
   - Function to remove a link
   - Function to persist changes (similar pattern to existing `updateTopicImages`)
   - Render the media grid between hero image and rundown content

3. **`src/components/rundown/MediaLinksSection.tsx`** (new file) -- Extracted component for the media links UI to keep RundownPage clean. Contains:
   - URL input + Add button
   - Grid of `MediaLinkCard` components
   - Loading state while fetching metadata
   - Each card: thumbnail, title, click-to-open, hover-to-delete
