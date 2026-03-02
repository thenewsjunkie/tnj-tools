

## Enable Sound on PiP YouTube Videos

Currently, all YouTube embeds use `?autoplay=1&mute=1`, which forces them to be silent. We can make muting optional so PiP videos play with sound.

### Changes

**File: `src/hooks/useOutputConfig.ts`**
- Update `getYouTubeEmbedUrl` to accept an optional `muted` parameter (default `true` for backward compatibility)
- When `muted` is `false`, the URL will use `mute=0` instead of `mute=1`

**File: `src/pages/Output.tsx`**
- Update the `YouTubeEmbed` component to accept a `muted` prop
- Pass `muted={false}` for PiP Left and PiP Right video embeds (all 4 occurrences across full-screen and standard modes)
- Center videos remain muted to avoid interfering with other audio sources

### Notes
- Browsers may still block unmuted autoplay depending on user interaction history with the site. The `allow="autoplay"` attribute on the iframe helps, but some browsers require a user gesture first.
- Only PiP videos will be unmuted; center/background videos stay muted to avoid audio conflicts.

