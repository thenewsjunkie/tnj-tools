import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { debounce } from "lodash";

interface SessionValidatorProps {
  code: string;
  onValidSession: (data: SessionData, isHost: boolean) => void;
}

interface SessionData {
  id: string;
  host_device_id: string | null;
  viewer_device_id: string | null;
  host_connected: boolean;
  viewer_connected: boolean;
  is_active: boolean;
  share_code: string;
  expires_at: string;
}

const SessionValidator = ({ code, onValidSession }: SessionValidatorProps) => {
  const [validating, setValidating] = useState(true);
  const { toast } = useToast();
  const [hasShownError, setHasShownError] = useState(false);

  const showError = useCallback(
    debounce((title: string, description: string) => {
      if (!hasShownError) {
        toast({
          title,
          description,
          variant: "destructive",
        });
        setHasShownError(true);
      }
    }, 1000),
    [hasShownError, toast]
  );

  useEffect(() => {
    let isMounted = true;
    let subscription: any = null;

    const validateSession = async () => {
      try {
        if (!code) {
          setValidating(false);
          return;
        }

        setHasShownError(false);
        
        // Get or create a persistent device ID
        let deviceId = localStorage.getItem('screen_share_device_id');
        if (!deviceId) {
          deviceId = crypto.randomUUID();
          localStorage.setItem('screen_share_device_id', deviceId);
        }

        // First, check if the session exists and is valid
        const { data: sessionData, error: fetchError } = await supabase
          .from('screen_share_sessions')
          .select('*')
          .eq('share_code', code.toUpperCase())
          .eq('is_active', true)
          .single();

        if (!isMounted) return;

        if (fetchError || !sessionData) {
          showError(
            "Invalid session",
            "This screen share session does not exist or is no longer active."
          );
          setValidating(false);
          return;
        }

        const now = new Date();
        const expiresAt = new Date(sessionData.expires_at);
        
        if (expiresAt < now) {
          showError(
            "Session expired",
            "This screen share session has expired."
          );
          setValidating(false);
          return;
        }

        // Try to claim host role with a transaction
        const { data: updatedSession, error: updateError } = await supabase.rpc<SessionData, { 
          p_session_id: string;
          p_device_id: string;
          p_share_code: string;
        }>(
          'claim_screen_share_role',
          { 
            p_session_id: sessionData.id,
            p_device_id: deviceId,
            p_share_code: code.toUpperCase()
          }
        );

        if (!isMounted) return;

        if (updateError || !updatedSession) {
          console.error('Failed to update connection status:', updateError);
          showError(
            "Connection error",
            "Failed to establish connection to the session."
          );
          setValidating(false);
          return;
        }

        const isHost = updatedSession.host_device_id === deviceId;
        
        // If not host and viewer is already connected
        if (!isHost && updatedSession.viewer_connected && updatedSession.viewer_device_id !== deviceId) {
          showError(
            "Session in use",
            "Another viewer is already connected to this session."
          );
          setValidating(false);
          return;
        }

        // Subscribe to session changes
        subscription = supabase
          .channel(`session_${sessionData.id}`)
          .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'screen_share_sessions',
            filter: `id=eq.${sessionData.id}`
          }, (payload) => {
            const newData = payload.new as SessionData;
            // Check if this device is still connected
            const isStillConnected = isHost 
              ? newData.host_device_id === deviceId 
              : newData.viewer_device_id === deviceId;
            
            if (!isStillConnected || !newData.is_active) {
              showError(
                "Session disconnected",
                "Your connection was terminated."
              );
              setValidating(false);
              return;
            }
          })
          .subscribe();

        if (isMounted) {
          onValidSession(updatedSession, isHost);
        }
      } catch (error) {
        if (!isMounted) return;
        console.error('Session validation error:', error);
        showError(
          "Error",
          "Failed to validate screen share session."
        );
      } finally {
        if (isMounted) {
          setValidating(false);
        }
      }
    };

    validateSession();

    return () => {
      isMounted = false;
      if (subscription) {
        subscription.unsubscribe();
      }
      setValidating(false);
    };
  }, [code, onValidSession, toast, showError, hasShownError]);

  if (validating) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-white">Validating session...</p>
      </div>
    );
  }

  return null;
};

export default SessionValidator;