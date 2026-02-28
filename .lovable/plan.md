

## Support Animated GIFs in Hall of Frame

Animated GIFs are actually already technically supported -- the upload accepts `image/*` (which includes GIF), preserves the `.gif` extension, and the `<img>` tag renders animated GIFs natively. However, the UI doesn't make this obvious. Here's what we'll update:

### Changes (2 files)

**`src/components/studio/HallOfFrame.tsx`** (Admin upload panel)
- Update the file input `accept` attribute to explicitly list GIF: `accept="image/*,.gif"`
- Update the drop zone text from "Drop photos here or click to upload" to "Drop photos or GIFs here or click to upload"

**`src/pages/HallOfFrame.tsx`** (Display page)
- No changes needed -- the `<img>` tag already plays animated GIFs automatically

That's it. The storage and database layers already handle GIFs correctly since they're just image files with no server-side processing.

