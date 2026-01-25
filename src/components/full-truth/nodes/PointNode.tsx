import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import type { TapestryNodeSide, PointTagType, SourceLink } from '@/types/tapestry';
import { Link, AlertCircle, FileText, HelpCircle } from 'lucide-react';

interface PointNodeData {
  headline?: string;
  detail?: string;
  tag?: PointTagType;
  sources?: SourceLink[];
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

interface PointNodeProps {
  data: PointNodeData;
  selected?: boolean;
}

const tagConfig: Record<PointTagType, { bg: string; textColor: string; icon: React.ReactNode }> = {
  claim: { 
    bg: 'bg-destructive/90', 
    textColor: 'text-destructive-foreground',
    icon: <AlertCircle className="w-3 h-3" />
  },
  evidence: { 
    bg: 'bg-primary/90', 
    textColor: 'text-primary-foreground',
    icon: <FileText className="w-3 h-3" />
  },
  context: { 
    bg: 'bg-muted', 
    textColor: 'text-muted-foreground',
    icon: <HelpCircle className="w-3 h-3" />
  },
};

const PointNode = memo(({ data, selected }: PointNodeProps) => {
  const scale = data.scale || 1;
  const isViewer = data.isViewer || false;
  const tag = data.tag || 'context';
  const config = tagConfig[tag];
  
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
        "point-node transition-all duration-300 cursor-pointer",
        selected && !isViewer && "ring-2 ring-primary ring-offset-2 ring-offset-background",
        data.isHovered && "scale-105 shadow-2xl",
        data.isDimmed && "opacity-30"
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
            position={Position.Left} 
            className="!bg-primary !w-3 !h-3 !border-2 !border-background" 
          />
          <Handle 
            type="source" 
            position={Position.Right} 
            className="!bg-primary !w-3 !h-3 !border-2 !border-background" 
          />
        </>
      )}
      
      <div 
        className={cn(
          "p-4 rounded-lg shadow-lg max-w-64 min-w-48",
          "border-2 border-border",
          "transition-all duration-300",
          config.bg,
          config.textColor
        )}
      >
        {/* Tag badge */}
        <Badge 
          variant="secondary" 
          className={cn(
            "mb-2 text-xs uppercase tracking-wide",
            "bg-background/20 hover:bg-background/30"
          )}
        >
          <span className="mr-1">{config.icon}</span>
          {tag}
        </Badge>
        
        {/* Headline */}
        <h3 className="font-bold text-lg leading-tight mb-1">
          {data.headline || 'Untitled Point'}
        </h3>
        
        {/* Preview of detail (truncated) */}
        {data.detail && (
          <p className="text-sm opacity-90 line-clamp-2 leading-snug">
            {data.detail}
          </p>
        )}
        
        {/* Source indicator */}
        {data.sources && data.sources.length > 0 && (
          <div className="flex items-center gap-1 text-xs mt-2 opacity-80">
            <Link className="w-3 h-3" />
            <span>{data.sources.length} source{data.sources.length > 1 ? 's' : ''}</span>
          </div>
        )}
      </div>
    </div>
  );
});

PointNode.displayName = 'PointNode';

export default PointNode;
