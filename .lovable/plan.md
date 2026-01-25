

## Plan: Fix Bullet Points - Can't Add More

### The Problem
After adding one or two talking points, there's no obvious way to add more. The current behavior requires pressing **Enter** while typing in an existing bullet, but:
1. This isn't intuitive - there's no visual cue
2. Event propagation in the Popover might be interfering

### Solution
Add a visible "+" button at the bottom of the bullet list so users can always click to add more, plus ensure keyboard events don't bubble up.

---

### File to Modify

| File | Change |
|------|--------|
| `src/components/admin/show-prep/BulletEditor.tsx` | Add "+ Add point" button at bottom, stop event propagation |

---

### Technical Changes

**1. Add a visible "Add" button at the bottom of the bullet list**

After the list of bullets, show a small "+ Add point" button:

```text
Before (no way to add more):
┌────────────────────────────────┐
│ ☐ First talking point          │
│ ☐ Second talking point         │
│                                │
│                    [Done]      │
└────────────────────────────────┘

After:
┌────────────────────────────────┐
│ ☐ First talking point          │
│ ☐ Second talking point         │
│ + Add point                    │  ← NEW
│                    [Done]      │
└────────────────────────────────┘
```

**2. Stop event propagation on keydown**

Add `e.stopPropagation()` to prevent the Enter key from bubbling up to the Popover:

```typescript
const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
  e.stopPropagation(); // Prevent bubbling to Popover
  // ... rest of handler
};
```

**3. Updated BulletEditor render**

```typescript
return (
  <div className="space-y-1">
    {bullets.map((bullet, index) => (
      // ... existing bullet inputs
    ))}
    
    {/* Always show add button when there are bullets */}
    <button
      onClick={addBullet}
      className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors py-1 mt-1"
    >
      <Plus className="h-3 w-3" />
      Add point
    </button>
  </div>
);
```

---

### User Experience After Fix

1. Click the bullet icon on a topic
2. Add your first talking point
3. See a visible "+ Add point" button below
4. Click it to add another bullet (or press Enter - both work)
5. Continue adding as many points as needed
6. Click "Done" when finished

