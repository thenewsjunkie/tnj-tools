import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useParams } from "react-router-dom";
import { AlertDisplay } from "@/components/alerts/AlertDisplay";
import { useAlertQueue } from "@/hooks/useAlertQueue";

const Alerts = () => {
  const [showPlayButton, setShowPlayButton] = useState(false);
  const { alertSlug, username } = useParams();
  const completingRef = useRef(false);
  const { currentAlert, handleAlertComplete } = useAlertQueue();

  // Function to convert title to slug
  const titleToSlug = (title: string) => {
    return title.toLowerCase().replace(/\s+/g, '-');
  };

  // Function to format username from URL
  const formatUsername = (username: string) => {
    return username.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  // Effect to handle URL-based alert triggering
  useEffect(() => {
    const triggerAlertFromUrl = async () => {
      if (!alertSlug || completingRef.current) return;

      const { data: alerts } = await supabase
        .from('alerts')
        .select('*');

      if (!alerts) return;

      const matchingAlert = alerts.find(alert => titleToSlug(alert.title) === alertSlug);
      
      if (matchingAlert) {
        completingRef.current = true;
        
        // Add to queue
        const { error } = await supabase
          .from('alert_queue')
          .insert({
            alert_id: matchingAlert.id,
            username: username ? formatUsername(username) : null,
            status: 'pending'
          });

        if (error) {
          console.error('Error queueing alert:', error);
        }
      }
    };

    triggerAlertFromUrl();
  }, [alertSlug, username]);

  if (!currentAlert) return null;

  return (
    <AlertDisplay
      currentAlert={currentAlert}
      showPlayButton={showPlayButton}
      setShowPlayButton={setShowPlayButton}
      onComplete={handleAlertComplete}
    />
  );
};

export default Alerts;