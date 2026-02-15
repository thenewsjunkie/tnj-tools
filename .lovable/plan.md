

## Scale Up Rundown Text Even Larger

### Changes

**File: `src/pages/RundownPage.tsx`**
- Title: `text-4xl` to `text-5xl`
- Subtitle "Rundown -- Deep Dive": `text-lg` to `text-xl`
- Generated date: `text-base` to `text-lg`
- Take quote: `text-lg` to `text-xl`
- Icon: `h-8 w-8` to `h-10 w-10`

**File: `src/components/rundown/formatRundownContent.tsx`**
- Section headers (h3): `text-2xl` to `text-3xl`
- All body text (bullets, numbered items, paragraphs): `text-xl` to `text-2xl`
- Bullet dot: `text-xl` to `text-2xl`
- Blank line spacers: `h-5` to `h-6`

### Result
Body text will be ~24px (text-2xl), headers ~30px (text-3xl), title ~48px (text-5xl) -- very comfortable on a 1080p stream.

