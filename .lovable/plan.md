

## Resize and Top-Align the AM/PM Indicator on Clock Overlay

### Changes

**File: `src/components/studio/overlays/ClockOverlay.tsx`**

Split the time display into two parts so the AM/PM indicator can be styled independently:

1. Change the single `format(time, "h:mm:ssaa")` call into two parts: `format(time, "h:mm:ss")` for the time and `format(time, "aa")` for the AM/PM
2. Wrap the AM/PM in a separate `<span>` with roughly half the font size (`text-2xl`) and `align-top` / `leading-none` to top-align it next to the time digits

Result: the time numbers stay at `text-5xl` while "am"/"pm" appears at about half size, aligned to the top of the time text.

