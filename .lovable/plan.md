

## Plan: Fix Save Draft and Publish Buttons in Full Truth Builder

### Issue Identified
The "Save Draft" and "Publish" buttons show an error "You must be logged in to save" even when the user is logged in.

### Root Cause
The `useAuth` hook in `src/hooks/useAuth.tsx` only initializes the auth session for routes that start with `/admin`:

```typescript
// Line 13 in useAuth.tsx
if (!currentPath.startsWith('/admin')) {
  console.log('[useAuth] Skipping auth initialization for non-admin route:', currentPath);
  return;
}
```

The Full Truth builder is at `/full-truth/new` or `/full-truth/edit/:id` - these paths don't start with `/admin`, so:
- The `session` state remains `null`
- `user` is `undefined` when checking `session?.user` in the builder
- The save/publish handlers fail with the "must be logged in" error

### Solution
Use the same direct Supabase auth check pattern that was successfully implemented for the `/full-truth` gallery page. This bypasses the restrictive `useAuth` hook.

---

### File to Modify

| File | Change |
|------|--------|
| `src/pages/FullTruthBuilder.tsx` | Replace `useAuth` hook with direct Supabase session check |

---

### Implementation Details

Replace the current auth approach:

```typescript
// Current (broken) - relies on useAuth which doesn't work on /full-truth/* routes
const { session } = useAuth();
const user = session?.user;
```

With direct Supabase session management:

```typescript
// Fixed - fetch session directly from Supabase
const [user, setUser] = useState<User | null>(null);

useEffect(() => {
  supabase.auth.getSession().then(({ data: { session } }) => {
    setUser(session?.user ?? null);
  });

  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    setUser(session?.user ?? null);
  });

  return () => subscription.unsubscribe();
}, []);
```

This is the same pattern already proven to work on the `/full-truth` gallery page.

---

### Why This Works

1. `supabase.auth.getSession()` retrieves the session regardless of the current route
2. `onAuthStateChange` keeps the user state in sync if auth status changes
3. The builder's `handleSave` check `if (!user)` will correctly pass when logged in

