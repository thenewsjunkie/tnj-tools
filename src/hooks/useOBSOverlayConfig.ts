import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { StudioModule, STUDIO_MODULES } from "./useOutputConfig";

export type OverlayMode = "auto" | "manual";

export interface OBSOverlayConfig {
  enabledModules: StudioModule[];
  cycleIntervalSeconds: number;
  mode: OverlayMode;
  pinnedModule: StudioModule | null;
}

const DEFAULT_CONFIG: OBSOverlayConfig = {
  enabledModules: ["leaderboard"],
  cycleIntervalSeconds: 30,
  mode: "auto",
  pinnedModule: null,
};

const CONFIG_KEY = "obs_overlay_config";

export const useOBSOverlayConfig = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["obs-overlay-config"],
    queryFn: async (): Promise<OBSOverlayConfig> => {
      const { data, error } = await supabase
        .from("system_settings")
        .select("value")
        .eq("key", CONFIG_KEY)
        .maybeSingle();

      if (error) throw error;
      if (!data) return DEFAULT_CONFIG;
      return data.value as unknown as OBSOverlayConfig;
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel("obs-overlay-config-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "system_settings", filter: `key=eq.${CONFIG_KEY}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ["obs-overlay-config"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return query;
};

export const useUpdateOBSOverlayConfig = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (config: OBSOverlayConfig) => {
      const { error } = await supabase
        .from("system_settings")
        .upsert(
          { key: CONFIG_KEY, value: config as any, updated_at: new Date().toISOString() },
          { onConflict: "key" }
        );
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["obs-overlay-config"] });
    },
  });
};

export { STUDIO_MODULES };
