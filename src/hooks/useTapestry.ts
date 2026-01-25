import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { 
  Tapestry, 
  TapestryWithData, 
  CreateTapestryInput, 
  UpdateTapestryInput,
  TapestryRow,
  TapestryNodeRow,
  TapestryEdgeRow,
  TapestrySceneRow,
  ThemeConfig,
  SceneConfig,
} from "@/types/tapestry";
import type { Json } from "@/integrations/supabase/types";
import { transformTapestry, transformNode, transformEdge, transformScene } from "@/types/tapestry";

// Generate a URL-friendly slug from title
const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    + '-' + Date.now().toString(36);
};

// Fetch all published tapestries (public gallery)
export const useTapestries = () => {
  return useQuery({
    queryKey: ['tapestries', 'published'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tapestries')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return (data as TapestryRow[]).map(transformTapestry);
    },
  });
};

// Fetch user's own tapestries (for admin)
export const useMyTapestries = () => {
  return useQuery({
    queryKey: ['tapestries', 'mine'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('tapestries')
        .select('*')
        .eq('created_by', user.id)
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      return (data as TapestryRow[]).map(transformTapestry);
    },
  });
};

// Fetch a single tapestry by slug (for viewer)
export const useTapestryBySlug = (slug: string | undefined) => {
  return useQuery({
    queryKey: ['tapestry', 'slug', slug],
    queryFn: async () => {
      if (!slug) throw new Error('No slug provided');
      
      const { data, error } = await supabase
        .from('tapestries')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();
      
      if (error) throw error;
      if (!data) throw new Error('Tapestry not found');
      return transformTapestry(data as TapestryRow);
    },
    enabled: !!slug,
  });
};

// Fetch a single tapestry by ID with all related data (for builder)
export const useTapestryWithData = (id: string | undefined) => {
  return useQuery({
    queryKey: ['tapestry', 'full', id],
    queryFn: async () => {
      if (!id) throw new Error('No ID provided');
      
      // Fetch tapestry and related data in parallel
      const [tapestryResult, nodesResult, edgesResult, scenesResult] = await Promise.all([
        supabase.from('tapestries').select('*').eq('id', id).single(),
        supabase.from('tapestry_nodes').select('*').eq('tapestry_id', id).order('created_at'),
        supabase.from('tapestry_edges').select('*').eq('tapestry_id', id),
        supabase.from('tapestry_scenes').select('*').eq('tapestry_id', id).order('order_index'),
      ]);
      
      if (tapestryResult.error) throw tapestryResult.error;
      if (nodesResult.error) throw nodesResult.error;
      if (edgesResult.error) throw edgesResult.error;
      if (scenesResult.error) throw scenesResult.error;
      
      const tapestry = transformTapestry(tapestryResult.data as TapestryRow);
      
      return {
        ...tapestry,
        nodes: (nodesResult.data as TapestryNodeRow[]).map(transformNode),
        edges: (edgesResult.data as TapestryEdgeRow[]).map(transformEdge),
        scenes: (scenesResult.data as TapestrySceneRow[]).map(transformScene),
      } as TapestryWithData;
    },
    enabled: !!id,
  });
};

// Create a new tapestry
export const useCreateTapestry = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (input: CreateTapestryInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      
      const slug = input.slug || generateSlug(input.title);
      const themeConfig: ThemeConfig = input.theme_config || {
        leftColor: '#1e3a5f',
        rightColor: '#5f1e1e',
        dividerColor: '#ffffff'
      };
      
      const { data, error } = await supabase
        .from('tapestries')
        .insert([{
          title: input.title,
          slug,
          theme_config: themeConfig as Json,
          created_by: user.id,
        }])
        .select()
        .single();
      
      if (error) throw error;
      return transformTapestry(data as TapestryRow);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tapestries'] });
      toast({ title: 'Tapestry created!' });
    },
    onError: (error) => {
      toast({ 
        title: 'Failed to create tapestry', 
        description: error.message,
        variant: 'destructive' 
      });
    },
  });
};

