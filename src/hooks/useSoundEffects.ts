import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface SoundEffect {
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

export interface CreateSoundEffectInput {
  title: string;
  file: File;
  color?: string;
}

export interface UpdateSoundEffectInput {
  id: string;
  title?: string;
  color?: string;
  volume?: number;
  trim_start?: number;
  trim_end?: number | null;
  file?: File;
  oldAudioUrl?: string;
}

export function useSoundEffects() {
  const queryClient = useQueryClient();

  const { data: soundEffects = [], isLoading } = useQuery({
    queryKey: ['sound-effects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sound_effects')
        .select('*')
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as SoundEffect[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async ({ title, file, color }: CreateSoundEffectInput) => {
      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('sound_effects')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('sound_effects')
        .getPublicUrl(fileName);

      // Get audio duration
      const duration = await getAudioDuration(file);

      // Create database record
      const { data, error } = await supabase
        .from('sound_effects')
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
      queryClient.invalidateQueries({ queryKey: ['sound-effects'] });
      toast.success('Sound effect added');
    },
    onError: (error) => {
      console.error('Error creating sound effect:', error);
      toast.error('Failed to add sound effect');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, file, oldAudioUrl, ...updates }: UpdateSoundEffectInput) => {
      let audioUrl: string | undefined;
      let duration: number | undefined;

      // If a new file is provided, upload it and delete the old one
      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('sound_effects')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('sound_effects')
          .getPublicUrl(fileName);

        audioUrl = publicUrl;
        duration = await getAudioDuration(file);

        // Delete old file if exists
        if (oldAudioUrl) {
          try {
            const url = new URL(oldAudioUrl);
            const oldFileName = url.pathname.split('/').pop();
            if (oldFileName) {
              await supabase.storage
                .from('sound_effects')
                .remove([oldFileName]);
            }
          } catch (e) {
            console.error('Error deleting old file:', e);
          }
        }
      }

      const { data, error } = await supabase
        .from('sound_effects')
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
      queryClient.invalidateQueries({ queryKey: ['sound-effects'] });
      toast.success('Sound effect updated');
    },
    onError: (error) => {
      console.error('Error updating sound effect:', error);
      toast.error('Failed to update sound effect');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      // Get the sound effect to find the file name
      const { data: soundEffect } = await supabase
        .from('sound_effects')
        .select('audio_url')
        .eq('id', id)
        .single();

      if (soundEffect) {
        // Extract filename from URL
        const url = new URL(soundEffect.audio_url);
        const fileName = url.pathname.split('/').pop();
        
        if (fileName) {
          await supabase.storage
            .from('sound_effects')
            .remove([fileName]);
        }
      }

      const { error } = await supabase
        .from('sound_effects')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sound-effects'] });
      toast.success('Sound effect deleted');
    },
    onError: (error) => {
      console.error('Error deleting sound effect:', error);
      toast.error('Failed to delete sound effect');
    },
  });

  return {
    soundEffects,
    isLoading,
    createSoundEffect: createMutation.mutateAsync,
    updateSoundEffect: updateMutation.mutateAsync,
    deleteSoundEffect: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

async function getAudioDuration(file: File): Promise<number> {
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
