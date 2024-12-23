import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { format } from "date-fns";

const LowerThird = () => {
  const [lowerThird, setLowerThird] = useState<Tables<"lower_thirds"> | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Update time every second
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Get initial active lower third
    const fetchActiveLowerThird = async () => {
      const { data, error } = await supabase
        .from("lower_thirds")
        .select("*")
        .eq("is_active", true)
        .single();

      if (error) {
        console.error("Error fetching lower third:", error);
        return;
      }

      setLowerThird(data);
    };

    fetchActiveLowerThird();

    // Subscribe to changes
    const channel = supabase
      .channel("schema-db-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "lower_thirds",
          filter: "is_active=eq.true",
        },
        (payload) => {
          console.log("Lower third changed:", payload);
          if (payload.eventType === "DELETE" || !payload.new.is_active) {
            setLowerThird(null);
          } else {
            setLowerThird(payload.new as Tables<"lower_thirds">);
          }
        }
      )
      .subscribe();

    return () => {
      clearInterval(timer);
      supabase.removeChannel(channel);
    };
  }, []);

  if (!lowerThird) return null;

  const { primary_text, secondary_text, ticker_text, show_time, type } = lowerThird;

  return (
    <div className="fixed bottom-0 left-0 w-full p-4 font-sans">
      <div className="flex items-end gap-2 max-w-4xl animate-fade-in">
        {/* Type indicator */}
        <div className="bg-black/90 text-white px-4 py-2 text-sm font-bold uppercase">
          {type}
        </div>

        {/* Main content */}
        <div className="flex-1 bg-white/90 text-black p-4">
          <div className="flex justify-between items-start">
            <div className="space-y-1 flex-1">
              {primary_text && (
                <h1 className="text-2xl font-bold leading-tight">{primary_text}</h1>
              )}
              {secondary_text && (
                <p className="text-lg text-black/80">{secondary_text}</p>
              )}
            </div>
            {show_time && (
              <div className="text-neon-red font-bold ml-4">
                {format(currentTime, "HH:mm:ss")}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Ticker */}
      {ticker_text && (
        <div className="mt-2 bg-black/90 text-white p-2 max-w-4xl animate-slide-in-right">
          <p className="animate-marquee whitespace-nowrap">
            {ticker_text}
          </p>
        </div>
      )}
    </div>
  );
};

export default LowerThird;