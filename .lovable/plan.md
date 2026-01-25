

## Plan: Update Copy Embed Code Heights

### Problem
The "Copy Latest Embed" and individual poll embed code still use the old fixed heights (480px, 500px), which doesn't match the updated components that now use `minHeight: 400px` for natural content sizing.

---

### Files to Update

**1. `src/components/admin/AdminPolls.tsx`**

Update line 71 (handleCopyLatestEmbed):
```tsx
// From:
const embedCode = `<iframe src="https://tnjtools.com/poll/latest" width="100%" height="500" style="border: 0; border-radius: 8px;" allowfullscreen></iframe>`;

// To:
const embedCode = `<iframe src="https://tnjtools.com/poll/latest" width="100%" height="400" style="border: 0; border-radius: 8px;" allowfullscreen></iframe>`;
```

Update lines 77-78 (handleCopyPollEmbed):
```tsx
// From:
? `<iframe src="${poll.strawpoll_embed_url}" width="100%" height="480" ...

// To:
? `<iframe src="${poll.strawpoll_embed_url}" width="100%" height="400" ...
```

**2. `src/components/polls/PollEmbedCode.tsx`**

Update line 32 (strawpollIframeCode):
```tsx
// From:
height="480"

// To:
height="400"
```

**3. `src/pages/Admin/ManagePolls.tsx`**

Update line 76 (handleCopyLatestPollEmbed):
```tsx
// From:
height="450"

// To:
height="400"
```

---

### Summary

| File | Line | Change |
|------|------|--------|
| `AdminPolls.tsx` | 71 | `height="500"` → `height="400"` |
| `AdminPolls.tsx` | 78 | `height="480"` → `height="400"` |
| `PollEmbedCode.tsx` | 32 | `height="480"` → `height="400"` |
| `ManagePolls.tsx` | 76 | `height="450"` → `height="400"` |

This ensures all copied embed codes use consistent 400px height matching the updated components.

