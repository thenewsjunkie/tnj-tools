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

interface NotepadToolbarProps {
  onBold: () => void;
  onItalic: () => void;
  onUnderline: () => void;
  onBulletList: () => void;
  onNumberedList: () => void;
  onFontSizeUp: () => void;
  onFontSizeDown: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onFindReplace: () => void;
  onSelectAll: () => void;
  onCopyAll: () => void;
  onPrint: () => void;
  fontSize: 'sm' | 'base' | 'lg';
}

const ToolbarButton = ({
  onClick,
  icon: Icon,
  label,
  shortcut,
}: {
  onClick: () => void;
  icon: React.ElementType;
  label: string;
  shortcut?: string;
}) => (
  <TooltipProvider delayDuration={300}>
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          size="sm"
          variant="ghost"
          onClick={onClick}
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
  onBold,
  onItalic,
  onUnderline,
  onBulletList,
  onNumberedList,
  onFontSizeUp,
  onFontSizeDown,
  onUndo,
  onRedo,
  onFindReplace,
  onSelectAll,
  onCopyAll,
  onPrint,
  fontSize,
}: NotepadToolbarProps) => {
  const fontSizeLabels = {
    sm: 'Small',
    base: 'Medium',
    lg: 'Large',
  };

  return (
    <div className="flex items-center gap-1 flex-wrap p-2 border-b border-border bg-muted/30">
      {/* Text Formatting */}
      <div className="flex items-center gap-0.5">
        <ToolbarButton onClick={onBold} icon={Bold} label="Bold" shortcut="Ctrl+B" />
        <ToolbarButton onClick={onItalic} icon={Italic} label="Italic" shortcut="Ctrl+I" />
        <ToolbarButton onClick={onUnderline} icon={Underline} label="Underline" shortcut="Ctrl+U" />
      </div>

      <Separator orientation="vertical" className="h-6 mx-1" />

      {/* Lists */}
      <div className="flex items-center gap-0.5">
        <ToolbarButton onClick={onBulletList} icon={List} label="Bullet List" />
        <ToolbarButton onClick={onNumberedList} icon={ListOrdered} label="Numbered List" />
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
        <ToolbarButton onClick={onUndo} icon={Undo2} label="Undo" shortcut="Ctrl+Z" />
        <ToolbarButton onClick={onRedo} icon={Redo2} label="Redo" shortcut="Ctrl+Shift+Z" />
      </div>

      <Separator orientation="vertical" className="h-6 mx-1" />

      {/* Search */}
      <ToolbarButton onClick={onFindReplace} icon={Search} label="Find & Replace" shortcut="Ctrl+F" />

      <Separator orientation="vertical" className="h-6 mx-1" />

      {/* Actions */}
      <div className="flex items-center gap-0.5">
        <ToolbarButton onClick={onSelectAll} icon={MousePointer2} label="Select All" shortcut="Ctrl+A" />
        <ToolbarButton onClick={onCopyAll} icon={ClipboardCopy} label="Copy All" />
        <ToolbarButton onClick={onPrint} icon={Printer} label="Print" />
      </div>
    </div>
  );
};

export default NotepadToolbar;
