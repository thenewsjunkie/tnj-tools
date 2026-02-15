

## Add Hero Image to Rundown Page

### Change

Display the first image from the topic's `images` array as a large, prominent hero image between the header section and the rundown content. Topics already store images via the `images: string[]` field, so no data changes are needed.

### Implementation

**File: `src/pages/RundownPage.tsx`**

After the header section (line 201) and before the rundown content (line 203), insert a hero image block:

- Check if `topic.images` has at least one entry
- Render the first image in a rounded container with max-width, a subtle border, and object-cover styling
- Use `aspect-video` (16:9) for a cinematic, stream-friendly look
- Add a subtle gradient overlay or shadow for polish
- If no images exist, skip the section entirely (no empty space)

```tsx
{topic.images?.length > 0 && (
  <div className="mb-8 rounded-xl overflow-hidden border border-border/50 shadow-lg">
    <img
      src={topic.images[0]}
      alt={topic.title}
      className="w-full aspect-video object-cover"
    />
  </div>
)}
```

### Files Modified
1. `src/pages/RundownPage.tsx` -- add hero image block between header and content
