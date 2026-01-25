

## Plan: Fix Strawpoll Embed Extra Space Below Poll

### Problem
The Strawpoll embed has extra blank space below the poll content because:
1. `PollEmbedPage.tsx` uses `min-h-screen` which forces full viewport height
2. `StrawpollEmbed.tsx` uses `min-h-[480px]` which may be larger than the actual poll content

### Solution
Remove the forced minimum heights and let the Strawpoll iframe size naturally to its content.

---

### Changes Required

**File 1: `src/pages/PollEmbed.tsx`**

Remove `min-h-screen` from the Strawpoll embed wrapper (lines 57-61):

```tsx
// Change from:
<div className="min-h-screen w-full">
  <StrawpollEmbed embedUrl={latestPollData.strawpoll_embed_url} />
</div>

// To:
<div className="w-full">
  <StrawpollEmbed embedUrl={latestPollData.strawpoll_embed_url} />
</div>
```

**File 2: `src/components/polls/StrawpollEmbed.tsx`**

Remove the forced min-height and let iframe auto-size:

```tsx
// Change from:
<div className="w-full h-full min-h-[480px] flex items-center justify-center">
  <iframe 
    src={embedUrl}
    className="w-full h-full min-h-[480px]"
    style={{ border: 'none' }}
    ...
  />
</div>

// To:
<div className="w-full">
  <iframe 
    src={embedUrl}
    className="w-full"
    style={{ border: 'none', minHeight: '400px' }}
    ...
  />
</div>
```

The Strawpoll embed will auto-resize based on its content, eliminating the blank space.

---

### Summary

| File | Change |
|------|--------|
| `src/pages/PollEmbed.tsx` | Remove `min-h-screen` from Strawpoll wrapper div |
| `src/components/polls/StrawpollEmbed.tsx` | Remove flex centering and adjust min-height styling |

