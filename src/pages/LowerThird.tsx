import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import TimeDisplay from "@/components/lower-thirds/TimeDisplay";
import TickerText from "@/components/lower-thirds/TickerText";

const LowerThird = () => {
  const [lowerThird, setLowerThird] = useState<Tables<"lower_thirds"> | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    const fetchActiveLowerThird = async () => {
      const { data, error } = await supabase
        .from("lower_thirds")
        .select("*")
        .eq("is_active", true)
        .single();

      if (error) {
        console.error("Error fetching lower third:", error);
        setLowerThird(null);
        return;
      }

      console.log("Active lower third:", data);
      setLowerThird(data);
    };

    fetchActiveLowerThird();

    // Listen for all changes to the active lower third
    const channel = supabase
      .channel("schema-db-changes")
      .on(
        "postgres_changes",
        {
          event: "*", // Listen to all events (INSERT, UPDATE, DELETE)
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

    // Also listen for updates to any currently active lower third
    const updateChannel = supabase
      .channel("active-lower-third-updates")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "lower_thirds",
        },
        (payload) => {
          // If this is our current lower third, update it
          if (lowerThird && payload.old.id === lowerThird.id) {
            if (!payload.new.is_active) {
              setLowerThird(null);
            } else {
              setLowerThird(payload.new as Tables<"lower_thirds">);
            }
          }
        }
      )
      .subscribe();

    return () => {
      clearInterval(timer);
      supabase.removeChannel(channel);
      supabase.removeChannel(updateChannel);
    };
  }, [lowerThird?.id]);

  // Return null if there's no active lower third
  if (!lowerThird) return null;

  const { primary_text, secondary_text, ticker_text, show_time, type, guest_image_url, logo_url } = lowerThird;

  return (
    <div className="fixed top-0 left-0 w-full">
      <div className="flex items-start gap-2 w-full">
        {type === "guest" && guest_image_url ? (
          <div className="relative">
            <div 
              className="bg-black/90"
              style={{
                width: '140px',
                height: '180px',
              }}
            >
              <img 
                src={guest_image_url} 
                alt="Guest"
                className="w-full h-full object-cover"
                style={{
                  objectPosition: 'center 20%'
                }}
              />
              <div className="absolute bottom-0 left-0 w-full bg-black/90 text-white py-2 text-lg font-bold uppercase text-center">
                {type}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-black/90 text-white px-4 py-2 text-lg font-bold uppercase">
            {type}
          </div>
        )}

        <div className="flex-1 bg-white/90 text-black p-4 flex justify-between items-start w-full">
          <div className="space-y-2 flex-1 min-w-0">
            {primary_text && (
              <h1 className="text-7xl font-bold leading-tight">{primary_text}</h1>
            )}
            {secondary_text && (
              <p className="text-5xl text-black/80 whitespace-nowrap overflow-hidden text-ellipsis">
                {secondary_text}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <TimeDisplay currentTime={currentTime} show={show_time} />
            {logo_url && (
              <img 
                src={logo_url} 
                alt="Logo"
                className="h-40 w-auto object-contain"
              />
            )}
          </div>
        </div>
      </div>

      <TickerText text={ticker_text} />
    </div>
  );
};

export default LowerThird;