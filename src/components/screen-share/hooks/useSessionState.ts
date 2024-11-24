import { useState } from "react";
import { SessionData } from "../types";

export const useSessionState = () => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isCurrentHost, setIsCurrentHost] = useState(false);
  const [validating, setValidating] = useState(true);

  const updateSessionState = (session: SessionData, isHost: boolean) => {
    setSessionId(session.id);
    setIsCurrentHost(isHost);
    setValidating(false);
  };

  const resetSessionState = () => {
    setSessionId(null);
    setIsCurrentHost(false);
    setValidating(false);
  };

  return {
    sessionId,
    isCurrentHost,
    validating,
    updateSessionState,
    resetSessionState,
    setValidating
  };
};