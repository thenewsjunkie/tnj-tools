
## Plan: Enhanced Notepad with Toolbar & Features

### Overview
Transform the simple notepad into a full-featured text editor with a toolbar menu, matching the style of onlinenotepad.org. The notepad will have formatting options, editing tools, and utility functions.

### What You'll Get

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ 📝 Notepad                                              (142 words, 856 chars) │
├─────────────────────────────────────────────────────────────────────────────┤
│ [B] [I] [U] │ [•] [1.] │ [A↑] [A↓] │ [⟲] [⟳] │ [🔍] │ [📋] [🖨️] │ [▼ More] │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   Your notes here with **bold**, *italic*, and other formatting...         │
│                                                                             │
│   • Bullet point 1                                                          │
│   • Bullet point 2                                                          │
│                                                                             │
│   Links like https://example.com become clickable                           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Features Breakdown

| Feature | Description |
|---------|-------------|
| **Bold/Italic/Underline** | Wrap selected text with formatting markers |
| **Bullet Lists** | Insert bullet points at cursor or start of lines |
| **Font Size** | Cycle between Small, Medium, Large text |
| **Find & Replace** | Search dialog with optional replace functionality |
| **Undo/Redo** | Browser native undo/redo with keyboard shortcuts |
| **Select All / Copy All** | Quick buttons for common operations |
| **Print** | Print notepad contents directly |
| **Word & Character Count** | Live counts shown in header |

---

### Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `src/components/admin/show-prep/Notepad.tsx` | Create | New dedicated notepad component |
| `src/components/admin/show-prep/NotepadToolbar.tsx` | Create | Toolbar with all formatting/editing buttons |
| `src/components/admin/show-prep/FindReplaceDialog.tsx` | Create | Modal for find & replace functionality |
| `src/components/admin/ShowPrep.tsx` | Modify | Import and use new Notepad component |

---

### Technical Implementation

#### 1. Notepad Component Structure

```typescript
// src/components/admin/show-prep/Notepad.tsx
interface NotepadProps {
  value: string;
  onChange: (value: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

// State management
const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg'>('base');
const [showFindReplace, setShowFindReplace] = useState(false);
const textareaRef = useRef<HTMLTextAreaElement>(null);
```

#### 2. Toolbar Button Groups

The toolbar will be organized into logical groups:

```text
Group 1: Text Formatting    [B] [I] [U]
Group 2: Lists              [• Bullet] [1. Numbered]
Group 3: Font Size          [A↓ Smaller] [A↑ Larger]
Group 4: History            [↩ Undo] [↪ Redo]
Group 5: Search             [🔍 Find & Replace]
Group 6: Actions            [Select All] [Copy All] [Print]
```

#### 3. Text Formatting Implementation

For bold/italic/underline, we'll wrap selected text with markdown-style markers:

```typescript
const wrapSelection = (prefix: string, suffix: string) => {
  const textarea = textareaRef.current;
  if (!textarea) return;
  
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selectedText = value.substring(start, end);
  
  const newText = 
    value.substring(0, start) + 
    prefix + selectedText + suffix + 
    value.substring(end);
  
  onChange(newText);
  
  // Restore cursor position
  setTimeout(() => {
    textarea.focus();
    textarea.setSelectionRange(
      start + prefix.length, 
      end + prefix.length
    );
  }, 0);
};

// Usage
const handleBold = () => wrapSelection('**', '**');
const handleItalic = () => wrapSelection('*', '*');
const handleUnderline = () => wrapSelection('__', '__');
```

#### 4. Bullet List Implementation

```typescript
const insertBullet = () => {
  const textarea = textareaRef.current;
  if (!textarea) return;
  
  const start = textarea.selectionStart;
  const beforeCursor = value.substring(0, start);
  const afterCursor = value.substring(start);
  
  // Find the start of the current line
  const lineStart = beforeCursor.lastIndexOf('\n') + 1;
  
  // Insert bullet at line start
  const newText = 
    value.substring(0, lineStart) + 
    '• ' + 
    value.substring(lineStart);
  
  onChange(newText);
};
```

