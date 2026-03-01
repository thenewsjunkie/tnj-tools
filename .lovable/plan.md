

## Fix: TelePrompter Reset Not Scrolling Back to Top

### Root Cause
The reset button sets `scrollPosition: 0` in the config. The display page has a `useEffect` that watches `scrollPosition` and scrolls to top when it equals `0`. However, if `scrollPosition` is **already** `0` from a previous reset, React sees no change and the effect doesn't re-fire -- so the scroll position stays put.

### Solution
Change `scrollPosition` from a fixed `0` value to a **timestamp** (e.g., `Date.now()`). This guarantees the value changes every time reset is pressed, triggering the effect reliably.

### Files to Modify

**`src/components/studio/TelePrompterControl.tsx`**
- Change the Reset button's `onClick` from `scrollPosition: 0` to `scrollPosition: Date.now()`

**`src/pages/TelePrompter.tsx`**
- Update the reset `useEffect` (line 19-23): instead of checking `scrollPosition === 0`, use a ref to track the previous value and scroll to top whenever `scrollPosition` changes (any new value means "reset was pressed")
- Update the keyboard shortcut handler (line 66): change `scrollPosition: 0` to `scrollPosition: Date.now()`

### Technical Detail
```text
// Before (broken - same value doesn't trigger effect):
update({ isPlaying: false, scrollPosition: 0 })

// After (always triggers effect):
update({ isPlaying: false, scrollPosition: Date.now() })

// Effect becomes:
const lastResetRef = useRef(scrollPosition);
useEffect(() => {
  if (scrollPosition !== lastResetRef.current && scrollRef.current) {
    scrollRef.current.scrollTop = 0;
    lastResetRef.current = scrollPosition;
  }
}, [scrollPosition]);
```
