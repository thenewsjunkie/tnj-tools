import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { validateShareSession } from "@/utils/supabaseSession";

interface SessionValidatorProps {
  code: string;
  onValidSession: (sessionData: any, isHost: boolean) => void;
}

const SessionValidator = ({ code, onValidSession }: SessionValidatorProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const validateSession = async () => {
      try {
        const sessionData = await validateShareSession(code);
        const isHost = !sessionData.host_connected;
        onValidSession(sessionData, isHost);
      } catch (error: any) {
        toast({
          title: "Invalid Share Code",
          description: error.message || "Please check the code and try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    validateSession();
  }, [code, onValidSession, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-white">Loading...</p>
      </div>
    );
  }

  return null;
};

export default SessionValidator;