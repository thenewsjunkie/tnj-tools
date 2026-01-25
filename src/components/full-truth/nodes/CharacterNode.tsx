import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { cn } from '@/lib/utils';
import type { TapestryNodeSide } from '@/types/tapestry';
import { User } from 'lucide-react';

interface CharacterNodeData {
  name?: string;
  title?: string;
  imageUrl?: string;
  notes?: string;
  side: TapestryNodeSide;
  scale: number;
  rotation: number;
  nodeId: string;
  isViewer?: boolean;
  isHovered?: boolean;
  isDimmed?: boolean;
  onHover?: (id: string | null) => void;
  onClick?: (id: string) => void;
  [key: string]: unknown;
}

interface CharacterNodeProps {
  data: CharacterNodeData;
  selected?: boolean;
}

const CharacterNode = memo(({ data, selected }: CharacterNodeProps) => {
  const scale = data.scale || 1;
  const isViewer = data.isViewer || false;
  
  const handleMouseEnter = () => {
    if (data.onHover) data.onHover(data.nodeId);
  };
  
  const handleMouseLeave = () => {
    if (data.onHover) data.onHover(null);
  };
  
  const handleClick = () => {
    if (data.onClick) data.onClick(data.nodeId);
  };

  return (
    <div 
      className={cn(
        "character-node flex flex-col items-center cursor-pointer transition-all duration-300",
        selected && !isViewer && "ring-2 ring-primary ring-offset-2 ring-offset-background rounded-lg",
        data.isHovered && "scale-105",
        data.isDimmed && "opacity-30",
        isViewer && "group"
      )}
      style={{ 
        transform: `scale(${scale}) rotate(${data.rotation || 0}deg)`,
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      {/* Connection handles (hidden in viewer mode) */}
      {!isViewer && (
        <>
          <Handle 
            type="target" 
            position={Position.Top} 
            className="!bg-primary !w-3 !h-3 !border-2 !border-background" 
          />
          <Handle 
            type="source" 
            position={Position.Bottom} 
            className="!bg-primary !w-3 !h-3 !border-2 !border-background" 
          />
        </>
      )}
      
      {/* Head - circular image */}
      <div 
        className={cn(
          "w-24 h-24 rounded-full overflow-hidden border-4 shadow-lg",
          "bg-muted flex items-center justify-center",
          "transition-all duration-300",
          "border-foreground/20",
          (data.isHovered || selected) && "shadow-2xl border-primary",
          isViewer && "group-hover:animate-[bob_1s_ease-in-out_infinite]"
        )}
      >
        {data.imageUrl ? (
          <img 
            src={data.imageUrl} 
            alt={data.name || 'Character'} 
            className="w-full h-full object-cover"
            draggable={false}
          />
        ) : (
          <User className="w-12 h-12 text-muted-foreground" />
        )}
      </div>
      
      {/* Stick */}
      <div 
        className={cn(
          "w-3 h-16 rounded-b-lg shadow-md",
          "transition-colors duration-300",
          "bg-amber-600",
          (data.isHovered || selected) && "bg-amber-500"
        )} 
      />
      
      {/* Name label */}
      <div className="text-center mt-2 max-w-32">
        <div className="font-bold text-lg text-foreground drop-shadow-lg leading-tight">
          {data.name || 'Unnamed'}
        </div>
        {data.title && (
          <div className="text-sm text-muted-foreground drop-shadow leading-tight">
            {data.title}
          </div>
        )}
      </div>
    </div>
  );
});

CharacterNode.displayName = 'CharacterNode';

export default CharacterNode;
