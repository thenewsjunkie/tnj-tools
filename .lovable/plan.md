

## Fix: Watch Now Button Not Navigating

### Problem

The timer is embedded in an iframe. When you click "Watch Now," the link tries to open inside that same iframe. Your website (thenewsjunkie.com) has security headers that prevent it from being loaded inside an iframe, so you get a "refused to connect" error.

### Solution

Add `target="_blank"` and `rel="noopener noreferrer"` to the Watch Now `<a>` tag so the link opens in a new browser tab instead of trying to load inside the iframe.

### Change

**`src/pages/Timer.tsx`** -- Add two attributes to the Watch Now `<a>` element (around line 260):

- `target="_blank"` -- opens the link in a new tab
- `rel="noopener noreferrer"` -- standard security best practice for external links

