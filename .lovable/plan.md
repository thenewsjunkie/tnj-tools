

## Animate Watch Now Button Reveal

Add a CSS animation to the "Watch Now" button so it smoothly appears when the countdown expires, rather than popping in abruptly.

### Approach

Use a CSS `@keyframes` animation defined inline via the `style` prop on the button's `<a>` tag. The animation will scale the button up from 90% and fade it in over 0.5 seconds with a slight bounce effect.

### Changes to `src/pages/Timer.tsx`

Add the following inline style properties to the Watch Now `<a>` element (around line 265):

- `animation: "watchNowReveal 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards"` -- a slightly bouncy ease for a satisfying pop-in
- `opacity: 0` as initial state (the animation fills forward to opacity 1)

Since inline `@keyframes` aren't supported in React's `style` prop, inject a small `<style>` tag inside the component's return (before the main `<div>`) to define the keyframes:

```css
@keyframes watchNowReveal {
  0% {
    opacity: 0;
    transform: scale(0.85);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}
```

Then apply `animation: "watchNowReveal 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards"` to the button's style object.

### Technical Details

- The `cubic-bezier(0.34, 1.56, 0.64, 1)` curve overshoots slightly, giving a subtle bounce/pop effect
- `forwards` fill mode keeps the button visible after animation completes
- No new dependencies or files needed -- just a `<style>` tag and one style property addition
