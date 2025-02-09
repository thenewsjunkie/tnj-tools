
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import Guest from "@/components/lower-thirds/Guest";
import Content from "@/components/lower-thirds/Content";
import TickerText from "@/components/lower-thirds/TickerText";
import { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

const LowerThird = () => {
  const [lowerThird, setLowerThird] = useState<Tables<"lower_thirds"> | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    const fetchActiveLowerThird = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("lower_thirds")
        .select("*")
        .eq("is_active", true)
        .maybeSingle();

      if (error) {
        console.error("Error fetching lower third:", error);
        setIsVisible(false);
        setTimeout(() => {
          setLowerThird(null);
          setIsLoading(false);
        }, 400);
        return;
      }

      if (data) {
        // Check if the lower third should be active based on its duration
        if (data.duration_seconds && data.activated_at) {
          const activatedAt = new Date(data.activated_at);
          const expirationTime = new Date(activatedAt.getTime() + (data.duration_seconds * 1000));
          
          if (new Date() > expirationTime) {
            console.log("Lower third has expired, deactivating");
            await supabase
              .from("lower_thirds")
              .update({ is_active: false })
              .eq("id", data.id);
            setIsVisible(false);
            setTimeout(() => {
              setLowerThird(null);
              setIsLoading(false);
            }, 400);
            return;
          }
        }

        setIsVisible(false);
        setTimeout(() => {
          setLowerThird(data);
          setIsLoading(false);
          setTimeout(() => {
            setIsVisible(true);
          }, 50);
        }, 400);
      } else {
        setIsVisible(false);
        setTimeout(() => {
          setLowerThird(null);
          setIsLoading(false);
        }, 400);
      }
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
        },
        (payload: RealtimePostgresChangesPayload<Tables<"lower_thirds">>) => {
          console.log("Lower third changed:", payload);
          
          // If this is the currently displayed lower third
          if (lowerThird && payload.old && 'id' in payload.old && payload.old.id === lowerThird.id) {
            // Check if it was deactivated or deleted
            if (payload.eventType === "DELETE" || (payload.new && !payload.new.is_active)) {
              console.log("Lower third deactivated or deleted");
              setIsVisible(false);
              setTimeout(() => {
                setLowerThird(null);
              }, 400);
            } else if (payload.new) {
              // Check if the lower third has expired
              if (payload.new.duration_seconds && payload.new.activated_at) {
                const activatedAt = new Date(payload.new.activated_at);
                const expirationTime = new Date(activatedAt.getTime() + (payload.new.duration_seconds * 1000));
                
                if (new Date() > expirationTime) {
                  console.log("Lower third has expired via payload update");
                  setIsVisible(false);
                  setTimeout(() => {
                    setLowerThird(null);
                  }, 400);
                  return;
                }
              }
              
              // Update the current lower third with new data
              setIsVisible(false);
              setTimeout(() => {
                setLowerThird(payload.new as Tables<"lower_thirds">);
                setTimeout(() => {
                  setIsVisible(true);
                }, 50);
              }, 400);
            }
          } else if (payload.eventType !== "DELETE" && payload.new && payload.new.is_active) {
            // A different lower third was activated
            console.log("New lower third activated");
            
            // Check if the new lower third has already expired
            if (payload.new.duration_seconds && payload.new.activated_at) {
              const activatedAt = new Date(payload.new.activated_at);
              const expirationTime = new Date(activatedAt.getTime() + (payload.new.duration_seconds * 1000));
              
              if (new Date() > expirationTime) {
                console.log("New lower third is already expired");
                return;
              }
            }
            
            setIsVisible(false);
            setTimeout(() => {
              setLowerThird(payload.new as Tables<"lower_thirds">);
              setTimeout(() => {
                setIsVisible(true);
              }, 50);
            }, 400);
          }
        }
      )
      .subscribe();

    return () => {
      clearInterval(timer);
      supabase.removeChannel(channel);
    };
  }, [lowerThird?.id]);

  // Add a timer effect to check for expiration
  useEffect(() => {
    if (lowerThird?.duration_seconds && lowerThird.activated_at) {
      const activatedAt = new Date(lowerThird.activated_at);
      const expirationTime = new Date(activatedAt.getTime() + (lowerThird.duration_seconds * 1000));
      
      if (new Date() > expirationTime) {
        console.log("Lower third expired via timer check");
        supabase
          .from("lower_thirds")
          .update({ is_active: false })
          .eq("id", lowerThird.id)
          .then(() => {
            setIsVisible(false);
            setTimeout(() => {
              setLowerThird(null);
            }, 400);
          });
      }
    }
  }, [currentTime, lowerThird]);

  if (!lowerThird || isLoading) return null;

  const { type, guest_image_url, ticker_text } = lowerThird;

  return (
    <div className={`fixed bottom-0 left-0 w-full transition-opacity duration-400 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <div className="flex items-end w-full">
        {type === "guest" && guest_image_url ? (
          <Guest imageUrl={guest_image_url} type={type} isVisible={isVisible} />
        ) : (
          <div className="absolute -top-16 left-0 z-10">
            <div className={`bg-black/85 text-white px-8 py-4 text-xl font-bold uppercase ${isVisible ? 'animate-fade-in' : ''}`}>
              {type}
            </div>
          </div>
        )}

        <div className={`flex-1 relative overflow-hidden ${isVisible ? 'animate-slide-in-bottom' : ''}`} style={{ height: type === "guest" ? '280px' : 'auto' }}>
          <Content lowerThird={lowerThird} currentTime={currentTime} isVisible={isVisible} />
        </div>
      </div>

      <TickerText text={ticker_text} />
    </div>
  );
};

export default LowerThird;
