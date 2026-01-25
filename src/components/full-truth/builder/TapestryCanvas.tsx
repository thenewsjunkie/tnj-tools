import { useCallback, useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  NodeTypes,
  Panel,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import CharacterNode from "../nodes/CharacterNode";
import PointNode from "../nodes/PointNode";
import SplitBackground from "../shared/SplitBackground";
import type { ThemeConfig } from "@/types/tapestry";
import type { Node, Edge } from "@xyflow/react";

interface TapestryCanvasProps {
  nodes: Node[];
  edges: Edge[];
  themeConfig: ThemeConfig;
  onNodesChange: (changes: any) => void;
  onEdgesChange: (changes: any) => void;
  onConnect: (connection: Connection) => void;
  onNodeClick: (event: React.MouseEvent, node: Node) => void;
  onPaneClick: () => void;
}

const nodeTypes: NodeTypes = {
  character: CharacterNode,
  point: PointNode,
};

export function TapestryCanvas({
  nodes,
  edges,
  themeConfig,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onNodeClick,
  onPaneClick,
}: TapestryCanvasProps) {
  return (
    <div className="flex-1 relative">
      {/* Split background layer */}
      <SplitBackground theme={themeConfig} />

      {/* React Flow canvas */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        fitView
        snapToGrid
        snapGrid={[20, 20]}
        className="!bg-transparent"
        proOptions={{ hideAttribution: true }}
      >
        <Controls className="!bg-background !border-border" />
        <MiniMap 
          className="!bg-background !border-border"
          nodeColor={(node) => {
            if (node.type === 'character') return '#f59e0b';
            if (node.type === 'point') {
              const tag = (node.data as any)?.tag;
              if (tag === 'claim') return '#ef4444';
              if (tag === 'evidence') return '#3b82f6';
              return '#6b7280';
            }
            return '#6b7280';
          }}
        />
        <Panel position="bottom-center" className="text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded">
          Drag nodes to position • Click to select • Drag between handles to connect
        </Panel>
      </ReactFlow>
    </div>
  );
}
