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
    <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
      <h1 className="text-3xl md:text-4xl font-['Radiate Sans Extra Bold'] text-black text-center md:text-left">
        Fritz on the Street
      </h1>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleReset}
        className="text-black hover:bg-white/10"
      >
        <RefreshCw className="h-6 w-6" />
      </Button>
    </div>
  );
};

export default Header;