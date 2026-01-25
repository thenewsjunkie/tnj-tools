import { useState, useRef, useEffect, useCallback } from "react";
import { StickyNote, ChevronDown, ChevronUp } from "lucide-react";
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
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  const fontSizeClasses = {
    sm: 'text-xs',
    base: 'text-sm',
    lg: 'text-base',
  };

  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;
  const charCount = value.length;

  // Text wrapping helper
  const wrapSelection = useCallback((prefix: string, suffix: string) => {
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

    // Restore cursor position after state update
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        end + prefix.length
      );
    }, 0);
  }, [value, onChange]);

  // Formatting handlers
  const handleBold = useCallback(() => wrapSelection('**', '**'), [wrapSelection]);
  const handleItalic = useCallback(() => wrapSelection('*', '*'), [wrapSelection]);
  const handleUnderline = useCallback(() => wrapSelection('__', '__'), [wrapSelection]);

  // List handlers
  const insertBullet = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const beforeCursor = value.substring(0, start);
    const selectedText = value.substring(start, end);
    
    // Find the start of the current line
    const lineStart = beforeCursor.lastIndexOf('\n') + 1;

    if (selectedText.includes('\n')) {
      // Multiple lines selected - add bullet to each line
      const lines = selectedText.split('\n');
      const bulletedLines = lines.map(line => `• ${line}`).join('\n');
      const newText = value.substring(0, start) + bulletedLines + value.substring(end);
      onChange(newText);
    } else {
      // Single line - add bullet at line start
      const newText =
        value.substring(0, lineStart) +
        '• ' +
        value.substring(lineStart);
      onChange(newText);
    }

    setTimeout(() => textarea.focus(), 0);
  }, [value, onChange]);

  const insertNumberedList = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const beforeCursor = value.substring(0, start);
    const selectedText = value.substring(start, end);
    
    const lineStart = beforeCursor.lastIndexOf('\n') + 1;

    if (selectedText.includes('\n')) {
      // Multiple lines selected - number each line
      const lines = selectedText.split('\n');
      const numberedLines = lines.map((line, i) => `${i + 1}. ${line}`).join('\n');
      const newText = value.substring(0, start) + numberedLines + value.substring(end);
      onChange(newText);
    } else {
      // Single line - add "1. " at line start
      const newText =
        value.substring(0, lineStart) +
        '1. ' +
        value.substring(lineStart);
      onChange(newText);
    }

    setTimeout(() => textarea.focus(), 0);
  }, [value, onChange]);

  // Font size handlers
  const cycleFontSize = useCallback((direction: 'up' | 'down') => {
    const sizes: ('sm' | 'base' | 'lg')[] = ['sm', 'base', 'lg'];
    const currentIndex = sizes.indexOf(fontSize);
    const newIndex = direction === 'up'
      ? Math.min(currentIndex + 1, 2)
      : Math.max(currentIndex - 1, 0);
    setFontSize(sizes[newIndex]);
  }, [fontSize]);

  // Undo/Redo handlers (native browser)
  const handleUndo = useCallback(() => {
    textareaRef.current?.focus();
    document.execCommand('undo');
  }, []);

  const handleRedo = useCallback(() => {
    textareaRef.current?.focus();
    document.execCommand('redo');
  }, []);

  // Select All / Copy All
  const handleSelectAll = useCallback(() => {
    textareaRef.current?.select();
  }, []);

  const handleCopyAll = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(value);
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
  }, [value, toast]);

  // Print handler
  const handlePrint = useCallback(() => {
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
                white-space: pre-wrap;
                line-height: 1.6;
              }
            </style>
          </head>
          <body>${value.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  }, [value]);

  // Handle find & replace result
  const handleReplace = useCallback((newText: string) => {
    onChange(newText);
  }, [onChange]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modifier = isMac ? e.metaKey : e.ctrlKey;

      if (modifier && e.key === 'b') {
        e.preventDefault();
        handleBold();
      } else if (modifier && e.key === 'i') {
        e.preventDefault();
        handleItalic();
      } else if (modifier && e.key === 'u') {
        e.preventDefault();
        handleUnderline();
      } else if (modifier && e.key === 'f') {
        e.preventDefault();
        setShowFindReplace(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleBold, handleItalic, handleUnderline]);

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
          {value.trim() && (
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
            onBold={handleBold}
            onItalic={handleItalic}
            onUnderline={handleUnderline}
            onBulletList={insertBullet}
            onNumberedList={insertNumberedList}
            onFontSizeUp={() => cycleFontSize('up')}
            onFontSizeDown={() => cycleFontSize('down')}
            onUndo={handleUndo}
            onRedo={handleRedo}
            onFindReplace={() => setShowFindReplace(true)}
            onSelectAll={handleSelectAll}
            onCopyAll={handleCopyAll}
            onPrint={handlePrint}
            fontSize={fontSize}
          />

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Start typing your notes..."
            className={`w-full min-h-[400px] p-4 leading-relaxed bg-background text-foreground resize-none border-0 focus:outline-none focus:ring-0 ${fontSizeClasses[fontSize]}`}
            style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
          />
        </div>
      )}

      {/* Find & Replace Dialog */}
      <FindReplaceDialog
        open={showFindReplace}
        onOpenChange={setShowFindReplace}
        text={value}
        onReplace={handleReplace}
      />
    </div>
  );
};

export default Notepad;
