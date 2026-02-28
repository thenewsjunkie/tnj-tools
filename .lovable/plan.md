

## Make Restream Chat Text Bigger

Since the chat is loaded in an iframe, we can't directly change its font size. However, we can apply a CSS `zoom` property to the iframe container to scale everything up, making the text appear larger.

### Changes

**`src/hooks/useOutputConfig.ts`**
- Add `chatZoom?: number` to the `OutputConfig` interface (default: 100, range 100-300, representing percentage)

**`src/components/studio/OutputControl.tsx`**
- Add a "Chat Zoom" slider (100%-300%) in the Output Control card, near the Brightness/Contrast sliders
- Saves the value to the existing config via the `save()` helper

**`src/components/studio/RestreamChatEmbed.tsx`**
- Accept an optional `zoom` prop (number, default 100)
- Apply `style={{ zoom: zoom / 100 }}` to the iframe element so the entire chat scales up

**`src/pages/Output.tsx`**
- Pass the `chatZoom` config value to `RestreamChatEmbed` when rendering the live-chat module

**`src/pages/OBSOverlay.tsx`**
- Pass the `chatZoom` config value to the live-chat module so OBS also gets the scaled chat

This gives you a real-time slider in the Studio Screen admin to dial in the exact chat text size you want.

