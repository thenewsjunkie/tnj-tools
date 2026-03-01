

## Fix Art Mode Full-Screen Display

After investigating the code, I found two issues that prevent Art Mode from displaying properly in full-screen mode on the Output page:

### Issue 1: Layout height not resolving for ArtModeDisplay

In `Output.tsx`, the full-screen container uses `flex-1 min-h-0`, but `ArtModeDisplay` relies on `h-full` which can fail to resolve when nested inside flex containers without explicit height propagation. The fix is to ensure the ArtModeDisplay fills its container using absolute positioning instead.

### Issue 2: ArtModeDisplay not filling flex container

The `ArtModeDisplay` root div uses `w-full h-full` but doesn't have any flex-grow or absolute positioning to ensure it fills the available space in all container contexts.

### Changes

**File: `src/components/studio/ArtModeDisplay.tsx`**
- Change the root container from `w-full h-full` to `absolute inset-0` so it fills any positioned parent regardless of flex chain
- Alternatively, add both `w-full h-full` and `min-h-0 flex-1` for robustness

**File: `src/pages/Output.tsx`**
- Ensure the full-screen module container has `relative` positioning (it already does) and is set up so child components can fill it with `absolute inset-0`
- Add `overflow-hidden` to the full-screen container to prevent art mode from overflowing

### Technical Details

In `ArtModeDisplay.tsx`, the root div will change from:
```
className="w-full h-full bg-black flex items-center justify-center p-6"
```
to:
```
className="absolute inset-0 bg-black flex items-center justify-center p-6"
```

In `Output.tsx`, the full-screen module wrapper (around line 175) will add `overflow-hidden` to ensure proper containment:
```
className="flex-1 min-h-0 relative z-10 overflow-hidden"
```

These are small, targeted CSS fixes that ensure the Art Mode display fills its container in all layout contexts (full-screen, column, OBS overlay).
