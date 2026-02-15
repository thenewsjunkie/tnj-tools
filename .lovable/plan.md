

## Scale Rundown Text Down One Step

Roll back the typography one Tailwind size step from the current "two steps up" to "one step up."

### Size changes

| Element | Current | New |
|---|---|---|
| Page title | text-7xl (72px) | text-6xl (60px) |
| Section headers | text-5xl (48px) | text-4xl (36px) |
| "Big Takeaway" headers | text-5xl (48px) | text-4xl (36px) |
| Bold section headers | text-5xl (48px) | text-4xl (36px) |
| Body paragraphs | text-4xl (36px) | text-3xl (30px) |
| Bullet points | text-4xl (36px) | text-3xl (30px) |
| Numbered items | text-4xl (36px) | text-3xl (30px) |
| Subtitle | text-3xl (30px) | text-2xl (24px) |
| Generated date | text-2xl (24px) | text-xl (20px) |
| Take quote | text-3xl (30px) | text-2xl (24px) |
| Empty line spacers | h-10 (40px) | h-8 (32px) |

### Files to modify

1. **`src/components/rundown/formatRundownContent.tsx`** -- Swap all text size classes down one step and reduce spacer from h-10 to h-8.
2. **`src/pages/RundownPage.tsx`** -- Swap title, subtitle, date, and take text sizes down one step.

All changes are Tailwind class swaps only, no logic changes.

