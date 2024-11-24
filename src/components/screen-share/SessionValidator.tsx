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

        // Clean up expired sessions
        const now = new Date().toISOString();
        await supabase
          .from('screen_share_sessions')
          .update({ is_active: false })
          .lt('expires_at', now);

        // Fetch the active session with explicit conditions
        const { data, error } = await supabase
          .from('screen_share_sessions')
          .select('*')
          .eq('share_code', code.toUpperCase())
          .eq('is_active', true)
          .gt('expires_at', now)
          .single();

        if (error) {
          console.error('Session fetch error:', error);
          toast({
            title: "Invalid session",
            description: "This screen share session does not exist or has expired.",
            variant: "destructive",
          });
          setValidating(false);
          return;
        }

        if (!data) {
          toast({
            title: "Session not found",
            description: "This screen share session does not exist or has expired.",
            variant: "destructive",
          });
          setValidating(false);
          return;
        }

        // Determine if this is the host or viewer
        const isHost = !data.host_connected;
        
        if (isHost && data.viewer_connected) {
          toast({
            title: "Session in use",
            description: "A viewer is already connected to this session.",
            variant: "destructive",
          });
          setValidating(false);
          return;
        }

        if (!isHost && data.viewer_connected) {
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
          .eq('id', data.id);

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

        onValidSession(data, isHost);
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