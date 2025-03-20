
import { Link } from "react-router-dom";
import { useTheme } from "@/components/theme/ThemeProvider";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const { theme } = useTheme();
  
  useEffect(() => {
    // Set up realtime connection with debug logging
    const channel = supabase.channel('system')
      .on('system', { event: '*' }, (status) => {
        console.log('Realtime system status:', status);
      })
      .subscribe((status) => {
        console.log('Subscription status:', status);
        
        if (status === 'SUBSCRIBED') {
          console.log('Successfully connected to realtime channel');
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          console.log('Realtime connection issue:', status);
        }
      });

    return () => {
      console.log('Cleaning up realtime connection');
      supabase.removeChannel(channel);
    };
  }, []);
  
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <nav className="fixed top-0 right-0 p-4 flex items-center gap-4">
        <Link 
          to="/login" 
          className={`${
            theme === 'light' ? 'text-black' : 'text-white'
          } hover:text-neon-red transition-colors px-4 py-2 border border-white/20 rounded`}
        >
          Login
        </Link>
      </nav>
      
      <div className={`digital text-[clamp(2rem,10vw,6rem)] leading-none ${
        theme === 'light' ? 'text-red-600' : 'text-neon-red'
      } animate-led-flicker tracking-tight mb-8`}>
        TNJ Tools
      </div>
      
      <div className="flex flex-wrap gap-4 justify-center max-w-4xl">
        <Link 
          to="/tnjgifs" 
          className="px-6 py-3 bg-card rounded-lg shadow hover:shadow-lg transition-all duration-300 hover:scale-105"
        >
          <h2 className="text-xl font-bold mb-1">TNJ GIFs</h2>
          <p className="text-sm text-muted-foreground">Explore and upload animated GIFs</p>
        </Link>
        
        <Link 
          to="/sharetheshow" 
          className="px-6 py-3 bg-card rounded-lg shadow hover:shadow-lg transition-all duration-300 hover:scale-105"
        >
          <h2 className="text-xl font-bold mb-1">Share the Show</h2>
          <p className="text-sm text-muted-foreground">Connect with the cast</p>
        </Link>
      </div>
      
      <div className={`absolute bottom-8 ${theme === 'light' ? 'text-black' : 'text-white/50'} text-sm`}>
        tnjtools.com
      </div>
    </div>
  );
};

export default Index;
