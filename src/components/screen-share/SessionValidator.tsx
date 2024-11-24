import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface SessionValidatorProps {
  code: string;
  onValidSession: (data: any, isHost: boolean) => void;
}

const SessionValidator = ({ code, onValidSession }: SessionValidatorProps) => {
  const [validating, setValidating] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const validateSession = async () => {
      try {
        if (!code) {
          setValidating(false);
          return;
        }

        // Fetch the session first without updating anything
        const { data: sessionData, error: fetchError } = await supabase
          .from('screen_share_sessions')
          .select('*')
          .eq('share_code', code.toUpperCase())
          .single();

        if (fetchError || !sessionData) {
          toast({
            title: "Invalid session",
            description: "This screen share session does not exist.",
            variant: "destructive",
          });
          setValidating(false);
          return;
        }

        // Check if session is expired
        const now = new Date();
        const expiresAt = new Date(sessionData.expires_at);
        
        if (expiresAt < now) {
          toast({
            title: "Session expired",
            description: "This screen share session has expired.",
            variant: "destructive",
          });
          setValidating(false);
          return;
        }

        if (!sessionData.is_active) {
          toast({
            title: "Session inactive",
            description: "This screen share session is no longer active.",
            variant: "destructive",
          });
          setValidating(false);
          return;
        }

        // Determine if this is the host or viewer
        const isHost = !sessionData.host_connected;
        
        if (isHost && sessionData.viewer_connected) {
          toast({
            title: "Session in use",
            description: "A viewer is already connected to this session.",
            variant: "destructive",
          });
          setValidating(false);
          return;
        }

        if (!isHost && sessionData.viewer_connected) {
          toast({
            title: "Session in use",
            description: "Another viewer is already connected to this session.",
            variant: "destructive",
          });
          setValidating(false);
          return;
        }

        // Update connection status
        const { error: updateError } = await supabase
          .from('screen_share_sessions')
          .update({
            [isHost ? 'host_connected' : 'viewer_connected']: true
          })
          .eq('id', sessionData.id)
          .eq('is_active', true)
          .gt('expires_at', now.toISOString());

        if (updateError) {
          console.error('Failed to update connection status:', updateError);
          toast({
            title: "Connection error",
            description: "Failed to establish connection to the session.",
            variant: "destructive",
          });
          setValidating(false);
          return;
        }

        onValidSession(sessionData, isHost);
      } catch (error) {
        console.error('Session validation error:', error);
        toast({
          title: "Error",
          description: "Failed to validate screen share session.",
          variant: "destructive",
        });
      } finally {
        setValidating(false);
      }
    };

    validateSession();

    // Cleanup function to handle component unmount
    return () => {
      setValidating(false);
    };
  }, [code, onValidSession, toast]);

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