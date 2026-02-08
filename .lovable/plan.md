

## Fix: "Add talking points" button does nothing

### Root Cause

The empty-state render condition (`!hasContent && bullets.length <= 1`) shows only the button — no inputs are rendered. When clicked, `addBullet()` tries to focus `inputRefs.current[0]`, but that ref is `null` because the input doesn't exist in the DOM yet.

### Fix in `src/components/admin/show-prep/BulletEditor.tsx`

1. Add a `showEditor` state (default `false`)
2. In `addBullet`, when there's one empty bullet and we're in the empty state, set `showEditor = true` instead of trying to focus a non-existent input
3. Update the render condition: show the full editor if `hasContent || showEditor`

```typescript
const [showEditor, setShowEditor] = useState(false);

const addBullet = () => {
  if (bullets.length === 1 && !bullets[0].text.trim()) {
    setShowEditor(true);
    return;
  }
  const newBullet: Bullet = { id: uuidv4(), text: "", indent: 0, checked: false };
  onChange([...bullets, newBullet]);
};

// Render condition changes from:
if (!hasContent && bullets.length <= 1)
// to:
if (!hasContent && bullets.length <= 1 && !showEditor)
```

The existing `useEffect` will then auto-focus the first input once it mounts. One file changed, three small edits.

