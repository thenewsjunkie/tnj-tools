import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface HallOfFramePhoto {
  id: string;
  image_url: string;
  caption: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface HallOfFrameSettings {
  id: string;
  interval_seconds: number;
  transition: string;
  updated_at: string;
}

export const useHallOfFramePhotos = () => {
  return useQuery({
    queryKey: ["hall-of-frame-photos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hall_of_frame_photos" as any)
        .select("*")
        .order("display_order", { ascending: true });
      if (error) throw error;
      return (data as unknown as HallOfFramePhoto[]) ?? [];
    },
  });
};

export const useAddHallOfFramePhoto = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ file, caption }: { file: File; caption?: string }) => {
      const ext = file.name.split(".").pop();
      const path = `${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("hall_of_frame")
        .upload(path, file);
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("hall_of_frame")
        .getPublicUrl(path);

      // Get max display_order
      const { data: existing } = await supabase
        .from("hall_of_frame_photos" as any)
        .select("display_order")
        .order("display_order", { ascending: false })
        .limit(1);
      const maxOrder = (existing as any)?.[0]?.display_order ?? -1;

      const { error } = await supabase
        .from("hall_of_frame_photos" as any)
        .insert({
          image_url: urlData.publicUrl,
          caption: caption || null,
          display_order: maxOrder + 1,
        } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hall-of-frame-photos"] });
      toast.success("Photo added");
    },
    onError: (e: Error) => toast.error(e.message),
  });
};

export const useDeleteHallOfFramePhoto = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (photo: HallOfFramePhoto) => {
      // Delete from storage
      const url = new URL(photo.image_url);
      const storagePath = url.pathname.split("/hall_of_frame/").pop();
      if (storagePath) {
        await supabase.storage.from("hall_of_frame").remove([storagePath]);
      }
      const { error } = await supabase
        .from("hall_of_frame_photos" as any)
        .delete()
        .eq("id", photo.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hall-of-frame-photos"] });
      toast.success("Photo deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });
};

export const useReorderHallOfFramePhotos = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (photos: { id: string; display_order: number }[]) => {
      for (const p of photos) {
        const { error } = await supabase
          .from("hall_of_frame_photos" as any)
          .update({ display_order: p.display_order } as any)
          .eq("id", p.id);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hall-of-frame-photos"] });
    },
  });
};

export const useHallOfFrameSettings = () => {
  return useQuery({
    queryKey: ["hall-of-frame-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hall_of_frame_settings" as any)
        .select("*")
        .limit(1)
        .single();
      if (error) throw error;
      return data as unknown as HallOfFrameSettings;
    },
  });
};

export const useUpdateHallOfFrameCaption = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, caption }: { id: string; caption: string | null }) => {
      const { error } = await supabase
        .from("hall_of_frame_photos" as any)
        .update({ caption } as any)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hall-of-frame-photos"] });
      toast.success("Caption updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });
};

export const useUpdateHallOfFrameSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (updates: { interval_seconds?: number; transition?: string }) => {
      const { data: existing } = await supabase
        .from("hall_of_frame_settings" as any)
        .select("id")
        .limit(1)
        .single();
      if (!existing) throw new Error("No settings row found");
      const { error } = await supabase
        .from("hall_of_frame_settings" as any)
        .update(updates as any)
        .eq("id", (existing as any).id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hall-of-frame-settings"] });
      toast.success("Settings updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });
};
