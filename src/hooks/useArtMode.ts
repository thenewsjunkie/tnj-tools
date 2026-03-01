import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

export interface ArtModeImage {
  id: string;
  imageUrl: string;
  label: string;
}

export interface ArtModeConfig {
  images: ArtModeImage[];
  intervalSeconds: number;
  permanent: boolean;
  transition: "fade" | "slide" | "zoom" | "none";
  frameStyle: "gold" | "dark" | "minimal" | "none";
}

const CONFIG_KEY = "studio_art_mode_config";

const DEFAULT_CONFIG: ArtModeConfig = {
  images: [],
  intervalSeconds: 30,
  permanent: false,
  transition: "fade",
  frameStyle: "gold",
};

export const useArtModeConfig = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["art-mode-config"],
    queryFn: async (): Promise<ArtModeConfig> => {
      const { data, error } = await supabase
        .from("system_settings")
        .select("value")
        .eq("key", CONFIG_KEY)
        .maybeSingle();
      if (error) throw error;
      if (!data) return DEFAULT_CONFIG;
      return { ...DEFAULT_CONFIG, ...(data.value as unknown as Partial<ArtModeConfig>) };
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel("art-mode-config-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "system_settings", filter: `key=eq.${CONFIG_KEY}` },
        () => queryClient.invalidateQueries({ queryKey: ["art-mode-config"] })
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  return query;
};

export const useUpdateArtModeConfig = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (config: ArtModeConfig) => {
      const { error } = await supabase
        .from("system_settings")
        .upsert({ key: CONFIG_KEY, value: config as any, updated_at: new Date().toISOString() }, { onConflict: "key" });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["art-mode-config"] }),
  });
};
