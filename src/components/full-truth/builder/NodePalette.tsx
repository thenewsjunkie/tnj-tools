import { User, MessageSquare } from "lucide-react";

interface NodePaletteProps {
  onAddNode: (type: 'character' | 'point') => void;
}

export function NodePalette({ onAddNode }: NodePaletteProps) {
  return (
    <div className="w-16 border-r bg-background flex flex-col items-center py-4 gap-2">
      <button
        onClick={() => onAddNode('character')}
        className="w-12 h-12 rounded-lg border-2 border-dashed border-muted-foreground/30 hover:border-primary hover:bg-muted transition-all flex flex-col items-center justify-center gap-1 group"
        title="Add Character"
      >
        <User className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
        <span className="text-[10px] text-muted-foreground group-hover:text-primary">Person</span>
      </button>
      
      <button
        onClick={() => onAddNode('point')}
        className="w-12 h-12 rounded-lg border-2 border-dashed border-muted-foreground/30 hover:border-primary hover:bg-muted transition-all flex flex-col items-center justify-center gap-1 group"
        title="Add Point"
      >
        <MessageSquare className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
        <span className="text-[10px] text-muted-foreground group-hover:text-primary">Point</span>
      </button>
    </div>
  );
}
