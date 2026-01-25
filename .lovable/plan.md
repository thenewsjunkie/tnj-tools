

## Plan: Move Polls to Top Header with "+ Poll" Button

### Overview
Add a "+ Poll" button at the top of the admin page, positioned alongside the "Ask TNJ AI" button. The layout will have "Ask TNJ AI" on the left and "+ Poll" on the right, both as pill-shaped buttons in the same row.

---

### Current Layout

```text
                    [Ask TNJ AI]
```

### New Layout

```text
        [Ask TNJ AI]                    [+ Poll]
```

---

### Changes Required

**File: `src/pages/Admin.tsx`**

1. **Add state for Poll Dialog**
   - Add `useState` for `isPollDialogOpen`
   - Import `PollDialog` component
   - Import `Plus` icon from lucide-react

2. **Update the top button row**
   - Change from `justify-center` to `justify-center gap-4` with flex
   - Add "+ Poll" button on the right side with similar styling

3. **Remove the Polls CollapsibleModule** (optional - or keep it below for poll list management)
   - The "+ Poll" button handles creation
   - Keep the CollapsibleModule for viewing/managing existing polls

4. **Add PollDialog render**
   - Render `PollDialog` component with the state

---

### Code Changes

```tsx
// New imports
import { Mic, Archive, ExternalLink, Plus } from "lucide-react";
import PollDialog from "@/components/polls/PollDialog";

// New state
const [isPollDialogOpen, setIsPollDialogOpen] = useState(false);

// Updated top button section (lines 39-55)
<div className="flex justify-center items-center gap-4 mb-4">
  {/* Ask TNJ AI Button */}
  <button
    onClick={() => setIsVoiceChatOpen(!isVoiceChatOpen)}
    className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all duration-200 ${
      isVoiceChatOpen 
        ? "bg-primary text-primary-foreground shadow-lg" 
        : "bg-muted hover:bg-muted/80 text-foreground"
    }`}
  >
    <Mic className={`h-5 w-5 ${isAISpeaking ? "animate-pulse" : ""}`} />
    <span>Ask TNJ AI</span>
    {isAISpeaking && (
      <Badge variant="secondary" className="text-xs ml-1">Speaking</Badge>
    )}
  </button>

  {/* + Poll Button */}
  <button
    onClick={() => setIsPollDialogOpen(true)}
    className="flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all duration-200 bg-muted hover:bg-muted/80 text-foreground"
  >
    <Plus className="h-5 w-5" />
    <span>Poll</span>
  </button>
</div>

{/* Add PollDialog at the end of component */}
<PollDialog 
  open={isPollDialogOpen} 
  onOpenChange={setIsPollDialogOpen} 
/>
```

---

### Visual Result

```text
+----------------------------------------------------------+
|                      Admin Header                         |
+----------------------------------------------------------+
|                                                          |
|         [🎤 Ask TNJ AI]         [+ Poll]                 |
|                                                          |
|  +----------------------------------------------------+  |
|  |  Voice Interface (expandable)                      |  |
|  +----------------------------------------------------+  |
|                                                          |
|  +----------------------------------------------------+  |
|  |  Show Prep                                         |  |
|  +----------------------------------------------------+  |
|                                                          |
|  +----------------------------------------------------+  |
|  |  Polls (for viewing/managing existing polls)       |  |
|  +----------------------------------------------------+  |
+----------------------------------------------------------+
```

---

### Summary

| File | Change |
|------|--------|
| `src/pages/Admin.tsx` | Add "+ Poll" button next to "Ask TNJ AI", add state for dialog, render PollDialog |

---

### Technical Notes

- The "+ Poll" button opens `PollDialog` directly for quick poll creation
- Keep the existing Polls `CollapsibleModule` below for managing/viewing existing polls
- Both buttons use the same pill-shaped styling for visual consistency
- The new poll is automatically started (per previous implementation)

