import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface HeaderProps {
  onReset: () => void;
}

const Header = ({ onReset }: HeaderProps) => {
  const { toast } = useToast();

  const handleReset = async () => {
    const { error } = await supabase
      .from('fritz_contestants')
      .update({ score: 0 })
      .not('position', 'is', null);

    if (error) {
      console.error('Error resetting scores:', error);
      toast({
        title: "Error",
        description: "Failed to reset scores",
        variant: "destructive"
      });
      return;
    }

    onReset();
    toast({
      title: "Scores Reset",
      description: "All contestant scores have been reset to 0"
    });
  };

  return (
    <div className="relative px-6 py-4 bg-gradient-to-r from-black via-black/90 to-black/80 rounded-lg backdrop-blur-sm">
      <div className="flex flex-col md:flex-row md:justify-between items-center gap-4">
        <h1 className="text-3xl md:text-4xl font-['Radiate Sans Extra Bold'] text-white text-center md:text-left tracking-wider uppercase">
          Fritz on the Street
        </h1>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleReset}
          className="text-white hover:bg-white/10"
        >
          <RefreshCw className="h-6 w-6" />
        </Button>
      </div>
      <div className="h-1 bg-neon-red mt-2 mx-auto w-2/3 rounded-full shadow-[0_0_10px_rgba(242,21,22,0.7)]" />
    </div>
  );
};

export default Header;