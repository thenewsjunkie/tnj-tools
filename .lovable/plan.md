

## Fix Broken Logo & Add Download Button

### Problem
The logo file at `public/images/newsjunkie-logo.png` is actually an Adobe Illustrator `.ai` file that was renamed to `.png`. Browsers cannot render `.ai` files, so it shows as a broken image.

### Fix

1. **Logo**: Replace the broken `.ai`-disguised-as-`.png` with a proper fallback. The project already has a working logo at `public/images/newsjunkie-logo.png` — but since that file is corrupt, we'll use a Lucide `Music` icon as the fallback, and add an `onError` handler on the `<img>` tag to gracefully degrade. Alternatively, if the user can provide a real PNG/SVG version of the logo, we can swap it in.

2. **Download button**: Add a download button to the `MusicPlayer` component that downloads the current song's MP3 file. Will use an `<a>` tag with `download` attribute, styled as a small icon button below the volume control.

### Files Modified
- `src/components/music/MusicPlayer.tsx` — Add `onError` fallback for the logo image, add a download button (Download icon from Lucide) that links to `currentSong.audio_url` with the `download` attribute.

