import { useState, useCallback, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useNodesState, useEdgesState, addEdge, Connection } from "@xyflow/react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

import { BuilderToolbar } from "@/components/full-truth/builder/BuilderToolbar";
import { NodePalette } from "@/components/full-truth/builder/NodePalette";
import { NodeInspector } from "@/components/full-truth/builder/NodeInspector";
import { TapestryCanvas } from "@/components/full-truth/builder/TapestryCanvas";
import { ThemeSettingsDialog } from "@/components/full-truth/builder/ThemeSettingsDialog";

import { useTapestry, useCreateTapestry, useUpdateTapestry } from "@/hooks/useTapestry";
import { useTapestryNodes } from "@/hooks/useTapestryNodes";

import type { Node, Edge } from "@xyflow/react";
import type { ThemeConfig, CharacterNodeData, PointNodeData, TapestryNodeSide } from "@/types/tapestry";

const defaultTheme: ThemeConfig = {
  leftColor: "#1e3a5f",
  rightColor: "#5f1e1e",
  dividerColor: "#ffffff",
};

const FullTruthBuilder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);

  // Direct Supabase auth - bypasses useAuth which only works on /admin routes
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const isEditing = !!id;

  // Fetch existing tapestry if editing
  const { data: existingTapestry, isLoading: loadingTapestry } = useTapestry(id || '');

  // Mutations
  const createTapestry = useCreateTapestry();
  const updateTapestry = useUpdateTapestry();

  // Local state
  const [title, setTitle] = useState("Untitled Tapestry");
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [themeConfig, setThemeConfig] = useState<ThemeConfig>(defaultTheme);
  const [slug, setSlug] = useState<string>('');
  const [tapestryId, setTapestryId] = useState<string | null>(id || null);

  // React Flow state
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [themeDialogOpen, setThemeDialogOpen] = useState(false);

  // Node operations hook
  const nodeOps = useTapestryNodes(tapestryId || '');

  // Load existing tapestry data
  useEffect(() => {
    if (existingTapestry) {
      setTitle(existingTapestry.title);
      setStatus(existingTapestry.status);
      setThemeConfig(existingTapestry.theme_config);
      setSlug(existingTapestry.slug);
      setTapestryId(existingTapestry.id);
    }
  }, [existingTapestry]);

  // Load nodes when tapestry is loaded
  useEffect(() => {
    if (nodeOps.nodes && nodeOps.edges) {
      setNodes(nodeOps.flowNodes);
      setEdges(nodeOps.flowEdges);
    }
  }, [nodeOps.flowNodes, nodeOps.flowEdges, setNodes, setEdges]);

  // Handle connections
  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) => addEdge(connection, eds));
    },
    [setEdges]
  );

  // Handle node click
  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  // Handle pane click (deselect)
  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  // Add new node
  const handleAddNode = useCallback((type: 'character' | 'point') => {
    const newNode: Node = {
      id: `${type}-${Date.now()}`,
      type,
      position: { x: 400, y: 300 },
      data: type === 'character' 
        ? { name: 'New Person', title: '', imageUrl: '', notes: '', side: 'neutral' }
        : { headline: 'New Point', detail: '', tag: 'claim', sources: [], side: 'neutral' },
    };
    setNodes((nds) => [...nds, newNode]);
  }, [setNodes]);

  // Update node data
  const handleUpdateNode = useCallback((
    nodeId: string, 
    data: Partial<CharacterNodeData | PointNodeData>, 
    side?: TapestryNodeSide,
    scale?: number
  ) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              ...data,
              ...(side !== undefined ? { side } : {}),
              ...(scale !== undefined ? { scale } : {}),
            },
          };
        }
        return node;
      })
    );

    // Update selected node if it's the one being edited
    if (selectedNode?.id === nodeId) {
      setSelectedNode((prev) => prev ? {
        ...prev,
        data: { 
          ...prev.data, 
          ...data, 
          ...(side !== undefined ? { side } : {}),
          ...(scale !== undefined ? { scale } : {}),
        },
      } : null);
    }
  }, [setNodes, selectedNode]);

  // Delete node
  const handleDeleteNode = useCallback((nodeId: string) => {
    setNodes((nds) => nds.filter((n) => n.id !== nodeId));
    setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
    setSelectedNode(null);
  }, [setNodes, setEdges]);

  // Generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') + '-' + Date.now().toString(36);
  };

  // Save draft
  const handleSave = async () => {
    if (!user) {
      toast({ title: "Error", description: "You must be logged in to save", variant: "destructive" });
      return;
    }

    try {
      if (!tapestryId) {
        // Create new tapestry
        const newSlug = generateSlug(title);
        const result = await createTapestry.mutateAsync({
          title,
          slug: newSlug,
          theme_config: themeConfig,
        });
        setTapestryId(result.id);
        setSlug(result.slug);
        navigate(`/full-truth/edit/${result.id}`, { replace: true });
        toast({ title: "Saved", description: "Tapestry created as draft" });
      } else {
        // Update existing
        await updateTapestry.mutateAsync({
          id: tapestryId,
          title,
          theme_config: themeConfig,
        });
        toast({ title: "Saved", description: "Changes saved" });
      }

      // TODO: Save nodes and edges to database
    } catch (error) {
      toast({ title: "Error", description: "Failed to save", variant: "destructive" });
    }
  };

  // Publish
  const handlePublish = async () => {
    if (!tapestryId) {
      await handleSave();
    }

    if (!tapestryId) return;

    try {
      await updateTapestry.mutateAsync({
        id: tapestryId,
        status: 'published',
      });
      setStatus('published');
      toast({ title: "Published", description: "Tapestry is now public" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to publish", variant: "destructive" });
    }
  };

  if (isEditing && loadingTapestry) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      <BuilderToolbar
        title={title}
        status={status}
        isSaving={createTapestry.isPending || updateTapestry.isPending}
        isPublishing={updateTapestry.isPending}
        onSave={handleSave}
        onPublish={handlePublish}
        onOpenThemeSettings={() => setThemeDialogOpen(true)}
        slug={slug}
      />

      <ThemeSettingsDialog
        open={themeDialogOpen}
        onOpenChange={setThemeDialogOpen}
        themeConfig={themeConfig}
        onThemeChange={setThemeConfig}
      />

      <div className="flex-1 flex overflow-hidden">
        <NodePalette onAddNode={handleAddNode} />

        <TapestryCanvas
          nodes={nodes}
          edges={edges}
          themeConfig={themeConfig}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
        />

        <NodeInspector
          node={selectedNode}
          onUpdate={handleUpdateNode}
          onDelete={handleDeleteNode}
          onClose={() => setSelectedNode(null)}
        />
      </div>
    </div>
  );
};

export default FullTruthBuilder;
