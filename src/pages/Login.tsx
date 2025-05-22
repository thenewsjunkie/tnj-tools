
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const checkSession = async () => {
      try {
        setIsLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          console.log('[Login] User already logged in, redirecting to admin');
          navigate("/admin");
        }
      } catch (error) {
        console.error('[Login] Error checking session:', error);
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: "There was a problem checking your login status.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();

    // Set up auth listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[Login] Auth state changed:', event);
      
      if (event === 'SIGNED_IN' && session) {
        navigate("/admin");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, toast]);

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
            // Using onAuthStateChange instead of onError since onError isn't available in the Auth component type
            // Error handling is done via the onAuthStateChange hook above
          />
        </div>
      </div>
    </div>
  );
};

export default Login;
