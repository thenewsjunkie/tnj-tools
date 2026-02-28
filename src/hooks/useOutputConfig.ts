import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

export type StudioModule = "leaderboard" | "hall-of-frame";

export const STUDIO_MODULES: { id: StudioModule; label: string }[] = [
  { id: "leaderboard", label: "Secret Shows Gift Leaders" },
  { id: "hall-of-frame", label: "Hall of Frame" },
];

export interface OutputConfig {
  leftColumn: StudioModule[];
  rightColumn: StudioModule[];
}

const DEFAULT_CONFIG: OutputConfig = {
  leftColumn: ["leaderboard"],
  rightColumn: ["hall-of-frame"],
};

const CONFIG_KEY = "studio_output_config";

export const useOutputConfig = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["output-config"],
    queryFn: async (): Promise<OutputConfig> => {
      const { data, error } = await supabase
        .from("system_settings")
        .select("value")
        .eq("key", CONFIG_KEY)
        .maybeSingle();

      if (error) throw error;
      if (!data) return DEFAULT_CONFIG;
      return data.value as unknown as OutputConfig;
    },
  });

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel("output-config-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "system_settings", filter: `key=eq.${CONFIG_KEY}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ["output-config"] });
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  return query;
};

export const useUpdateOutputConfig = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (config: OutputConfig) => {
      const { error } = await supabase
        .from("system_settings")
        .upsert({ key: CONFIG_KEY, value: config as any, updated_at: new Date().toISOString() }, { onConflict: "key" });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["output-config"] });
    },
  });
};
