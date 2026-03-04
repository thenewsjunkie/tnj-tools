

## Add Embed Code Snippets to Music Manager

Currently the Music Manager only copies raw URLs. This will add copyable `<iframe>` embed code for each song and for the full playlist.

### Changes

**File**: `src/components/music/MusicManager.tsx`

1. **Per-song embed**: Change the existing link button's `onClick` to copy an `<iframe>` embed code instead of just the URL. The iframe will point to `/music-embed/{id}` with reasonable defaults (width 100%, height 200px, no border, border-radius).

2. **Playlist embed**: Change the bottom "Copy Playlist Embed URL" button to copy a full `<iframe>` embed code pointing to `/music-embed` instead of just the URL.

3. **Add a `Code` icon** (from Lucide) alongside or replacing the `Link` icon to indicate it's embed code, not just a URL. Update button titles/toasts to say "embed code" instead of "embed URL".

The embed code format will be:
```html
<iframe src="https://tnjtools.com/music-embed/SONG_ID" width="100%" height="200" style="border:0;border-radius:8px;" allowfullscreen></iframe>
```

