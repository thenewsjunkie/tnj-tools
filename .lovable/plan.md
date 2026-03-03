

## Add VDO.Ninja Feeds + Resizable PiP for Both Feed Types

### Overview
Add a new "VDO.Ninja Feeds" section below "Live Video Feeds" in Output Control, working identically (URL input, placement options, remove). Also add a width slider to each video feed (YouTube and VDO.Ninja) so PiP sizes can be controlled from the admin panel.

### Data Model Changes (`src/hooks/useOutputConfig.ts`)

- Add `vdoNinjaFeeds?: VdoNinjaFeed[]` to `OutputConfig`
- Add `width?: number` (pixels, default 1280) to `VideoFeed` interface
- Create `VdoNinjaFeed` interface identical to `VideoFeed`: `{ url: string; placement: VideoPlacement; width?: number }`
- Add a `getVdoNinjaEmbedUrl(url: string)` helper that normalizes VDO.Ninja URLs (handles `vdo.ninja` links, ensures `&autoplay=1&mute&cleanoutput`)

### Admin Panel Changes (`src/components/studio/OutputControl.tsx`)

- Add state for `newVdoUrl` and `newVdoPlacement`
- Add a new "VDO.Ninja Feeds" section (styled with a purple/violet accent to differentiate from the red YouTube section), with the same add/remove/placement UI pattern
- For **both** YouTube and VDO.Ninja feed lists, add a width slider (range 320–1920px, step 10, default 1280) per feed item that saves to the feed's `width` property

### Output Page Changes (`src/pages/Output.tsx`)

- Add a `VdoNinjaEmbed` component that renders an iframe with the VDO.Ninja URL (similar to `YouTubeEmbed`)
- Merge VDO.Ninja feeds into the same PiP left/right/center rendering logic alongside YouTube feeds
- Use each feed's `width` value (default 1280) instead of the hardcoded `w-[1280px]` class — apply via inline `style={{ width: feed.width ?? 1280 }}`

### File Changes Summary

| File | Change |
|------|--------|
| `src/hooks/useOutputConfig.ts` | Add `VdoNinjaFeed` type, `vdoNinjaFeeds` to config, `getVdoNinjaEmbedUrl` helper, `width` to `VideoFeed` |
| `src/components/studio/OutputControl.tsx` | Add VDO.Ninja section, add width slider to each feed row (YouTube + VDO.Ninja) |
| `src/pages/Output.tsx` | Add `VdoNinjaEmbed`, render VDO.Ninja feeds in PiP/center slots, use per-feed width |

