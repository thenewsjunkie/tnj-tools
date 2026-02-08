

## Fix: "Add talking points" creates duplicate bullet

### Problem
When `bullets` already contains one empty bullet (length 1, no text), clicking "Add talking points" calls `addBullet()` which appends a second bullet. The `useEffect` focuses the last (second) bullet, making the first one look like it has text ("Add a talking point..." placeholder is visible but unfocused).

### Fix in `src/components/admin/show-prep/BulletEditor.tsx`

Change the `addBullet` function (used by the "Add talking points" button in the empty state) to focus the existing empty bullet instead of adding a new one:

```typescript
const addBullet = () => {
  // If there's already an empty bullet, just focus it
  if (bullets.length === 1 && !bullets[0].text.trim()) {
    const firstInput = inputRefs.current[0];
    firstInput?.focus();
    return;
  }
  const newBullet: Bullet = { id: uuidv4(), text: "", indent: 0, checked: false };
  onChange([...bullets, newBullet]);
};
```

This way, clicking "Add talking points" when there's already a single empty bullet just focuses it instead of creating a duplicate. The "+ Add point" button at the bottom still adds new bullets normally.

