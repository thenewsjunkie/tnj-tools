

## Plan: Fix Full Truth Access for Logged-In Users

### Issue Identified
The `/full-truth` page is working correctly, but:
- The "Create New" button only appears when logged in
- You appear to be logged out on that page
- There are 0 tapestries in the database, so the empty state is expected

### Root Cause
The `useAuth` hook is skipping auth initialization for `/full-truth` because it's a public route. This means the `session` object is undefined even if you're actually logged in elsewhere.

### Solution
Ensure the `useAuth` hook properly initializes auth state on the `/full-truth` page so logged-in users see the "Create New" button.

---

### Files to Modify

| File | Change |
|------|--------|
| `src/pages/FullTruth.tsx` | Use a more reliable auth check that works on public routes |

---

### Implementation Details

**Option A: Use `supabase.auth.getSession()` directly**

Instead of relying on `useAuth()` which may skip initialization, fetch the session directly:

```typescript
// In FullTruth.tsx
const [user, setUser] = useState<User | null>(null);

useEffect(() => {
  supabase.auth.getSession().then(({ data: { session } }) => {
    setUser(session?.user ?? null);
  });
}, []);
```

**Option B: Modify `useAuth` to always check session**

Ensure the auth hook initializes session state on all routes, not just admin routes.

---

### After Fix

Once implemented:
1. Navigate to `/full-truth` while logged in
2. You'll see the "Create New" button
3. Click it to go to `/full-truth/new` (the builder)
4. Create your first tapestry

