

## Align Cropped VDO.Ninja Feed to Top

Looking at the image, the cropped VDO.Ninja feed is rendering correctly content-wise but the visible portion isn't anchored to the top of the container. The current translate math centers based on crop values, but when you crop the bottom to remove chat/black bars, you want the remaining content to sit at the top of the screen.

The fix is straightforward: the translate Y formula currently shifts proportionally based on `cropTop`, which is correct for top-alignment when `cropTop=0`. However, the percentage-based translate on the oversized iframe may not behave as expected because CSS `translate` percentages are relative to the **element's own dimensions**, not the container.

### Fix

**File: `src/pages/Output.tsx`** — Simplify the translate calculation:

The current formula `(cropTop / 100) / (1 / visibleH) * 100` simplifies to `cropTop * visibleH`. Since translate percentages are relative to the element itself (which is larger than the container), we need:

- translateY = `cropTop / (100 - cropTop - cropBottom) * 100`% of the element's height = `cropTop` % of the container — which is what we want.

Corrected: use `translateX(-${cropLeft / visibleW}%, -${cropTop / visibleH}%)` where the values are `crop / visible * 1` to get the right percentage of the enlarged element.

Actually the simplest correct approach: just use pixel-free ratios. The iframe is `100/visibleW` % wide and `100/visibleH` % tall. To shift left by `cropLeft%` of container = `cropLeft * visibleW / 100 * 100`% of element = `cropLeft * visibleW`% — which is what the code already does.

So the math is actually correct. The real issue is likely that the **container** for center videos doesn't have a fixed height, causing `h-full` on VdoNinjaEmbed to not resolve. I'll ensure the VdoNinjaEmbed wrapper and its parents properly fill available space with `position: relative` and `absolute inset-0` positioning to guarantee top-alignment regardless of flex layout quirks.

### Changes

**`src/pages/Output.tsx`** — In the cropped VdoNinjaEmbed, change the outer wrapper to use `position: relative` with the iframe absolutely positioned, ensuring the content anchors to the top-left:

```tsx
<div className="w-full h-full overflow-hidden relative">
  <iframe
    className="absolute top-0 left-0"
    style={{
      border: 0,
      width: `${100 / visibleW}%`,
      height: `${100 / visibleH}%`,
      transform: `translate(-${cropLeft / visibleW}%, -${cropTop / visibleH}%)`,
    }}
  />
</div>
```

Using `absolute top-0 left-0` guarantees the iframe starts at the top-left corner of the container, then the transform shifts it to account for any top/left crop. When only cropping bottom, transform is `translate(0, 0)` — perfectly top-aligned.

### Files Modified
- `src/pages/Output.tsx` — Use absolute positioning for cropped iframe to guarantee top-left anchoring

