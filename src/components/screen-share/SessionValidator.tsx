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
        const { data, error } = await supabase
          .from('screen_share_sessions')
          .select('*')
          .eq('share_code', code)
          .eq('is_active', true)
          .maybeSingle();

        if (error) throw error;
        if (!data) {
          toast({
            title: "Invalid session",
            description: "This screen share session does not exist or has expired.",
            variant: "destructive",
          });
          return;
        }

        const now = new Date();
        const expiresAt = new Date(data.expires_at);
        
        if (expiresAt < now) {
          toast({
            title: "Session expired",
            description: "This screen share session has expired.",
            variant: "destructive",
          });
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
          return;
        }

        if (!isHost && data.viewer_connected) {
          toast({
            title: "Session in use",
            description: "Another viewer is already connected to this session.",
            variant: "destructive",
          });
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