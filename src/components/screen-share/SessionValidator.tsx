import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { debounce } from "lodash";
import { useDeviceId } from "./hooks/useDeviceId";
import { useSessionSubscription } from "./hooks/useSessionSubscription";
import { SessionData, SessionValidatorProps } from "./types";

const SessionValidator = ({ code, onValidSession }: SessionValidatorProps) => {
  const [validating, setValidating] = useState(true);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isCurrentHost, setIsCurrentHost] = useState(false);
  const deviceId = useDeviceId();
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

  const handleDisconnect = useCallback(() => {
    showError(
      "Session disconnected",
      "Your connection was terminated."
    );
    setValidating(false);
  }, [showError]);

  useSessionSubscription(sessionId, deviceId, isCurrentHost, handleDisconnect);

  useEffect(() => {
    let isMounted = true;

    const validateSession = async () => {
      try {
        if (!code || !deviceId) {
          setValidating(false);
          return;
        }

        setHasShownError(false);

        // First, query to check if the session exists and is active
        const { data: sessions, error: queryError } = await supabase
          .from('screen_share_sessions')
          .select('*')
          .eq('share_code', code.toUpperCase())
          .eq('is_active', true);

        if (!isMounted) return;

        if (queryError) {
          console.error('Error querying session:', queryError);
          showError(
            "Error",
            "Failed to validate screen share session."
          );
          setValidating(false);
          return;
        }

        // Check if we got exactly one session
        if (!sessions || sessions.length === 0) {
          showError(
            "Invalid session",
            "This screen share session does not exist or is no longer active."
          );
          setValidating(false);
          return;
        }

        if (sessions.length > 1) {
          console.error('Multiple active sessions found with the same code');
          showError(
            "Error",
            "Invalid session state detected. Please try again."
          );
          setValidating(false);
          return;
        }

        const sessionData = sessions[0];
        const now = new Date();
        const expiresAt = new Date(sessionData.expires_at);
        
        if (expiresAt < now) {
          await supabase
            .from('screen_share_sessions')
            .update({ 
              is_active: false,
              host_connected: false,
              viewer_connected: false,
              host_device_id: null,
              viewer_device_id: null
            })
            .eq('id', sessionData.id);
            
          showError(
            "Session expired",
            "This screen share session has expired."
          );
          setValidating(false);
          return;
        }

        // Check if this device is already connected
        const isExistingHost = sessionData.host_device_id === deviceId;
        const isExistingViewer = sessionData.viewer_device_id === deviceId;

        if (isExistingHost || isExistingViewer) {
          const updateData = isExistingHost 
            ? { host_connected: true }
            : { viewer_connected: true };
            
          const { data: reconnectedSession, error: reconnectError } = await supabase
            .from('screen_share_sessions')
            .update(updateData)
            .eq('id', sessionData.id)
            .select()
            .single();

          if (reconnectError) {
            console.error('Error reconnecting to session:', reconnectError);
            showError(
              "Connection error",
              "Failed to reconnect to the session."
            );
            setValidating(false);
            return;
          }

          if (reconnectedSession) {
            setSessionId(reconnectedSession.id);
            setIsCurrentHost(isExistingHost);
            onValidSession(reconnectedSession as SessionData, isExistingHost);
            setValidating(false);
            return;
          }
        }

        // Try to claim a role in the session
        const { data: updatedSession, error: claimError } = await supabase.rpc(
          'claim_screen_share_role',
          { 
            p_session_id: sessionData.id,
            p_device_id: deviceId,
            p_share_code: code.toUpperCase()
          }
        );

        if (!isMounted) return;

        if (claimError || !updatedSession) {
          console.error('Failed to update connection status:', claimError);
          showError(
            "Connection error",
            "Failed to establish connection to the session."
          );
          setValidating(false);
          return;
        }

        const typedSession = updatedSession as SessionData;
        const isHost = typedSession.host_device_id === deviceId;
        
        setSessionId(typedSession.id);
        setIsCurrentHost(isHost);
        onValidSession(typedSession, isHost);
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
  }, [code, deviceId, onValidSession, showError, hasShownError]);

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