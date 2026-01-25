

## Plan: Turn Links into Hyperlinks in Notepad

### What You'll Get
URLs typed in the notepad will automatically become clickable links. You'll still be able to edit the text normally, but when viewing, any URLs will be highlighted and clickable.

### Approach: Hybrid View/Edit Mode

Since a standard textarea can't render clickable links, we'll create a hybrid component that:
- Shows an **editable textarea** when you're typing/editing
- Shows a **rendered view with clickable links** when you're not focused on it

```text
When editing (textarea):
┌────────────────────────────────────────┐
│ Check out https://example.com for more │
│ Also see https://google.com            │
│                                    |   │  ← cursor visible
└────────────────────────────────────────┘

When viewing (rendered):
┌────────────────────────────────────────┐
│ Check out https://example.com for more │
│ Also see https://google.com            │
│                                        │  ← links are blue & clickable
└────────────────────────────────────────┘
```

---

### File to Modify

| File | Change |
|------|--------|
| `src/components/admin/ShowPrep.tsx` | Replace Textarea with hybrid LinkableNotepad component |

---

### Technical Implementation

**1. Create a LinkableNotepad component within ShowPrep.tsx**

```typescript
interface LinkableNotepadProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const LinkableNotepad = ({ value, onChange, placeholder }: LinkableNotepadProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // URL regex pattern
  const urlRegex = /(https?:\/\/[^\s]+)/g;

  // Render text with clickable links
  const renderWithLinks = (text: string) => {
    if (!text) return null;
    
    const parts = text.split(urlRegex);
    return parts.map((part, i) => {
      if (part.match(urlRegex)) {
        return (
          <a 
            key={i}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {part}
          </a>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  if (isEditing) {
    return (
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => setIsEditing(false)}
        placeholder={placeholder}
        className="min-h-[300px] resize-y font-mono text-sm bg-background"
        autoFocus
      />
    );
  }

  return (
    <div
      onClick={() => setIsEditing(true)}
      className="min-h-[300px] p-3 font-mono text-sm bg-background border rounded-md 
                 cursor-text whitespace-pre-wrap break-words"
    >
      {value ? renderWithLinks(value) : (
        <span className="text-muted-foreground">{placeholder}</span>
      )}
    </div>
  );
};
```

**2. Replace the Textarea in the Notepad section**

```typescript
{isNotepadOpen && (
  <div className="mt-4 p-4 bg-muted/50 rounded-lg">
    <LinkableNotepad
      value={notepad}
      onChange={setNotepad}
      placeholder="Quick notes for the show..."
    />
    <div className="text-xs text-muted-foreground text-right mt-2">
      {notepad.trim() ? notepad.trim().split(/\s+/).length : 0} words
    </div>
  </div>
)}
```

---

### User Experience

1. Click on the notepad area to start editing (shows textarea)
2. Type your notes, including URLs like `https://example.com`
3. Click outside the notepad to stop editing
4. URLs become blue, clickable links that open in a new tab
5. Click anywhere on the notepad to edit again

---

### Edge Cases Handled

- **Empty notepad**: Shows placeholder text
- **Link clicks**: Prevents accidentally entering edit mode when clicking a link
- **Preserves formatting**: Whitespace and line breaks are preserved in view mode
- **Auto-focus**: When entering edit mode, the textarea is auto-focused

