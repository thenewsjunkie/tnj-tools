

## Fix VDO.Ninja Crop to Actually Hide Portions

The current `clip-path: inset()` approach clips the content but leaves empty space where the cropped area was — the remaining content doesn't expand to fill the container. The fix is to use `overflow: hidden` on a wrapper and scale/reposition the iframe so the visible portion fills the available space.

### Approach

**File: `src/pages/Output.tsx`** — Replace `clip-path` with an overflow-based crop technique:

- Wrap the iframe in two nested divs:
  - **Outer div**: `overflow: hidden`, sized to 100% of the container (the visible area)
  - **Inner div / iframe**: Scaled up and repositioned so the cropped-away edges fall outside the overflow boundary

The math:
- Visible width fraction: `1 - (cropLeft + cropRight) / 100`
- Visible height fraction: `1 - (cropTop + cropBottom) / 100`
- Scale: `1 / visibleFraction` on each axis
- Transform origin: offset to shift the visible portion into view

Concrete CSS approach using `transform: scale()` and negative margins/translate:
```
width: 100% / (1 - cropL - cropR)
height: 100% / (1 - cropT - cropB)
transform: translate(-cropL%, -cropT%)
```

This makes the iframe larger than the container, positions the desired region inside the visible area, and the outer `overflow: hidden` hides the rest.

### Files Modified
- `src/pages/Output.tsx` — Update `VdoNinjaEmbed` component to use overflow + scale instead of clip-path

