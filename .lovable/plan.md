
## Plan: Add Polls Module to Admin Page

### Overview
Add a new collapsible "Polls" module to the `/admin` page, positioned between the "Show Prep" module and the "Weekend Edition Segments" module. This will give quick access to poll management directly from the main admin dashboard without navigating to a separate page.

---

### 1. Create AdminPolls Component

**New File: `src/components/admin/AdminPolls.tsx`**

Create a streamlined component that displays all poll functionality:
- List of all polls with status badges (active/draft/completed)
- Strawpoll indicator icon for polls hosted on Strawpoll
- Quick actions: Start/End poll, View on Strawpoll, Copy Embed Code
- Create Poll button that opens PollDialog
- "Copy Latest Poll Embed" button for the dynamic `/poll/latest` embed

This component will reuse existing poll components:
- `PollDialog` for creating/editing polls
- `PollList` (adapted) for displaying polls in a compact format
- The query logic from `ManagePolls.tsx`

```text
+--------------------------------------------------+
|  Polls                            [+ Create Poll] |
+--------------------------------------------------+
|  [Copy Latest Poll Embed]                         |
|                                                   |
|  +------------+  +------------+  +------------+   |
|  | Poll Card  |  | Poll Card  |  | Poll Card  |   |
|  | Question   |  | Question   |  | Question   |   |
|  | [Active]   |  | [Draft]    |  | [Completed]|   |
|  | [Actions]  |  | [Actions]  |  | [Actions]  |   |
|  +------------+  +------------+  +------------+   |
+--------------------------------------------------+
```

---

### 2. Update Admin Page Layout

**File: `src/pages/Admin.tsx`**

Add the new Polls CollapsibleModule after Show Prep:

```tsx
import AdminPolls from "@/components/admin/AdminPolls";

// ... inside the component, after ShowPrep CollapsibleModule:

<CollapsibleModule
  id="polls"
  title="Polls"
  defaultOpen={false}
  headerAction={
    <Link 
      to="/admin/manage-polls" 
      onClick={(e) => e.stopPropagation()}
      className="text-muted-foreground hover:text-foreground transition-colors"
    >
      <ExternalLink className="h-4 w-4" />
    </Link>
  }
>
  <AdminPolls />
</CollapsibleModule>
```

The header action will link to the full Manage Polls page for advanced management.

---

### 3. AdminPolls Component Details

**File: `src/components/admin/AdminPolls.tsx`**

Key features:

**A. Data Fetching**
- Query polls with `poll_options` using `@tanstack/react-query`
- Include Strawpoll fields: `strawpoll_id`, `strawpoll_url`, `strawpoll_embed_url`

**B. Poll Cards (Compact Layout)**
- Show poll question (truncated if long)
- Status badge (active = green, draft = gray, completed = outline)
- Strawpoll favicon indicator when hosted on Strawpoll
- Action buttons: Start/End, Embed code, View on Strawpoll, Edit, Delete

**C. Quick Actions Header**
- "Create Poll" button opens PollDialog
- "Copy Latest Embed" button copies the `/poll/latest` iframe code

**D. State Management**
- `useState` for dialog open/close
- `useState` for active poll (editing)
- Mutations for status updates and deletions (reuse from PollList)

---

### 4. Compact Poll Card Design

For the admin module, use a more compact card design than the full ManagePolls page:

```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
  {polls.map((poll) => (
    <div className="p-3 bg-muted/30 rounded-lg border border-border/50">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          {poll.strawpoll_id && (
            <img src="https://strawpoll.com/favicon.ico" className="w-4 h-4" />
          )}
          <span className="font-medium text-sm truncate">{poll.question}</span>
        </div>
        <Badge variant={statusVariant}>{poll.status}</Badge>
      </div>
      
      <div className="flex items-center gap-1 mt-2">
        {/* Action buttons */}
      </div>
    </div>
  ))}
</div>
```

---

### 5. Summary of Changes

| File | Change |
|------|--------|
| `src/components/admin/AdminPolls.tsx` | **New file** - Compact polls management component |
| `src/pages/Admin.tsx` | Add Polls CollapsibleModule after Show Prep |

---

### 6. Component Breakdown

```text
AdminPolls.tsx
├── Header Row
│   ├── "Create Poll" Button → Opens PollDialog
│   └── "Copy Latest Embed" Button → Copies iframe code
│
├── Poll Grid (compact cards)
│   └── Each card shows:
│       ├── Strawpoll icon (if applicable)
│       ├── Question text (truncated)
│       ├── Status badge
│       └── Action buttons (Start/End, Embed, View, Edit, Delete)
│
├── PollDialog (reused)
│   └── For creating/editing polls
│
└── Empty State
    └── "No polls yet. Create your first poll!"
```

---

### 7. Imports Required

```tsx
// AdminPolls.tsx
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Copy, Play, Pause, Code, ExternalLink, Edit, Trash2 } from "lucide-react";
import PollDialog from "@/components/polls/PollDialog";
```

---

### Technical Notes

- The component will be self-contained with its own data fetching, avoiding prop drilling
- Reuses `PollDialog` for create/edit functionality
- Poll mutations (status update, delete) are implemented inline with proper invalidation
- The "Copy Latest Embed" uses the same logic as ManagePolls but streamlined
- Default collapsed state (`defaultOpen={false}`) keeps the admin page clean
