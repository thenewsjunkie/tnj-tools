import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { 
  TapestryNode, 
  TapestryEdge,
  CreateNodeInput, 
  UpdateNodeInput,
  CreateEdgeInput,
  TapestryNodeRow,
  TapestryEdgeRow,
  CharacterNodeData,
  PointNodeData,
  EdgeData,
} from "@/types/tapestry";
import type { Json } from "@/integrations/supabase/types";
import { transformNode, transformEdge } from "@/types/tapestry";

// Create a new node
export const useCreateNode = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (input: CreateNodeInput) => {
      const { data, error } = await supabase
        .from('tapestry_nodes')
        .insert([{
          tapestry_id: input.tapestry_id,
          type: input.type,
          side: input.side || 'neutral',
          position_x: input.position_x || 0,
          position_y: input.position_y || 0,
          scale: input.scale || 1,
          rotation: input.rotation || 0,
          data: input.data as Json,
          scene_visibility: input.scene_visibility || [],
        }])
        .select()
        .single();
      
      if (error) throw error;
      return transformNode(data as TapestryNodeRow);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tapestry', 'full', data.tapestry_id] });
    },
  });
};

// Update a node
export const useUpdateNode = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, tapestryId, ...input }: UpdateNodeInput & { id: string; tapestryId: string }) => {
      const updateData: Record<string, unknown> = {};
      if (input.type !== undefined) updateData.type = input.type;
      if (input.side !== undefined) updateData.side = input.side;
      if (input.position_x !== undefined) updateData.position_x = input.position_x;
      if (input.position_y !== undefined) updateData.position_y = input.position_y;
      if (input.scale !== undefined) updateData.scale = input.scale;
      if (input.rotation !== undefined) updateData.rotation = input.rotation;
      if (input.data !== undefined) updateData.data = input.data;
      if (input.scene_visibility !== undefined) updateData.scene_visibility = input.scene_visibility;
      
      const { data, error } = await supabase
        .from('tapestry_nodes')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return { node: transformNode(data as TapestryNodeRow), tapestryId };
    },
    onSuccess: ({ tapestryId }) => {
      queryClient.invalidateQueries({ queryKey: ['tapestry', 'full', tapestryId] });
    },
  });
};

// Batch update nodes (for position changes from React Flow)
export const useBatchUpdateNodes = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      tapestryId, 
      updates 
    }: { 
      tapestryId: string; 
      updates: Array<{ id: string; position_x: number; position_y: number }>;
    }) => {
      // Update nodes in parallel
      const promises = updates.map(({ id, position_x, position_y }) =>
        supabase
          .from('tapestry_nodes')
          .update({ position_x, position_y })
          .eq('id', id)
      );
      
      await Promise.all(promises);
      return { tapestryId };
    },
    onSuccess: ({ tapestryId }) => {
      queryClient.invalidateQueries({ queryKey: ['tapestry', 'full', tapestryId] });
    },
  });
};

// Delete a node
export const useDeleteNode = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ id, tapestryId }: { id: string; tapestryId: string }) => {
      const { error } = await supabase
        .from('tapestry_nodes')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return { tapestryId };
    },
    onSuccess: ({ tapestryId }) => {
      queryClient.invalidateQueries({ queryKey: ['tapestry', 'full', tapestryId] });
    },
    onError: (error) => {
      toast({ 
        title: 'Failed to delete node', 
        description: error.message,
        variant: 'destructive' 
      });
    },
  });
};

// Create an edge
export const useCreateEdge = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (input: CreateEdgeInput) => {
      const edgeData: EdgeData = input.data || { color: '#ffffff', animated: false };
      
      const { data, error } = await supabase
        .from('tapestry_edges')
        .insert([{
          tapestry_id: input.tapestry_id,
          source_node_id: input.source_node_id,
          target_node_id: input.target_node_id,
          data: edgeData as Json,
        }])
        .select()
        .single();
      
      if (error) throw error;
      return transformEdge(data as TapestryEdgeRow);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tapestry', 'full', data.tapestry_id] });
    },
  });
};

// Delete an edge
export const useDeleteEdge = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, tapestryId }: { id: string; tapestryId: string }) => {
      const { error } = await supabase
        .from('tapestry_edges')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return { tapestryId };
    },
    onSuccess: ({ tapestryId }) => {
      queryClient.invalidateQueries({ queryKey: ['tapestry', 'full', tapestryId] });
    },
  });
};

// Utility: Convert database nodes/edges to React Flow format
export const convertToFlowNodes = (nodes: TapestryNode[]) => {
  return nodes.map(node => ({
    id: node.id,
    type: node.type,
    position: { x: node.position_x, y: node.position_y },
    data: {
      ...node.data,
      side: node.side,
      scale: node.scale,
      rotation: node.rotation,
      nodeId: node.id,
    },
  }));
};

export const convertToFlowEdges = (edges: TapestryEdge[]) => {
  return edges.map(edge => ({
    id: edge.id,
    source: edge.source_node_id,
    target: edge.target_node_id,
    data: edge.data,
    animated: edge.data?.animated || false,
    style: { stroke: edge.data?.color || '#ffffff', strokeWidth: 2 },
  }));
};
