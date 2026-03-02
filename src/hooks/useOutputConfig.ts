import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

export type StudioModule = "leaderboard" | "hall-of-frame" | "live-chat" | "ads" | "teleprompter" | "art-mode";

export const STUDIO_MODULES: { id: StudioModule; label: string }[] = [
  { id: "leaderboard", label: "Secret Shows Gifts" },
  { id: "hall-of-frame", label: "Hall of Frame" },
  { id: "live-chat", label: "Live Chat" },
  { id: "ads", label: "Ads" },
  { id: "teleprompter", label: "TelePrompter" },
  { id: "art-mode", label: "Art Mode" },
];

export type VideoPlacement = "center" | "pip-left" | "pip-right";

export interface VideoFeed {
  url: string;
  placement: VideoPlacement;
}

export type OverlayPosition = "top-left" | "top-right" | "bottom-left" | "bottom-right";

export interface OverlayConfig {
  clock?: { enabled: boolean; position: OverlayPosition };
  newsAlert?: { enabled: boolean; position: "top" | "bottom"; pollInterval?: number };
}

export interface OutputConfig {
  leftColumn: StudioModule[];
  rightColumn: StudioModule[];
  videoFeeds?: VideoFeed[];
  leftRotate?: boolean;
  rightRotate?: boolean;
  rotateInterval?: number; // seconds, default 30
  brightness?: number; // percentage, default 100
  contrast?: number; // percentage, default 100
  chatZoom?: number; // percentage, default 100 (range 100-300)
  chatSource?: "restream" | "discord"; // default "restream"
  fullScreen?: StudioModule | null;
  orientation?: "horizontal" | "vertical";
  rotation?: number; // 0, 90, 180, 270 degrees
  overlays?: OverlayConfig;
}

const DEFAULT_CONFIG: OutputConfig = {
  leftColumn: ["leaderboard"],
  rightColumn: ["hall-of-frame"],
  videoFeeds: [],
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

/** Extract a YouTube embed URL from various YouTube link formats */
export const getYouTubeEmbedUrl = (url: string): string | null => {
  try {
    const parsed = new URL(url);
    let videoId: string | null = null;

    if (parsed.hostname.includes("youtu.be")) {
      videoId = parsed.pathname.slice(1);
    } else if (parsed.hostname.includes("youtube.com")) {
      if (parsed.pathname === "/watch") {
        videoId = parsed.searchParams.get("v");
      } else if (parsed.pathname.startsWith("/live/")) {
        videoId = parsed.pathname.split("/live/")[1];
      } else if (parsed.pathname.startsWith("/embed/")) {
        videoId = parsed.pathname.split("/embed/")[1];
      }
    }

    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1`;
    }
  } catch {
    // invalid URL
  }
  return null;
};
