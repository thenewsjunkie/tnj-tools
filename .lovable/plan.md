

## Add Audio Button to Admin Top Bar

Add an "Audio" pill button to the left of "Ask TNJ AI" in the top action buttons row. Clicking it toggles an expandable panel that embeds your local audio producer page in an iframe.

### What changes

**`src/pages/Admin.tsx`**

1. Add a new `isAudioOpen` state (persisted to localStorage like the voice chat toggle).
2. Add a `Headphones` icon import from `lucide-react`.
3. Insert a new pill button before "Ask TNJ AI" with the label "Audio" and a headphones icon. It highlights when active, matching the existing button style.
4. Add an expandable panel (same pattern as the voice chat panel) that shows an iframe pointing to `http://192.168.1.122:3060/producer`. The iframe will be sized to fill a reasonable area (e.g., `max-w-5xl mx-auto`, height ~500px) so you can interact with the producer UI inline.

### Layout

```text
[Audio]  [Ask TNJ AI]  [+ Poll]
```

When "Audio" is clicked, a panel slides open below the buttons (above the modules) containing the embedded iframe. Clicking again collapses it. Both the Audio and Voice Chat panels can be open simultaneously.

