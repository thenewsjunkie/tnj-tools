import { useEffect, useState } from "react";
import { Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ViewerCounts {
  twitch: number;
  youtube: number;
}

export const ViewerCount = () => {
  const [counts, setCounts] = useState<ViewerCounts>({ twitch: 0, youtube: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchViewerCounts = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('viewer-count', {
          body: { action: "get" }
        });

        if (error) {
          console.error('[ViewerCount] Error fetching viewer counts:', error);
          return;
        }

        setCounts(data);
      } catch (error) {
        console.error('[ViewerCount] Unexpected error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Initial fetch
    fetchViewerCounts();

    // Fetch every minute
    const interval = setInterval(fetchViewerCounts, 60000);

    return () => clearInterval(interval);
  }, []);

  const totalViewers = counts.twitch + counts.youtube;

  return (
    <div className="flex items-center gap-2 bg-black/90 backdrop-blur-sm px-2 py-1 rounded-md">
      <Users className="h-4 w-4 text-white/90" />
      <div className="flex items-center gap-2 text-sm font-mono text-white/90">
        <span>{isLoading ? "..." : totalViewers}</span>
        <span className="text-xs text-white/50">
          (Twitch: {counts.twitch} • YT: {counts.youtube})
        </span>
      </div>
    </div>
  );
};