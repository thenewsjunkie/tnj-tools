
## Plan: Replace Internal Polls with Strawpoll.com Integration

### Overview
Replace the existing internal polling system with Strawpoll.com integration. This will allow you to create polls directly on Strawpoll from the admin interface, automatically get embed codes, and leverage Strawpoll's robust voting features (IP-based duplicate detection, better UI, etc.).

---

### 1. Add Strawpoll API Key Secret

**Requirement:** You'll need to generate an API key from your Strawpoll account:
1. Log into strawpoll.com
2. Go to Account Settings → API
3. Generate a new API key

The secret will be stored securely in Supabase and used by the Edge Function.

---

### 2. Create Strawpoll Edge Function

**New File: `supabase/functions/strawpoll/index.ts`**

Create an edge function that handles:
- **Create Poll**: POST to Strawpoll API with question and options
- **Get Poll**: Fetch poll details and results
- **Delete Poll**: Remove a poll from Strawpoll

```text
Endpoints:
POST /strawpoll { action: "create", question, options[] }
  → Returns { poll_id, embed_url, strawpoll_url }

POST /strawpoll { action: "get", poll_id }
  → Returns poll details with current votes

POST /strawpoll { action: "delete", poll_id }
  → Deletes poll from Strawpoll
```

---

### 3. Database Changes

**Modify `polls` table:**

```sql
ALTER TABLE polls 
ADD COLUMN strawpoll_id TEXT,
ADD COLUMN strawpoll_url TEXT,
ADD COLUMN strawpoll_embed_url TEXT;
```

This stores the Strawpoll references alongside your local poll data (so you can track which polls you've created and access their embed codes).

---

### 4. Update ManagePolls UI

**File: `src/pages/Admin/ManagePolls.tsx`**

Changes:
- Update "Create Poll" to call the Strawpoll edge function instead of inserting locally
- Store the returned `strawpoll_id` and `strawpoll_embed_url` in your database
- Update embed code generation to use Strawpoll's embed URL format
- Add "View on Strawpoll" link button

---

### 5. Update PollDialog Component

**File: `src/components/polls/PollDialog.tsx`**

Changes:
- When saving a new poll, call the `strawpoll` edge function
- On success, save the returned Strawpoll IDs to the local database
- Show loading state during API call to Strawpoll
- Handle errors from Strawpoll API (rate limits, validation, etc.)

---

### 6. Update PollEmbedCode Component

**File: `src/components/polls/PollEmbedCode.tsx`**

Changes:
- Use the stored `strawpoll_embed_url` for generating iframe code
- Update embed format to match Strawpoll's pattern:
```html
<iframe src="https://strawpoll.com/embed/{poll_id}" 
        style="width: 100%; height: 480px; border: 0;">
</iframe>
```

---

### 7. Update PollList Component

**File: `src/components/polls/PollList.tsx`**

Changes:
- Add "View on Strawpoll" button that opens the poll on strawpoll.com
- Update vote counts display (optionally fetch from Strawpoll for real-time results)
- Visual indicator showing the poll is hosted on Strawpoll

---

### 8. Optional: Remove Chat Bot Voting Logic

**Files:** 
- `stream-chat-bot/src/bots/twitch.js`
- `supabase/functions/youtube-bot/index.ts`

If you want to fully switch to Strawpoll, remove the internal vote processing from chat bots since votes will now go through Strawpoll's system instead.

---

### Summary of Changes

| Component | Change |
|-----------|--------|
| **Secret** | Add `STRAWPOLL_API_KEY` |
| **Edge Function** | New `strawpoll` function for create/get/delete |
| **Database** | Add `strawpoll_id`, `strawpoll_url`, `strawpoll_embed_url` columns |
| **ManagePolls.tsx** | Integrate Strawpoll API calls |
| **PollDialog.tsx** | Create polls on Strawpoll when saving |
| **PollEmbedCode.tsx** | Use Strawpoll embed URLs |
| **PollList.tsx** | Add Strawpoll links and indicators |

---

### Strawpoll Features You'll Gain

| Feature | Description |
|---------|-------------|
| IP Duplication Check | Prevents same person voting twice |
| CAPTCHA | Optional bot protection |
| Better Analytics | Built-in results visualization |
| Public Voting Page | Users can vote on strawpoll.com directly |
| Mobile Optimized | Responsive voting interface |

