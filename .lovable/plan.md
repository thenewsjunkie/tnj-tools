

## Replace Stopwatch with Music Module

### Overview
Remove the Stopwatch from the Admin page and replace it with a Music module. This includes a new database table, storage bucket, upload/manage interface, and an embeddable player page at `/music-embed/:id` for use in OBS or elsewhere.

### Database Changes

**New table: `show_songs`**
- `id` uuid PK
- `title` text NOT NULL
- `artist` text
- `audio_url` text NOT NULL
- `cover_url` text (album art / custom image)
- `duration` double precision
- `display_order` integer DEFAULT 0
- `created_at`, `updated_at` timestamps

**New storage bucket: `show_songs`** (public)

RLS: public read, authenticated insert/update/delete.

### New Files

1. **`src/components/music/MusicManager.tsx`** — Admin component (replaces Stopwatch in the grid). Upload MP3s with optional title/artist/cover image. List existing songs with delete. Each song shows a "copy embed URL" button.

2. **`src/components/music/MusicPlayer.tsx`** — Embeddable player component. Plays a single song or a playlist. Minimal, stylish UI. Will be refined later when you share the custom player image.

3. **`src/pages/MusicEmbed.tsx`** — Route `/music-embed/:id` (or `/music-embed` for all songs). Renders `MusicPlayer` in a clean page suitable for OBS browser source or iframe embedding.

4. **`src/hooks/useShowSongs.ts`** — React Query hook for CRUD on `show_songs` table.

### Admin Page Change

**`src/pages/Admin.tsx`** — Replace Stopwatch import/usage with MusicManager:
```tsx
// Remove: import Stopwatch
// Add: import MusicManager
<CollapsibleModule id="music" title="Music" defaultOpen={false}>
  <MusicManager />
</CollapsibleModule>
```

### Route Addition

Add `/music-embed/:id?` route in the routing config for the embeddable player.

### Embed Flow
- Admin uploads MP3 → stored in `show_songs` bucket → row in `show_songs` table
- Admin copies embed URL (e.g., `/music-embed/abc123`)
- Embed page loads the song and renders the player

