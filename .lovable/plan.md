
## Plan: Add Clickable Links to Notepad

### The Problem
URLs typed in the notepad appear as plain text because TipTap requires a dedicated **Link extension** for hyperlink support. The current setup only has StarterKit (basic formatting), Underline, and Placeholder.

### Solution
Add TipTap's Link extension with **autolink** enabled, which will automatically detect and convert URLs as you type.

---

### What You'll Get

| Before | After |
|--------|-------|
| `https://example.com` (plain text) | [https://example.com](https://example.com) (clickable link) |
| Must manually format links | URLs auto-detected as you type or paste |
| No visual distinction | Links appear underlined and colored |

---

### Files to Modify

| File | Change |
|------|--------|
| `package.json` | Add `@tiptap/extension-link` dependency |
| `src/components/admin/show-prep/Notepad.tsx` | Import and configure Link extension with autolink |

---

### Technical Implementation

**1. Install the Link Extension**
```json
"@tiptap/extension-link": "^2.27.2"
```

**2. Configure TipTap with Link Extension**
```typescript
import Link from '@tiptap/extension-link';

const editor = useEditor({
  extensions: [
    StarterKit,
    Underline,
    Link.configure({
      autolink: true,           // Auto-detect URLs as you type
      openOnClick: true,        // Click to open in new tab
      linkOnPaste: true,        // Auto-link pasted URLs
      HTMLAttributes: {
        target: '_blank',       // Open in new tab
        rel: 'noopener noreferrer',
      },
    }),
    Placeholder.configure({...}),
  ],
});
```

**3. Add Link Styling**
Links will automatically be styled with the prose classes, appearing as underlined clickable text.

---

### How It Works

- **Type a URL** → It becomes a clickable link automatically
- **Paste a URL** → Instantly converted to a link
- **Click a link** → Opens in a new tab
- **Existing plain-text URLs** → Will remain as text (only new URLs get auto-linked)

---

### Optional: Toolbar Link Button
If you'd like, I can also add a **Link button** to the toolbar for manually adding/editing links to selected text. Let me know if you want that included.