// Update a tapestry
export const useUpdateTapestry = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ id, ...input }: UpdateTapestryInput & { id: string }) => {
      const updateData: Record<string, unknown> = {};
      if (input.title !== undefined) updateData.title = input.title;
      if (input.slug !== undefined) updateData.slug = input.slug;
      if (input.status !== undefined) updateData.status = input.status;
      if (input.thumbnail_url !== undefined) updateData.thumbnail_url = input.thumbnail_url;
      if (input.theme_config !== undefined) updateData.theme_config = input.theme_config;
      
      const { data, error } = await supabase
        .from('tapestries')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return transformTapestry(data as TapestryRow);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tapestries'] });
      queryClient.invalidateQueries({ queryKey: ['tapestry', 'full', data.id] });
      queryClient.invalidateQueries({ queryKey: ['tapestry', 'slug', data.slug] });
    },
    onError: (error) => {
      toast({ 
        title: 'Failed to update tapestry', 
        description: error.message,
        variant: 'destructive' 
      });
    },
  });
};

// Delete a tapestry
export const useDeleteTapestry = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('tapestries')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tapestries'] });
      toast({ title: 'Tapestry deleted' });
    },
    onError: (error) => {
      toast({ 
        title: 'Failed to delete tapestry', 
        description: error.message,
        variant: 'destructive' 
      });
    },
  });
};

// Publish a tapestry
export const usePublishTapestry = () => {
  const updateTapestry = useUpdateTapestry();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (id: string) => {
      return updateTapestry.mutateAsync({ id, status: 'published' });
    },
    onSuccess: () => {
      toast({ title: 'Tapestry published!' });
    },
  });
};

// Duplicate a tapestry
export const useDuplicateTapestry = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      
      // Fetch original tapestry with all data
      const [tapestryResult, nodesResult, edgesResult, scenesResult] = await Promise.all([
        supabase.from('tapestries').select('*').eq('id', id).single(),
        supabase.from('tapestry_nodes').select('*').eq('tapestry_id', id),
        supabase.from('tapestry_edges').select('*').eq('tapestry_id', id),
        supabase.from('tapestry_scenes').select('*').eq('tapestry_id', id),
      ]);
      
      if (tapestryResult.error) throw tapestryResult.error;
      
      const original = tapestryResult.data;
      const newSlug = generateSlug(original.title + ' Copy');
      
      // Create new tapestry
      const { data: newTapestry, error: tapestryError } = await supabase
        .from('tapestries')
        .insert({
          title: original.title + ' (Copy)',
          slug: newSlug,
          status: 'draft' as const,
          theme_config: original.theme_config,
          created_by: user.id,
        })
        .select()
        .single();
      
      if (tapestryError) throw tapestryError;
      
      // Create mapping of old node IDs to new node IDs
      const nodeIdMap = new Map<string, string>();
      
      // Duplicate nodes
      if (nodesResult.data && nodesResult.data.length > 0) {
        for (const node of nodesResult.data) {
          const { data: newNode, error } = await supabase
            .from('tapestry_nodes')
            .insert({
              tapestry_id: newTapestry.id,
              type: node.type,
              side: node.side,
              position_x: node.position_x,
              position_y: node.position_y,
              scale: node.scale,
              rotation: node.rotation,
              data: node.data,
              scene_visibility: node.scene_visibility,
            })
            .select()
            .single();
          
          if (error) throw error;
          nodeIdMap.set(node.id, newNode.id);
        }
      }
      
      // Duplicate edges with new node IDs
      if (edgesResult.data && edgesResult.data.length > 0) {
        const newEdges = edgesResult.data.map(edge => ({
          tapestry_id: newTapestry.id,
          source_node_id: nodeIdMap.get(edge.source_node_id)!,
          target_node_id: nodeIdMap.get(edge.target_node_id)!,
          data: edge.data,
        }));
        
        const { error } = await supabase.from('tapestry_edges').insert(newEdges);
        if (error) throw error;
      }
      
      // Duplicate scenes with updated node IDs
      if (scenesResult.data && scenesResult.data.length > 0) {
        const newScenes = scenesResult.data.map(scene => {
          const config = scene.config as SceneConfig;
          return {
            tapestry_id: newTapestry.id,
            order_index: scene.order_index,
            name: scene.name,
            config: {
              ...config,
              visibleNodes: config.visibleNodes?.map((nodeId: string) => nodeIdMap.get(nodeId) || nodeId) || [],
            },
          };
        });
        
        const { error } = await supabase.from('tapestry_scenes').insert(newScenes);
        if (error) throw error;
      }
      
      return transformTapestry(newTapestry as TapestryRow);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tapestries'] });
      toast({ title: 'Tapestry duplicated!' });
    },
    onError: (error) => {
      toast({ 
        title: 'Failed to duplicate tapestry', 
        description: error.message,
        variant: 'destructive' 
      });
    },
  });
};
