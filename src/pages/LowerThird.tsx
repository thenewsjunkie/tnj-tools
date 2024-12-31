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

  if (!lowerThird) return null;

  const { primary_text, secondary_text, ticker_text, show_time, type, guest_image_url, logo_url } = lowerThird;

  return (
    <div className="fixed bottom-0 left-0 w-full">
      <div className="flex items-end w-full">
        {type === "guest" && guest_image_url ? (
          <div 
            className="relative bg-black/85 overflow-hidden rounded-l-lg" 
            style={{ 
              width: '240px',
              height: '280px',
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
            <div className="absolute bottom-0 left-0 w-full bg-black/85 text-white py-3 text-xl font-bold uppercase text-center">
              {type}
            </div>
          </div>
        ) : (
          <div className="absolute -top-12 left-0 z-10">
            <div className="bg-black/85 text-white px-8 py-4 text-xl font-bold uppercase">
              {type}
            </div>
          </div>
        )}

        <div className="flex-1 relative overflow-hidden" style={{ height: type === "guest" ? '280px' : 'auto' }}>
          {/* Professional gradient background */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#221F26] to-[#403E43] opacity-95"></div>
          
          {/* Accent line */}
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-neon-red"></div>
          
          {/* Content with enhanced styling */}
          <div className="relative p-6 pt-8 h-full flex flex-col justify-center">
            <div className="flex justify-between items-start w-full">
              <div className="space-y-2 flex-1 min-w-0">
                {primary_text && (
                  <h1 className={`text-7xl font-bold leading-tight text-white ${type === 'guest' ? 'border-b-2 border-neon-red inline-block pr-6 -mr-6' : ''}`}>
                    {primary_text}
                  </h1>
                )}
                {secondary_text && (
                  <p className="text-5xl text-white/90 whitespace-nowrap overflow-hidden text-ellipsis font-light">
                    {secondary_text}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-4 ml-auto">
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
        </div>
      </div>

      <TickerText text={ticker_text} />
    </div>
  );
};

export default LowerThird;