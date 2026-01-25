import { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Edit, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import SplitBackground from "@/components/full-truth/shared/SplitBackground";
import { useTapestryBySlug } from "@/hooks/useTapestry";
import { useTapestryNodes } from "@/hooks/useTapestryNodes";
import { useAuth } from "@/hooks/useAuth";
import CharacterNode from "@/components/full-truth/nodes/CharacterNode";
import PointNode from "@/components/full-truth/nodes/PointNode";
import "../components/full-truth/nodes/nodeStyles.css";

const FullTruthViewer = () => {
  const { slug } = useParams<{ slug: string }>();
  const { session } = useAuth();
  const user = session?.user;

  const { data: tapestry, isLoading } = useTapestryBySlug(slug || '');
  const nodeOps = useTapestryNodes(tapestry?.id || '');

  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  // Get connected node IDs for highlighting
  const connectedNodeIds = useMemo(() => {
    if (!hoveredNodeId || !nodeOps.edges) return new Set<string>();
    
    const connected = new Set<string>();
    nodeOps.edges.forEach((edge) => {
      if (edge.source_node_id === hoveredNodeId) {
        connected.add(edge.target_node_id);
      }
      if (edge.target_node_id === hoveredNodeId) {
        connected.add(edge.source_node_id);
      }
    });
    return connected;
  }, [hoveredNodeId, nodeOps.edges]);

  const isOwner = tapestry && user && tapestry.created_by === user.id;

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!tapestry) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-background">
        <h1 className="text-2xl font-bold mb-4">Tapestry not found</h1>
        <Button asChild variant="outline">
          <Link to="/full-truth">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Gallery
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="h-screen relative overflow-hidden">
      {/* Background */}
      <SplitBackground theme={tapestry.theme_config} />

      {/* Header controls */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
        <Button asChild variant="secondary" size="sm">
          <Link to="/full-truth">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Link>
        </Button>

        {isOwner && (
          <Button asChild variant="secondary" size="sm">
            <Link to={`/full-truth/edit/${tapestry.id}`}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Link>
          </Button>
        )}
      </div>

      {/* Title */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20">
        <h1 className="text-2xl font-bold text-white drop-shadow-lg">
          {tapestry.title}
        </h1>
      </div>

      {/* Nodes */}
      <div className="absolute inset-0 z-10">
        {nodeOps.nodes?.map((node) => {
          const isHovered = hoveredNodeId === node.id;
          const isConnected = connectedNodeIds.has(node.id);
          const isDimmed = hoveredNodeId && !isHovered && !isConnected;

          const style: React.CSSProperties = {
            position: 'absolute',
            left: node.position_x,
            top: node.position_y,
            transform: `scale(${node.scale}) rotate(${node.rotation}deg)`,
            transition: 'opacity 0.3s ease, transform 0.3s ease',
            opacity: isDimmed ? 0.3 : 1,
          };

          return (
            <div
              key={node.id}
              style={style}
              onMouseEnter={() => setHoveredNodeId(node.id)}
              onMouseLeave={() => setHoveredNodeId(null)}
              className="cursor-pointer"
            >
              {node.type === 'character' ? (
                <CharacterNode data={node.data as any} />
              ) : (
                <PointNode data={node.data as any} />
              )}
            </div>
          );
        })}
      </div>

      {/* Connection lines */}
      <svg className="absolute inset-0 z-5 pointer-events-none">
        {nodeOps.edges?.map((edge) => {
          const sourceNode = nodeOps.nodes?.find((n) => n.id === edge.source_node_id);
          const targetNode = nodeOps.nodes?.find((n) => n.id === edge.target_node_id);

          if (!sourceNode || !targetNode) return null;

          const isHighlighted =
            hoveredNodeId === edge.source_node_id ||
            hoveredNodeId === edge.target_node_id;

          return (
            <line
              key={edge.id}
              x1={sourceNode.position_x + 50}
              y1={sourceNode.position_y + 50}
              x2={targetNode.position_x + 50}
              y2={targetNode.position_y + 50}
              stroke={isHighlighted ? "#fff" : "rgba(255,255,255,0.3)"}
              strokeWidth={isHighlighted ? 3 : 1}
              style={{ transition: 'all 0.3s ease' }}
            />
          );
        })}
      </svg>
    </div>
  );
};

export default FullTruthViewer;
