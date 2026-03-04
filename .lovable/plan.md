

## Restyle Music Player to Match Custom Design

### Reference Analysis
The image shows a horizontal card-style player with:
- **Light background** with subtle rounded border/shadow (skeuomorphic feel)
- **Left**: Square album art / logo
- **Top row**: Art | Title + Artist text | Large circular play/pause button | Small volume control
- **Bottom row**: Current time | Red progress bar with red circle thumb | Duration
- No skip forward/back visible — compact single-track feel

### Changes

**`src/components/music/MusicPlayer.tsx`** — Full restyle:

1. **Layout**: Switch from vertical centered stack to a horizontal card (~max-w-lg). Two rows inside:
   - **Top row**: Square cover art (left), title/artist (middle), play/pause circle button (right), small volume icon+slider (far right)
   - **Bottom row**: elapsed time, red progress slider, total time

2. **Styling**:
   - White/light gray background with rounded-xl, subtle shadow, border
   - Play/pause button: large circular with gray metallic gradient look (CSS `bg-gradient-to-b from-gray-200 to-gray-400` with ring/shadow)
   - Progress slider: red track (`bg-red-600`), red thumb — override Slider styles via className or custom CSS
   - Volume slider: small, to the right of play button
   - Skip buttons: hide when single song, show subtle when playlist

3. **Cover art**: 80x80px square rounded-lg on the left. Falls back to a music note icon.

4. **Slider theming**: Use Tailwind classes on the Slider component or wrap with a styled div to make the track red and thumb a red circle, matching the reference.

### Files Modified
- `src/components/music/MusicPlayer.tsx` — Complete restyle of the JSX and classes

