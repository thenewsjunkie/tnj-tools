
## Fix: OBS Overlay White Flash (Cross-Fade Bug)

### Root Cause
In `transitionTo()`, `currentIndex` is only updated after a 600ms timeout. During the fade:
- `activeModule = enabledModules[currentIndex]` -- still the OLD module
- `prevModule = enabledModules[prevIndex]` -- also the OLD module (same value)
- Result: old module fades to opacity-0, new module isn't rendered, white flash appears

### Fix (single file: `src/pages/OBSOverlay.tsx`)

Update `transitionTo()` to set `currentIndex` immediately:

```typescript
const transitionTo = (nextIndex: number) => {
  if (nextIndex === currentIndex) return;
  setPrevIndex(currentIndex);   // keep old module visible
  setCurrentIndex(nextIndex);   // render new module immediately
  setFading(true);
  clearTimeout(timeoutRef.current);
  timeoutRef.current = setTimeout(() => {
    setPrevIndex(null);          // remove old module
    setFading(false);
  }, 600);
};
```

Update the JSX so during the fade:
- **Prev component** renders at `opacity-100` and transitions to `opacity-0` (fading out)
- **Active component** renders at `opacity-0` and transitions to `opacity-100` (fading in)

```tsx
{/* Outgoing module -- visible, fading out */}
{fading && PrevComponent && (
  <div className="absolute inset-0 transition-opacity duration-500 opacity-0">
    <PrevComponent />
  </div>
)}

{/* Active module -- fading in */}
{ActiveComponent && (
  <div className={`absolute inset-0 transition-opacity duration-500 ${
    fading ? "opacity-0" : "opacity-100"
  }`}>
    <ActiveComponent />
  </div>
)}
```

The prev component starts mounted at full opacity and the CSS transition animates it to `opacity-0`. The key difference is that now `ActiveComponent` is actually the NEW module (not the old one), so both sides of the cross-fade are correct.
