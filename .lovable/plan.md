

## Plan: Add TipTap Rich Text Editor to Notepad

### Overview
Replace the plain `<textarea>` with TipTap, a headless rich text editor that provides real visual formatting. When you click Bold, text will actually appear **bold** - not wrapped in asterisks.

### What Changes

| Current | After TipTap |
|---------|--------------|
| Plain textarea | Rich text editor with `contenteditable` |
| `**bold**` markers | Actual **bold** text |
| `*italic*` markers | Actual *italic* text |
| Plain string storage | HTML string storage |

### Visual Result

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ 📝 Notepad                                              (142 words, 856 chars) │
├─────────────────────────────────────────────────────────────────────────────┤
│ [B] [I] [U] │ [•] [1.] │ [A↑] [A↓] │ [⟲] [⟳] │ [🔍] │ [📋] [🖨️]            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   This text is bold, this is italic, and this is underlined.               │
│                                                                             │
│   • Bullet point with proper formatting                                     │
│   • Another bullet point                                                    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### Dependencies to Install

```json
{
  "@tiptap/react": "^2.1.0",
  "@tiptap/starter-kit": "^2.1.0",
  "@tiptap/extension-underline": "^2.1.0",
  "@tiptap/extension-placeholder": "^2.1.0"
}
```

---

### Files to Modify

| File | Action | Purpose |
|------|--------|---------|
| `package.json` | Modify | Add TipTap dependencies |
| `src/components/admin/show-prep/Notepad.tsx` | Rewrite | Replace textarea with TipTap editor |
| `src/components/admin/show-prep/NotepadToolbar.tsx` | Modify | Pass editor instance for direct formatting commands |
| `src/components/admin/show-prep/FindReplaceDialog.tsx` | Modify | Work with HTML content instead of plain text |

---

### Technical Implementation

#### 1. TipTap Editor Setup

```typescript
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';

const editor = useEditor({
  extensions: [
    StarterKit.configure({
      bulletList: { keepMarks: true },
      orderedList: { keepMarks: true },
    }),
    Underline,
    Placeholder.configure({
      placeholder: 'Start typing your notes...',
    }),
  ],
  content: value, // HTML string
  onUpdate: ({ editor }) => {
    onChange(editor.getHTML());
  },
});
```

#### 2. Toolbar Integration with Editor Commands

The toolbar will receive the TipTap editor instance and call its built-in commands:

```typescript
// Bold button
<Button onClick={() => editor.chain().focus().toggleBold().run()}>
  <Bold />
</Button>

// Available commands:
editor.chain().focus().toggleBold().run()
editor.chain().focus().toggleItalic().run()
editor.chain().focus().toggleUnderline().run()
editor.chain().focus().toggleBulletList().run()
editor.chain().focus().toggleOrderedList().run()
editor.chain().focus().undo().run()
editor.chain().focus().redo().run()
editor.commands.selectAll()
```

#### 3. Updated Notepad Component Structure

```typescript
interface NotepadProps {
  value: string;        // Now stores HTML
  onChange: (value: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const Notepad = ({ value, onChange, isOpen, onToggle }: NotepadProps) => {
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg'>('base');
  const [showFindReplace, setShowFindReplace] = useState(false);
  const { toast } = useToast();

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Placeholder.configure({ placeholder: 'Start typing your notes...' }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Sync external value changes
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  // Word/char count from plain text
  const plainText = editor?.getText() || '';
  const wordCount = plainText.trim() ? plainText.trim().split(/\s+/).length : 0;
  const charCount = plainText.length;
};
```

#### 4. Updated Toolbar Props

```typescript
interface NotepadToolbarProps {
  editor: Editor | null;  // TipTap editor instance
  onFontSizeUp: () => void;
  onFontSizeDown: () => void;
  onFindReplace: () => void;
  onCopyAll: () => void;
  onPrint: () => void;
  fontSize: 'sm' | 'base' | 'lg';
}

// Toolbar uses editor directly:
<ToolbarButton 
  onClick={() => editor?.chain().focus().toggleBold().run()} 
  isActive={editor?.isActive('bold')}
  icon={Bold} 
  label="Bold" 
/>
```

#### 5. Active State Highlighting

Toolbar buttons will show when formatting is active:

```typescript
<Button
  variant={editor?.isActive('bold') ? 'secondary' : 'ghost'}
  onClick={() => editor?.chain().focus().toggleBold().run()}
>
  <Bold />
</Button>
```

#### 6. Find & Replace with HTML

The FindReplaceDialog will work with the editor's plain text for searching, but apply replacements through the editor:

```typescript
// Get text for searching
const text = editor.getText();

// For replace, we need to handle HTML
// Option: Search in getText(), replace via editor commands
```

#### 7. Print with HTML Rendering

```typescript
const handlePrint = () => {
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Notepad</title>
          <style>
            body { font-family: system-ui; padding: 40px; line-height: 1.6; }
            ul, ol { margin-left: 20px; }
          </style>
        </head>
        <body>${editor.getHTML()}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  }
};
```

#### 8. Editor Styling

```typescript
<EditorContent 
  editor={editor} 
  className={`
    min-h-[400px] p-4 leading-relaxed bg-background text-foreground 
    prose prose-sm dark:prose-invert max-w-none
    focus:outline-none
    ${fontSizeClasses[fontSize]}
  `}
/>
```

#### 9. Keyboard Shortcuts

TipTap has built-in shortcuts that work automatically:
- Ctrl/Cmd + B → Bold
- Ctrl/Cmd + I → Italic
- Ctrl/Cmd + U → Underline (with extension)
- Ctrl/Cmd + Z → Undo
- Ctrl/Cmd + Shift + Z → Redo

We'll add custom handling for Ctrl+F (Find & Replace).

---

### Data Migration Consideration

The notepad currently stores plain text. After this change, it will store HTML. 

**Backward Compatibility**: Existing plain text will render correctly in TipTap (it treats plain text as valid content). New formatted content will be saved as HTML like:
```html
<p>This is <strong>bold</strong> and <em>italic</em> text.</p>
<ul><li>Bullet point</li></ul>
```

---

### Features After Implementation

| Feature | How It Works |
|---------|--------------|
| **Bold/Italic/Underline** | Real visual formatting, toggleable |
| **Bullet/Numbered Lists** | Proper HTML lists with indentation |
| **Undo/Redo** | Built-in editor history |
| **Select All** | `editor.commands.selectAll()` |
| **Copy All** | Copy HTML or plain text |
| **Print** | Renders formatted HTML |
| **Find & Replace** | Works on plain text content |
| **Font Size** | CSS class on editor container |
| **Keyboard Shortcuts** | Built-in + custom for find |
| **Word/Char Count** | Calculated from `editor.getText()` |

