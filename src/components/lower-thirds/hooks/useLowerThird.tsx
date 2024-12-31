import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

export const useLowerThird = () => {
  const [lowerThird, setLowerThird] = useState<Tables<"lower_thirds"> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const [logoLoaded, setLogoLoaded] = useState(false);

  useEffect(() => {
    const fetchActiveLowerThird = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("lower_thirds")
        .select("*")
        .eq("is_active", true)
        .single();

      if (error) {
        console.error("Error fetching lower third:", error);
        handleHide();
        return;
      }

      if (data) {
        handleHide(() => {
          setLowerThird(data);
          if (!data.logo_url) {
            setLogoLoaded(true);
          }
          setIsLoading(false);
        });
      } else {
        handleHide();
      }
    };

    const handleHide = (callback?: () => void) => {
      setIsVisible(false);
      setTimeout(() => {
        setLowerThird(null);
        setIsLoading(false);
        setLogoLoaded(false);
        callback?.();
      }, 400);
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
            handleHide();
          } else {
            handleHide(() => {
              setLowerThird(payload.new as Tables<"lower_thirds">);
              if (!payload.new.logo_url) {
                setLogoLoaded(true);
              }
              setIsLoading(false);
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Effect to handle logo loading and visibility
  useEffect(() => {
    if (lowerThird && !isLoading) {
      if (lowerThird.logo_url) {
        const img = new Image();
        img.onload = () => {
          setLogoLoaded(true);
          // Only show after logo is loaded
          requestAnimationFrame(() => {
            setIsVisible(true);
          });
        };
        img.src = lowerThird.logo_url;
      } else {
        // No logo to load, show immediately
        requestAnimationFrame(() => {
          setIsVisible(true);
        });
      }
    }
  }, [lowerThird, isLoading]);

  return { lowerThird, isLoading, isVisible, logoLoaded };
};