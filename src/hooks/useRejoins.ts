import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Rejoin {
  id: string;
  title: string;
  audio_url: string;
  color: string;
  volume: number;
  trim_start: number;
  trim_end: number | null;
  duration: number | null;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface CreateRejoinInput {
  title: string;
  file: File;
  color?: string;
  volume?: number;
  trim_start?: number;
  trim_end?: number | null;
  duration?: number | null;
}

export interface UpdateRejoinInput {
  id: string;
  title?: string;
  color?: string;
  volume?: number;
  trim_start?: number;
  trim_end?: number | null;
  file?: File;
  oldAudioUrl?: string;
}

export interface ImportRejoinInput {
  title: string;
  audioBlob: Blob;
  extension?: string;
  color?: string;
  volume?: number;
  trim_start?: number;
  trim_end?: number | null;
  duration?: number | null;
}

export function useRejoins() {
  const queryClient = useQueryClient();

  const { data: rejoins = [], isLoading } = useQuery({
    queryKey: ['rejoins'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rejoins')
        .select('*')
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Rejoin[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async ({ title, file, color }: CreateRejoinInput) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('rejoins')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('rejoins')
        .getPublicUrl(fileName);

      const duration = await getAudioDuration(file);

      const { data, error } = await supabase
        .from('rejoins')
        .insert({
          title,
          audio_url: publicUrl,
          color: color || '#3b82f6',
          duration,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rejoins'] });
      toast.success('Rejoin added');
    },
    onError: (error) => {
      console.error('Error creating rejoin:', error);
      toast.error('Failed to add rejoin');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, file, oldAudioUrl, ...updates }: UpdateRejoinInput) => {
      let audioUrl: string | undefined;
      let duration: number | undefined;

      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('rejoins')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('rejoins')
          .getPublicUrl(fileName);

        audioUrl = publicUrl;
        duration = await getAudioDuration(file);

        if (oldAudioUrl) {
          try {
            const url = new URL(oldAudioUrl);
            const oldFileName = url.pathname.split('/').pop();
            if (oldFileName) {
              await supabase.storage
                .from('rejoins')
                .remove([oldFileName]);
            }
          } catch (e) {
            console.error('Error deleting old file:', e);
          }
        }
      }

      const { data, error } = await supabase
        .from('rejoins')
        .update({
          ...updates,
          ...(audioUrl && { audio_url: audioUrl }),
          ...(duration !== undefined && { duration, trim_start: 0, trim_end: null }),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rejoins'] });
      toast.success('Rejoin updated');
    },
    onError: (error) => {
      console.error('Error updating rejoin:', error);
      toast.error('Failed to update rejoin');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data: rejoin } = await supabase
        .from('rejoins')
        .select('audio_url')
        .eq('id', id)
        .single();

      if (rejoin) {
        const url = new URL(rejoin.audio_url);
        const fileName = url.pathname.split('/').pop();
        
        if (fileName) {
          await supabase.storage
            .from('rejoins')
            .remove([fileName]);
        }
      }

      const { error } = await supabase
        .from('rejoins')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rejoins'] });
      toast.success('Rejoin deleted');
    },
    onError: (error) => {
      console.error('Error deleting rejoin:', error);
      toast.error('Failed to delete rejoin');
    },
  });

  const importMutation = useMutation({
    mutationFn: async (rejoinsToImport: ImportRejoinInput[]) => {
      const results = [];
      
      for (const rejoin of rejoinsToImport) {
        const fileName = `${crypto.randomUUID()}.${rejoin.extension || 'mp3'}`;
        
        const { error: uploadError } = await supabase.storage
          .from('rejoins')
          .upload(fileName, rejoin.audioBlob);

        if (uploadError) {
          console.error('Error uploading rejoin:', rejoin.title, uploadError);
          continue;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('rejoins')
          .getPublicUrl(fileName);

        const { data, error } = await supabase
          .from('rejoins')
          .insert({
            title: rejoin.title,
            audio_url: publicUrl,
            color: rejoin.color || '#3b82f6',
            volume: rejoin.volume || 1.0,
            trim_start: rejoin.trim_start || 0,
            trim_end: rejoin.trim_end,
            duration: rejoin.duration,
          })
          .select()
          .single();

        if (!error && data) {
          results.push(data);
        }
      }
      
      return results;
    },
    onSuccess: (results) => {
      queryClient.invalidateQueries({ queryKey: ['rejoins'] });
      toast.success(`Imported ${results.length} rejoins`);
    },
    onError: (error) => {
      console.error('Error importing rejoins:', error);
      toast.error('Failed to import rejoins');
    },
  });

  return {
    rejoins,
    isLoading,
    createRejoin: createMutation.mutateAsync,
    updateRejoin: updateMutation.mutateAsync,
    deleteRejoin: deleteMutation.mutateAsync,
    importRejoins: importMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isImporting: importMutation.isPending,
  };
}

async function getAudioDuration(file: File | Blob): Promise<number> {
  return new Promise((resolve) => {
    const audio = new Audio();
    audio.addEventListener('loadedmetadata', () => {
      resolve(audio.duration);
    });
    audio.addEventListener('error', () => {
      resolve(0);
    });
    audio.src = URL.createObjectURL(file);
  });
}
