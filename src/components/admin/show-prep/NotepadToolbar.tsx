import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  AArrowUp,
  AArrowDown,
  Undo2,
  Redo2,
  Search,
  ClipboardCopy,
  MousePointer2,
  Printer,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Editor } from "@tiptap/react";

interface NotepadToolbarProps {
  editor: Editor | null;
  onFontSizeUp: () => void;
  onFontSizeDown: () => void;
  onFindReplace: () => void;
  onCopyAll: () => void;
  onPrint: () => void;
  fontSize: 'sm' | 'base' | 'lg';
}

const ToolbarButton = ({
  onClick,
  icon: Icon,
  label,
  shortcut,
  isActive = false,
  disabled = false,
}: {
  onClick: () => void;
  icon: React.ElementType;
  label: string;
  shortcut?: string;
  isActive?: boolean;
  disabled?: boolean;
}) => (
  <TooltipProvider delayDuration={300}>
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          size="sm"
          variant={isActive ? "secondary" : "ghost"}
          onClick={onClick}
          disabled={disabled}
          className="h-8 w-8 p-0"
        >
          <Icon className="h-4 w-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-xs">
        <p>{label}</p>
        {shortcut && <p className="text-muted-foreground">{shortcut}</p>}
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

const NotepadToolbar = ({
  editor,
  onFontSizeUp,
  onFontSizeDown,
  onFindReplace,
  onCopyAll,
  onPrint,
  fontSize,
}: NotepadToolbarProps) => {
  const fontSizeLabels = {
    sm: 'Small',
    base: 'Medium',
    lg: 'Large',
  };

  if (!editor) {
    return null;
  }

  return (
    <div className="flex items-center gap-1 flex-wrap p-2 border-b border-border bg-muted/30">
      {/* Text Formatting */}
      <div className="flex items-center gap-0.5">
        <ToolbarButton 
          onClick={() => editor.chain().focus().toggleBold().run()} 
          icon={Bold} 
          label="Bold" 
          shortcut="Ctrl+B"
          isActive={editor.isActive('bold')}
        />
        <ToolbarButton 
          onClick={() => editor.chain().focus().toggleItalic().run()} 
          icon={Italic} 
          label="Italic" 
          shortcut="Ctrl+I"
          isActive={editor.isActive('italic')}
        />
        <ToolbarButton 
          onClick={() => editor.chain().focus().toggleUnderline().run()} 
          icon={Underline} 
          label="Underline" 
          shortcut="Ctrl+U"
          isActive={editor.isActive('underline')}
        />
      </div>

      <Separator orientation="vertical" className="h-6 mx-1" />

      {/* Lists */}
      <div className="flex items-center gap-0.5">
        <ToolbarButton 
          onClick={() => editor.chain().focus().toggleBulletList().run()} 
          icon={List} 
          label="Bullet List"
          isActive={editor.isActive('bulletList')}
        />
        <ToolbarButton 
          onClick={() => editor.chain().focus().toggleOrderedList().run()} 
          icon={ListOrdered} 
          label="Numbered List"
          isActive={editor.isActive('orderedList')}
        />
      </div>

      <Separator orientation="vertical" className="h-6 mx-1" />

      {/* Font Size */}
      <div className="flex items-center gap-0.5">
        <ToolbarButton onClick={onFontSizeDown} icon={AArrowDown} label="Decrease Font Size" />
        <span className="text-xs text-muted-foreground px-1 min-w-[50px] text-center">
          {fontSizeLabels[fontSize]}
        </span>
        <ToolbarButton onClick={onFontSizeUp} icon={AArrowUp} label="Increase Font Size" />
      </div>

      <Separator orientation="vertical" className="h-6 mx-1" />

      {/* Undo/Redo */}
      <div className="flex items-center gap-0.5">
        <ToolbarButton 
          onClick={() => editor.chain().focus().undo().run()} 
          icon={Undo2} 
          label="Undo" 
          shortcut="Ctrl+Z"
          disabled={!editor.can().undo()}
        />
        <ToolbarButton 
          onClick={() => editor.chain().focus().redo().run()} 
          icon={Redo2} 
          label="Redo" 
          shortcut="Ctrl+Shift+Z"
          disabled={!editor.can().redo()}
        />
      </div>

      <Separator orientation="vertical" className="h-6 mx-1" />

      {/* Search */}
      <ToolbarButton onClick={onFindReplace} icon={Search} label="Find & Replace" shortcut="Ctrl+F" />

      <Separator orientation="vertical" className="h-6 mx-1" />

      {/* Actions */}
      <div className="flex items-center gap-0.5">
        <ToolbarButton 
          onClick={() => editor.commands.selectAll()} 
          icon={MousePointer2} 
          label="Select All" 
          shortcut="Ctrl+A" 
        />
        <ToolbarButton onClick={onCopyAll} icon={ClipboardCopy} label="Copy All" />
        <ToolbarButton onClick={onPrint} icon={Printer} label="Print" />
      </div>
    </div>
  );
};

export default NotepadToolbar;
