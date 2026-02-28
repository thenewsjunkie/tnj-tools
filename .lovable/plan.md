
## Fix: White Flash Between OBS Overlay Scene Changes

### Problem
When the OBS overlay cycles between modules (e.g., Leaderboard to Hall of Frame), there's a brief white flash. This happens because:
1. The transition fades opacity to 0, unmounts the old component, mounts the new one, then fades back in
2. During that gap, the page background shows through -- and the transparent override only exists in the component's inline `<style>` tag, which may not override the base CSS fast enough
3. There's no persistent CSS rule (like the alerts page has) to force transparency on the OBS overlay route

### Solution

**1. Add a persistent CSS rule in `index.css`** (like the alerts page already has)
- Add `body.obs-overlay` class rules alongside the existing `body.alerts-overlay` rules
- This ensures transparency at the CSS level before any React renders

**2. Add the body class in `OBSOverlay.tsx`**
- On mount, add `obs-overlay` class to `document.body`
- On unmount, remove it
- Remove the inline `<style>` tag that currently tries to do this

**3. Keep both components mounted during transition**
- Instead of relying on `key={activeModule}` (which unmounts/remounts), render both the outgoing and incoming components simultaneously
- Cross-fade between them: old fades out while new fades in
- This eliminates the empty frame that causes the flash

### Files to Change

**`src/index.css`** -- Add OBS overlay transparent background rules:
```css
html:has(body.obs-overlay) {
  background-color: transparent !important;
}
body.obs-overlay {
  background-color: transparent !important;
}
```

**`src/pages/OBSOverlay.tsx`** -- Two changes:
- Add/remove `obs-overlay` class on body (useEffect on mount/unmount)
- Remove the inline style tag for background transparency
- Implement cross-fade: render both outgoing and incoming components stacked via absolute positioning, so there's never a bare frame between swaps
