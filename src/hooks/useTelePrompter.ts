import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

export interface TelePrompterConfig {
  script: string;
  isPlaying: boolean;
  speed: number;
  fontSize: number;
  mirror: boolean;
  scrollPosition: number;
}

const CONFIG_KEY = "teleprompter_config";

const DEFAULT_CONFIG: TelePrompterConfig = {
  script: "",
  isPlaying: false,
  speed: 3,
  fontSize: 36,
  mirror: false,
  scrollPosition: 0,
};

export const useTelePrompter = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["teleprompter-config"],
    queryFn: async (): Promise<TelePrompterConfig> => {
      const { data, error } = await supabase
        .from("system_settings")
        .select("value")
        .eq("key", CONFIG_KEY)
        .maybeSingle();

      if (error) throw error;
      if (!data) return DEFAULT_CONFIG;
      return { ...DEFAULT_CONFIG, ...(data.value as unknown as Partial<TelePrompterConfig>) };
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel("teleprompter-config-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "system_settings", filter: `key=eq.${CONFIG_KEY}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ["teleprompter-config"] });
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  return query;
};

export const useUpdateTelePrompter = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (config: TelePrompterConfig) => {
      const { error } = await supabase
        .from("system_settings")
        .upsert(
          { key: CONFIG_KEY, value: config as any, updated_at: new Date().toISOString() },
          { onConflict: "key" }
        );
      if (error) throw error;
    },
    onMutate: async (config) => {
      await queryClient.cancelQueries({ queryKey: ["teleprompter-config"] });
      queryClient.setQueryData(["teleprompter-config"], config);
    },
  });
};
