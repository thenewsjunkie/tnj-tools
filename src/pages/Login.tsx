
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const { session } = useAuth(); // Use our centralized auth hook

  useEffect(() => {
    console.log('[Login] Component mounted, checking session');
    
    // If we already have a session from our hook, redirect to admin
    if (session) {
      console.log('[Login] User already logged in, redirecting to admin');
      navigate("/admin");
    } else {
      setIsLoading(false);
    }
    
    // We don't need a separate auth subscription here since we're using useAuth
  }, [session, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  // Function to handle authentication errors
  const handleAuthError = (error: Error) => {
    console.error('[Login] Auth error:', error);
    toast({
      variant: "destructive",
      title: "Authentication Failed",
      description: error.message || "There was a problem signing in.",
    });
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="digital text-4xl text-neon-red">TNJ Tools</h2>
          <p className="mt-2 text-white/60">Sign in to access admin panel</p>
        </div>
        <div className="bg-white/5 p-6 rounded-lg border border-white/10">
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#ff0000',
                    brandAccent: '#ff3333',
                  },
                },
              },
            }}
            theme="dark"
            providers={[]}
            // We removed the onError prop as it's not in the component type
          />
        </div>
      </div>
    </div>
  );
};

export default Login;
