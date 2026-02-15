

## Make Rundown Text Stream-Readable

### Problem
The rundown page text is too small for live stream viewers to read comfortably.

### Changes

**File: `src/pages/RundownPage.tsx`**
- Increase the title from `text-2xl` to `text-4xl`
- Increase "Rundown -- Deep Dive" subtitle and generated date text sizes
- Increase the "Take" quote text size
- Widen the max-width container from `max-w-4xl` to `max-w-5xl` for better use of screen space
- Increase padding for more breathing room

**File: `src/components/rundown/formatRundownContent.tsx`**
- Section headers (`h3`): from `text-lg` to `text-2xl`
- Bullet points and numbered items: from default size to `text-xl`
- Regular paragraphs: from default to `text-xl`
- Increase vertical spacing between elements (`h-3` spacers to `h-5`, `mt-6` to `mt-8`)
- Increase bullet/number text to match

### Result
All body text will be roughly 20px+ (text-xl), headers 24px+ (text-2xl), and the title 36px+ (text-4xl) -- comfortably readable on a 1080p stream.

