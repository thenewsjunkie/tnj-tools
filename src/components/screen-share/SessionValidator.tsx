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

    const validateSession = async () => {
      try {
        if (!code) {
          setValidating(false);
          return;
        }

        // Reset error state when trying with a new code
        setHasShownError(false);

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

        // Use a transaction to ensure atomic updates
        const { error: updateError } = await supabase
          .from('screen_share_sessions')
          .update({
            [isHost ? 'host_connected' : 'viewer_connected']: true
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