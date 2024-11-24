import { useCallback, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { debounce } from "lodash";
import { useDeviceId } from "./hooks/useDeviceId";
import { useSessionSubscription } from "./hooks/useSessionSubscription";
import { useSessionState } from "./hooks/useSessionState";
import { SessionValidatorProps, SessionData } from "./types";
import { 
  validateShareSession, 
  handleExpiredSession, 
  reconnectToSession,
  claimSessionRole 
} from "./utils/sessionUtils";

const SessionValidator = ({ code, onValidSession }: SessionValidatorProps) => {
  const { toast } = useToast();
  const deviceId = useDeviceId();
  const { 
    sessionId,
    isCurrentHost,
    validating,
    updateSessionState,
    resetSessionState,
    setValidating 
  } = useSessionState();
  
  const showError = useCallback(
    debounce((title: string, description: string) => {
      toast({
        title,
        description,
        variant: "destructive",
      });
    }, 1000),
    [toast]
  );

  const handleDisconnect = useCallback(() => {
    showError(
      "Session disconnected",
      "Your connection was terminated."
    );
    resetSessionState();
  }, [showError, resetSessionState]);

  useSessionSubscription(sessionId, deviceId, isCurrentHost, handleDisconnect);

  useEffect(() => {
    let isMounted = true;

    const validateSession = async () => {
      if (!code || !deviceId) {
        resetSessionState();
        return;
      }

      try {
        const sessionData = await validateShareSession(code);
        
        if (!isMounted) return;

        const now = new Date();
        const expiresAt = new Date(sessionData.expires_at);
        
        if (expiresAt < now) {
          await handleExpiredSession(sessionData.id);
          showError(
            "Session expired",
            "This screen share session has expired."
          );
          resetSessionState();
          return;
        }

        // Check if this device is already connected
        const isExistingHost = sessionData.host_device_id === deviceId;
        const isExistingViewer = sessionData.viewer_device_id === deviceId;

        if (isExistingHost || isExistingViewer) {
          const reconnectedSession = await reconnectToSession(sessionData.id, isExistingHost);
          updateSessionState(reconnectedSession, isExistingHost);
          onValidSession(reconnectedSession, isExistingHost);
          return;
        }

        const updatedSession = await claimSessionRole(sessionData.id, deviceId, code);
        const isHost = updatedSession.host_device_id === deviceId;
        
        updateSessionState(updatedSession as SessionData, isHost);
        onValidSession(updatedSession as SessionData, isHost);
      } catch (error) {
        if (!isMounted) return;
        console.error('Session validation error:', error);
        showError(
          "Invalid session",
          error instanceof Error ? error.message : "Failed to validate screen share session"
        );
        resetSessionState();
      }
    };

    setValidating(true);
    validateSession();

    return () => {
      isMounted = false;
      resetSessionState();
    };
  }, [code, deviceId, onValidSession, showError, updateSessionState, resetSessionState, setValidating]);

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