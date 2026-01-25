

## Plan: Auto-Start New Strawpoll & End Previous Active Poll

### Overview
When you create a new Strawpoll poll, it will automatically be set to "active" status. Thanks to an existing database trigger (`ensure_single_active_poll`), any previously active poll will automatically be marked as "completed" when the new one becomes active.

---

### How It Works

```text
User creates new poll
       ↓
Poll inserted with status = "active"
       ↓
Database trigger fires: ensure_single_active_poll()
       ↓
All other polls with status = "active" 
are updated to status = "completed"
       ↓
New poll is now the only active poll
```

---

### Changes Required

**File: `src/components/polls/PollDialog.tsx`**

Change the poll creation from `status: "draft"` to `status: "active"`:

```tsx
// Line 61-62: Change from
status: "draft",

// To
status: "active",
```

That's the only code change needed. The database trigger already handles completing the previous active poll automatically.

---

### Existing Database Trigger (Already in Place)

The following trigger function already exists in your database:

```sql
CREATE OR REPLACE FUNCTION public.ensure_single_active_poll()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  -- If the new poll is being set to active
  IF NEW.status = 'active' THEN
    -- Set all other polls to completed
    UPDATE polls
    SET status = 'completed'
    WHERE id != NEW.id AND status = 'active';
  END IF;
  RETURN NEW;
END;
$function$
```

This trigger fires on INSERT and UPDATE, ensuring only one poll can be active at a time.

---

### Update Success Message

Also update the success toast message to reflect the new behavior:

```tsx
// Line 93-96: Change from
toast({
  title: "Poll created on Strawpoll!",
  description: "The poll has been created successfully on Strawpoll.com",
});

// To
toast({
  title: "Poll created and started!",
  description: "The poll is now active on Strawpoll.com. Any previous active poll has been ended.",
});
```

---

### Summary

| Change | File | Description |
|--------|------|-------------|
| Auto-start poll | `PollDialog.tsx` | Change `status: "draft"` → `status: "active"` |
| Update toast | `PollDialog.tsx` | Reflect auto-start in success message |

---

### Result

After this change:
- **Create Poll** → Poll is immediately active (started)
- **Previous active poll** → Automatically marked as completed
- **`/poll/latest` embed** → Instantly shows the new poll
- **No manual "Start" button needed** for new Strawpoll polls

