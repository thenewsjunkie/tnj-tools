

## Fix: YouTube Videos Not Showing in Full-Screen Mode

### Root Cause
In `src/pages/Output.tsx`, when a module is set to **Full Screen** (like Live Chat), the code hits an early `return` at line 177 that skips rendering center videos entirely. PiP videos are rendered inside that block but may be hidden behind the chat iframe due to stacking context issues.

### Fix in `src/pages/Output.tsx`

**1. Add center video rendering in full-screen mode**
Inside the full-screen branch (lines 177-221), center videos need to be rendered as background content behind the full-screen module. Since "Center" means full-screen video, it should render as a layer beneath the active module.

**2. Ensure PiP z-index beats the chat iframe**
Add `relative z-0` to the chat container and confirm PiP overlays at `z-50` sit above it. Also add `pointer-events-none` on the PiP container with `pointer-events-auto` on individual videos so the chat remains interactive underneath.

### Specific changes

**In the full-screen return block (around lines 177-221):**
- Render center videos as a full-screen background layer (behind the module) with `absolute inset-0 z-0`
- Wrap the full-screen module content in a `relative z-10` container so it layers above center video
- Keep PiP videos at `z-50` (already correct)

**Result:**
- **Center** video: renders full-screen behind the active module (visible if module has transparency, or as a standalone full-screen video)
- **PiP Left**: renders as a 640px overlay in the top-left corner, above the chat
- **PiP Right**: renders as a 640px overlay in the top-right corner, above the chat

