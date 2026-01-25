
## Plan: Create "Latest Strawpoll" Dynamic Embed Page

### Overview
Create a special embed page at `/poll/latest` that automatically displays the Strawpoll embed for whichever poll is currently marked as "active" in your database. This way you can embed one URL on any website, and it will always show the current poll without needing to update the embed code.

---

### 1. Update PollEmbed Page to Handle Strawpoll

**File: `src/pages/PollEmbed.tsx`**

When `id === 'latest'`, the page will:
1. Query the database for the latest active poll
2. Check if it has a `strawpoll_embed_url`
3. If yes: render the Strawpoll embed in a full-page iframe
4. If no: fall back to the internal polling UI (for legacy polls)

---

### 2. Update usePollData Hook

**File: `src/components/polls/hooks/usePollData.tsx`**

Modify the `latest-poll` query to also fetch:
- `strawpoll_id`
- `strawpoll_url`  
- `strawpoll_embed_url`

This data is needed to determine whether to show Strawpoll or internal poll.

---

### 3. Create StrawpollEmbed Component

**New File: `src/components/polls/StrawpollEmbed.tsx`**

A simple component that renders a full-page Strawpoll iframe:

```tsx
interface StrawpollEmbedProps {
  embedUrl: string;
}

const StrawpollEmbed = ({ embedUrl }) => (
  <iframe 
    src={embedUrl}
    style={{ 
      width: '100%', 
      height: '100%', 
      border: 'none',
      minHeight: '480px' 
    }}
    allowFullScreen
  />
);
```

---

### 4. Update PollEmbed.tsx Component

**File: `src/components/polls/PollEmbed.tsx`**

Add logic to check for Strawpoll data:

```tsx
// If poll has Strawpoll integration, show Strawpoll embed
if (poll?.strawpoll_embed_url) {
  return <StrawpollEmbed embedUrl={poll.strawpoll_embed_url} />;
}

// Otherwise, show internal poll UI (legacy)
return <InternalPollUI poll={poll} ... />;
```

---

### 5. Update ManagePolls "Copy Latest Poll Embed" Button

**File: `src/pages/Admin/ManagePolls.tsx`**

Update `handleCopyLatestPollEmbed` to:
1. Check if the latest active poll has Strawpoll integration
2. Generate appropriate embed code:
   - **With Strawpoll**: Use `https://tnjtools.com/poll/latest` (wrapper page)
   - Alternatively, use the direct Strawpoll embed URL

The wrapper approach is better because:
- Single URL that never changes
- Automatically updates when you create a new poll
- Works even if you switch back to internal polls

---

### 6. Add Types for Strawpoll Fields

**File: `src/components/polls/types.ts`**

Update the `Poll` and `RawPoll` interfaces to include:
```typescript
strawpoll_id?: string | null;
strawpoll_url?: string | null;
strawpoll_embed_url?: string | null;
```

---

### Summary of Changes

| File | Change |
|------|--------|
| `types.ts` | Add Strawpoll fields to Poll interface |
| `usePollData.tsx` | Fetch Strawpoll fields in queries |
| `StrawpollEmbed.tsx` | New component for rendering Strawpoll iframe |
| `PollEmbed.tsx` | Check for Strawpoll and render accordingly |
| `PollEmbed.tsx` (page) | Handle Strawpoll rendering for `/poll/latest` |
| `ManagePolls.tsx` | Update copy embed to explain the latest poll feature |

---

### How It Works

```text
Website embeds: https://tnjtools.com/poll/latest
                        ↓
              PollEmbed page loads
                        ↓
         Fetches latest active poll from DB
                        ↓
    ┌───────────────────┴───────────────────┐
    ↓                                       ↓
Has strawpoll_embed_url?              No Strawpoll?
    ↓                                       ↓
Renders Strawpoll iframe            Shows internal poll UI
(full voting functionality)          (legacy fallback)
```

---

### Embed Code Result

The "Copy Latest Poll Embed" button will provide:

```html
<iframe 
  src="https://tnjtools.com/poll/latest" 
  width="100%" 
  height="500" 
  style="border: 0; border-radius: 8px;" 
  allowfullscreen>
</iframe>
```

This single embed code:
- Always shows the current active poll
- Automatically uses Strawpoll when available
- No need to update websites when creating new polls
