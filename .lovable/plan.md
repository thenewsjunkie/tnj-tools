

## Fix: Leaderboard Flash on OBS Overlay Transition

### Root Cause (two issues)

**1. Cross-fade CSS transitions don't work on mount**
The outgoing component (`PrevComponent`) is freshly mounted with `opacity-0`, so there's no transition from visible to invisible -- it just appears invisible. Both layers sit at `opacity-0` simultaneously, showing the bare background (flash).

**2. Component remounts cause data refetch**
Every time the overlay cycles to the leaderboard, `SecretShowsLeaderboard` unmounts and remounts. This triggers a new `useSecretShowsGifters` query, which briefly shows "Loading leaderboard..." before data arrives -- another source of flash.

### Solution: Keep all modules mounted, toggle visibility

Instead of conditionally rendering only the active module, keep **all enabled modules mounted at all times** (hidden via `opacity-0` / `pointer-events-none`). This:
- Eliminates remounting and refetching
- Allows real CSS transitions (element is already in the DOM)
- Produces a true cross-fade with no empty frame

### Changes (single file: `src/pages/OBSOverlay.tsx`)

**Replace the current conditional render with a persistent mount approach:**

- Render all `enabledModules` simultaneously, each in an absolutely-positioned layer
- The active module gets `opacity-100`; all others get `opacity-0 pointer-events-none`
- CSS `transition-opacity duration-500` handles the animation
- Remove `prevIndex`, `fading`, and `transitionTo` state entirely -- no longer needed

**Simplified structure:**
```tsx
return (
  <div className="h-screen w-screen overflow-hidden relative" style={{ background: "transparent" }}>
    {enabledModules.map((moduleId, index) => {
      const Component = MODULE_COMPONENTS[moduleId];
      if (!Component) return null;
      const isActive = index === currentIndex;
      return (
        <div
          key={moduleId}
          className={`absolute inset-0 transition-opacity duration-500 ${
            isActive ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <Component />
        </div>
      );
    })}
  </div>
);
```

**Simplify the cycling logic:**
- Remove `prevIndex`, `fading`, `timeoutRef`, and `transitionTo`
- Auto-cycle just updates `currentIndex` directly
- Pinned mode just sets `currentIndex` to the pinned module's index

This is simpler, eliminates the flash entirely, and keeps module data warm across cycles.

