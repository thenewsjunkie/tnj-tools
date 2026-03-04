

## Replace Music Player Logo with Uploaded JPG

### Changes

1. **Copy asset**: Copy `user-uploads://NewsJunkie_AppIcon_1.jpg` to `public/images/newsjunkie-logo.png` (overwrite the broken .ai file)

2. **`src/components/music/MusicPlayer.tsx`**: No code changes needed — the `<img>` already references `/images/newsjunkie-logo.png` with the `onError` fallback. Replacing the file is sufficient.

### Files
- **Copy**: `user-uploads://NewsJunkie_AppIcon_1.jpg` → `public/images/newsjunkie-logo.png`

