import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { debounce } from "lodash";

interface SessionValidatorProps {
  code: string;
  onValidSession: (data: any, isHost: boolean) => void;
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

        // Reset error state when trying with a new code
        setHasShownError(false);

        // Generate a unique device identifier
        const deviceId = crypto.randomUUID();

        const { data: sessionData, error: fetchError } = await supabase
          .from('screen_share_sessions')
          .select('*')
          .eq('share_code', code.toUpperCase())
          .single();

        if (!isMounted) return;

        if (fetchError || !sessionData) {
          showError(
            "Invalid session",
            "This screen share session does not exist."
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

        if (!sessionData.is_active) {
          showError(
            "Session inactive",
            "This screen share session is no longer active."
          );
          setValidating(false);
          return;
        }

        // Determine if this device should be host or viewer
        const isHost = !sessionData.host_connected;
        
        if (isHost && sessionData.viewer_connected) {
          showError(
            "Session in use",
            "A viewer is already connected to this session."
          );
          setValidating(false);
          return;
        }

        if (!isHost && sessionData.viewer_connected) {
          showError(
            "Session in use",
            "Another viewer is already connected to this session."
          );
          setValidating(false);
          return;
        }

        // Update connection status with device ID
        const { error: updateError } = await supabase
          .from('screen_share_sessions')
          .update({
            [isHost ? 'host_connected' : 'viewer_connected']: true,
            [isHost ? 'host_device_id' : 'viewer_device_id']: deviceId
          })
          .eq('id', sessionData.id)
          .eq('is_active', true)
          .eq('share_code', code.toUpperCase())
          .gt('expires_at', now.toISOString())
          .select()
          .single();

        if (!isMounted) return;

        if (updateError) {
          console.error('Failed to update connection status:', updateError);
          showError(
            "Connection error",
            "Failed to establish connection to the session."
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
            const newData = payload.new as any;
            // Check if this device is still connected
            const isStillConnected = isHost 
              ? newData.host_device_id === deviceId 
              : newData.viewer_device_id === deviceId;
            
            if (!isStillConnected) {
              showError(
                "Session disconnected",
                "Your connection was taken over by another device."
              );
              setValidating(false);
              return;
            }
          })
          .subscribe();

        if (isMounted) {
          onValidSession(sessionData, isHost);
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