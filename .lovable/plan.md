

## Make Timer Alert-Bar Friendly

Optimize the `/timer` page for horizontal alert-bar embedding with reduced height and a black Watch Now button.

### Changes to `src/pages/Timer.tsx`

**1. Horizontal layout for alert-bar use**
- Change the outer container from `flexDirection: "column"` to `flexDirection: "row"` so the logo and countdown sit side-by-side
- Reduce padding from `clamp(8px, 2vw, 16px)` to `clamp(4px, 1vw, 8px)`
- Add a horizontal gap between logo and countdown

**2. Smaller countdown blocks (reduced height)**
- Block padding: reduce from `clamp(6px, 2vw, 16px)` to `clamp(4px, 1.5vw, 10px)`
- Block min-width: reduce from `clamp(48px, 12vw, 100px)` to `clamp(36px, 10vw, 72px)`
- Block border-radius: `6px` instead of `8px`
- Number font size: reduce from `clamp(24px, 8vw, 56px)` to `clamp(18px, 5vw, 36px)`
- Label font size: reduce from `clamp(8px, 2vw, 12px)` to `clamp(7px, 1.5vw, 10px)`

**3. Compact logo**
- Max height: `clamp(20px, 4vw, 36px)` (down from 48px)
- Max width: `120px` (instead of 80%)
- Remove `marginBottom` (no longer needed in row layout)

**4. Black Watch Now button**
- Background: solid `#000000` (replacing the purple gradient)
- Smaller padding: `clamp(6px, 1.5vw, 12px) clamp(16px, 3vw, 32px)`
- Smaller font: `clamp(12px, 2.5vw, 16px)`
- Subtle shadow: `0 2px 8px rgba(0,0,0,0.3)`

These changes make the timer fit naturally inside a thin alert/notification bar (e.g., 50-80px tall) while remaining fully responsive at wider sizes.
