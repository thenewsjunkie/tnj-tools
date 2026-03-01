

## Fix: PiP YouTube Videos Hidden Behind Chat Iframe

### Root Cause
The Restream and Discord chat components use `transform: scale(...)` for the zoom feature. In CSS, any `transform` creates a **new stacking context**, which causes the chat iframe to visually render above sibling `fixed` elements (the PiP videos) regardless of z-index values.

### Solution
Two changes are needed:

**1. Constrain the chat's stacking context (`src/pages/Output.tsx`)**
In the full-screen branch, wrap the module container with `style={{ isolation: 'isolate' }}` to prevent the chat's transform-based stacking context from escaping and covering PiP overlays.

**2. Elevate PiP containers above everything**
Change the PiP overlay containers in both the full-screen and normal branches to use `z-[9999]` instead of `z-50`, ensuring they are always painted above any iframe stacking context.

### Files to Modify
- `src/pages/Output.tsx`
  - Full-screen branch (line 197): Add `style={{ isolation: 'isolate' }}` to the module wrapper div
  - PiP containers (lines 212, 221, 274, 282): Change `z-50` to `z-[9999]`

