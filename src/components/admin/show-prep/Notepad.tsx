import { useState, useEffect, useCallback } from "react";
import { Link as RouterLink } from "react-router-dom";
import { StickyNote, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TiptapLink from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { useToast } from "@/hooks/use-toast";
import NotepadToolbar from "./NotepadToolbar";
import FindReplaceDialog from "./FindReplaceDialog";

interface NotepadProps {
  value: string;
  onChange: (value: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const Notepad = ({ value, onChange, isOpen, onToggle }: NotepadProps) => {
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg'>('base');
  const [showFindReplace, setShowFindReplace] = useState(false);
  const { toast } = useToast();

  const fontSizeClasses = {
    sm: 'prose-sm',
    base: 'prose-base',
    lg: 'prose-lg',
  };

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: { keepMarks: true },
        orderedList: { keepMarks: true },
      }),
      Underline,
      TiptapLink.configure({
        autolink: true,
        openOnClick: true,
        linkOnPaste: true,
        HTMLAttributes: {
          target: '_blank',
          rel: 'noopener noreferrer',
        },
      }),
      Placeholder.configure({
        placeholder: 'Start typing your notes...',
      }),
    ],
    content: value || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'outline-none min-h-[400px] p-4',
      },
    },
  });

  // Sync external value changes
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '');
    }
  }, [value, editor]);

  // Word/char count from plain text
  const plainText = editor?.getText() || '';
  const wordCount = plainText.trim() ? plainText.trim().split(/\s+/).length : 0;
  const charCount = plainText.length;

  // Font size handlers
  const cycleFontSize = useCallback((direction: 'up' | 'down') => {
    const sizes: ('sm' | 'base' | 'lg')[] = ['sm', 'base', 'lg'];
    const currentIndex = sizes.indexOf(fontSize);
    const newIndex = direction === 'up'
      ? Math.min(currentIndex + 1, 2)
      : Math.max(currentIndex - 1, 0);
    setFontSize(sizes[newIndex]);
  }, [fontSize]);

  // Copy All
  const handleCopyAll = useCallback(async () => {
    const text = editor?.getText() || '';
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: "Notepad content copied to clipboard",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  }, [editor, toast]);

  // Print handler
  const handlePrint = useCallback(() => {
    const html = editor?.getHTML() || '';
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Notepad</title>
            <style>
              body {
                font-family: system-ui, -apple-system, sans-serif;
                padding: 40px;
                line-height: 1.6;
                max-width: 800px;
                margin: 0 auto;
              }
              ul, ol { margin-left: 20px; }
              p { margin: 0.5em 0; }
            </style>
          </head>
          <body>${html}</body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  }, [editor]);

  // Handle find & replace result
  const handleReplace = useCallback((newHtml: string) => {
    if (editor) {
      editor.commands.setContent(newHtml);
      onChange(newHtml);
    }
  }, [editor, onChange]);

  // Keyboard shortcut for find
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modifier = isMac ? e.metaKey : e.ctrlKey;

      if (modifier && e.key === 'f') {
        e.preventDefault();
        setShowFindReplace(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return (
    <div className="w-full border-t border-border pt-4">
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 bg-muted/30 hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <StickyNote className="h-4 w-4" />
          <span>Notepad</span>
          <RouterLink
            to="/notepad"
            onClick={(e) => e.stopPropagation()}
            className="text-muted-foreground hover:text-foreground transition-colors"
            title="Open standalone notepad"
          >
            <ExternalLink className="h-3 w-3" />
          </RouterLink>
          {plainText.trim() && (
            <span className="text-xs text-muted-foreground font-normal">
              ({wordCount} words, {charCount} chars)
            </span>
          )}
        </div>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      {/* Content */}
      {isOpen && (
        <div className="border border-t-0 border-border bg-background shadow-sm">
          {/* Toolbar */}
          <NotepadToolbar
            editor={editor}
            onFontSizeUp={() => cycleFontSize('up')}
            onFontSizeDown={() => cycleFontSize('down')}
            onFindReplace={() => setShowFindReplace(true)}
            onCopyAll={handleCopyAll}
            onPrint={handlePrint}
            fontSize={fontSize}
          />

          {/* TipTap Editor */}
          <div 
            className={`
              prose dark:prose-invert max-w-none
              ${fontSizeClasses[fontSize]}
              [&_.ProseMirror]:min-h-[400px]
              [&_.ProseMirror]:p-4
              [&_.ProseMirror]:outline-none
              [&_.ProseMirror_p.is-editor-empty:first-child::before]:text-muted-foreground
              [&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]
              [&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left
              [&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none
              [&_.ProseMirror_p.is-editor-empty:first-child::before]:h-0
            `}
          >
            <EditorContent editor={editor} />
          </div>
        </div>
      )}

      {/* Find & Replace Dialog */}
      <FindReplaceDialog
        open={showFindReplace}
        onOpenChange={setShowFindReplace}
        editor={editor}
        onReplace={handleReplace}
      />
    </div>
  );
};

export default Notepad;
