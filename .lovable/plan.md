

## Scale Up Rundown Text to Teleprompter Size

Bump all rundown typography two steps up for maximum on-air readability.

### Size changes

| Element | Current | New |
|---|---|---|
| Page title | text-5xl (48px) | text-7xl (72px) |
| Section headers | text-3xl (30px) | text-5xl (48px) |
| "Big Takeaway" headers | text-3xl (30px) | text-5xl (48px) |
| Body paragraphs | text-2xl (24px) | text-4xl (36px) |
| Bullet points (dot + text) | text-2xl (24px) | text-4xl (36px) |
| Numbered items (number + text) | text-2xl (24px) | text-4xl (36px) |
| Subtitle ("Rundown -- Deep Dive") | text-xl (20px) | text-3xl (30px) |
| Generated date | text-lg (18px) | text-2xl (24px) |
| Take quote | text-xl (20px) | text-3xl (30px) |
| Empty line spacers | h-6 (24px) | h-10 (40px) |

### Files to modify

1. **`src/components/rundown/formatRundownContent.tsx`** -- Update all text size classes in section headers, bullets, numbered items, and paragraphs. Increase spacer height.

2. **`src/pages/RundownPage.tsx`** -- Update the title, subtitle, date, and take text sizes in the header area.

### Technical details

All changes are Tailwind class swaps only -- no logic changes. The content container stays at `max-w-5xl` so lines will wrap more frequently at these larger sizes, which is expected for teleprompter-style reading.