#### 5. Find & Replace Dialog

```typescript
// src/components/admin/show-prep/FindReplaceDialog.tsx
interface FindReplaceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  text: string;
  onReplace: (newText: string) => void;
}

// Features:
// - Find input with match highlighting
// - Replace input
// - "Replace" button (single occurrence)
// - "Replace All" button
// - Match count display
```

#### 6. Font Size Cycling

```typescript
const fontSizes = {
  sm: { class: 'text-xs', label: 'Small' },
  base: { class: 'text-sm', label: 'Medium' },
  lg: { class: 'text-base', label: 'Large' }
};

const cycleFontSize = (direction: 'up' | 'down') => {
  const sizes: ('sm' | 'base' | 'lg')[] = ['sm', 'base', 'lg'];
  const currentIndex = sizes.indexOf(fontSize);
  const newIndex = direction === 'up' 
    ? Math.min(currentIndex + 1, 2) 
    : Math.max(currentIndex - 1, 0);
  setFontSize(sizes[newIndex]);
};
```

#### 7. Undo/Redo (Browser Native)

```typescript
const handleUndo = () => {
  document.execCommand('undo');
};

const handleRedo = () => {
  document.execCommand('redo');
};
```

#### 8. Select All / Copy All

```typescript
const handleSelectAll = () => {
  textareaRef.current?.select();
};

const handleCopyAll = async () => {
  await navigator.clipboard.writeText(value);
  toast({ title: "Copied!", description: "Notepad content copied to clipboard" });
};
```

#### 9. Print Functionality

```typescript
const handlePrint = () => {
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(`
      <html>
        <head><title>Notepad</title></head>
        <body style="font-family: system-ui; padding: 20px; white-space: pre-wrap;">
          ${value}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  }
};
```

#### 10. Character & Word Count in Header

```typescript
const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;
const charCount = value.length;

// Displayed in header:
<span className="text-xs text-muted-foreground">
  ({wordCount} words, {charCount} chars)
</span>
```

---

### Toolbar Visual Layout

```typescript
<div className="flex items-center gap-1 flex-wrap p-2 border-b bg-muted/30">
  {/* Format group */}
  <div className="flex items-center gap-0.5">
    <Button size="sm" variant="ghost" onClick={handleBold} title="Bold">
      <Bold className="h-4 w-4" />
    </Button>
    <Button size="sm" variant="ghost" onClick={handleItalic} title="Italic">
      <Italic className="h-4 w-4" />
    </Button>
    <Button size="sm" variant="ghost" onClick={handleUnderline} title="Underline">
      <Underline className="h-4 w-4" />
    </Button>
  </div>
  
  <Separator orientation="vertical" className="h-6 mx-1" />
  
  {/* Lists group */}
  <div className="flex items-center gap-0.5">
    <Button size="sm" variant="ghost" onClick={insertBullet} title="Bullet List">
      <List className="h-4 w-4" />
    </Button>
    <Button size="sm" variant="ghost" onClick={insertNumbered} title="Numbered List">
      <ListOrdered className="h-4 w-4" />
    </Button>
  </div>
  
  {/* ... more groups */}
</div>
```

---

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Ctrl/Cmd + B | Bold |
| Ctrl/Cmd + I | Italic |
| Ctrl/Cmd + U | Underline |
| Ctrl/Cmd + F | Find & Replace |
| Ctrl/Cmd + A | Select All |
| Ctrl/Cmd + Z | Undo |
| Ctrl/Cmd + Shift + Z | Redo |

---

### Migration from Current Implementation

The current `LinkableNotepad` component in ShowPrep.tsx will be replaced by importing the new dedicated `Notepad` component. The hybrid edit/view mode with clickable links will be preserved and enhanced.

---

### Result

A professional notepad with:
- Visual toolbar matching the onlinenotepad.org style
- Text formatting (bold, italic, underline)
- List creation (bullets and numbered)
- Adjustable font sizes
- Find & replace functionality
- Quick copy/select all/print actions
- Live word and character counts
- Keyboard shortcuts for power users
- All content still auto-saves per date
