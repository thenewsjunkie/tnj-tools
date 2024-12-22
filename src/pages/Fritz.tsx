import { useState, useEffect } from "react";
import { ArrowUp, ArrowDown, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import type { FritzContestant } from "@/integrations/supabase/types/tables/fritz";

const Fritz = () => {
  const [contestants, setContestants] = useState<FritzContestant[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchContestants();
  }, []);

  const fetchContestants = async () => {
    const { data, error } = await supabase
      .from('fritz_contestants')
      .select('*')
      .order('position');
    
    if (error) {
      console.error('Error fetching contestants:', error);
      return;
    }

    setContestants(data || []);
  };

  const updateScore = async (position: number, increment: boolean) => {
    const contestant = contestants.find(c => c.position === position);
    if (!contestant) return;

    const newScore = increment ? (contestant.score || 0) + 1 : (contestant.score || 0) - 1;
    
    const { error } = await supabase
      .from('fritz_contestants')
      .update({ score: newScore })
      .eq('position', position);

    if (error) {
      console.error('Error updating score:', error);
      return;
    }

    setContestants(prev => 
      prev.map(c => c.position === position ? { ...c, score: newScore } : c)
    );
  };

  const resetScores = async () => {
    const { error } = await supabase
      .from('fritz_contestants')
      .update({ score: 0 })
      .in('position', [1, 2, 3]);

    if (error) {
      console.error('Error resetting scores:', error);
      return;
    }

    setContestants(prev => prev.map(c => ({ ...c, score: 0 })));
    toast({
      title: "Scores Reset",
      description: "All scores have been reset to 0",
    });
  };

  const updateName = async (position: number, name: string) => {
    const { error } = await supabase
      .from('fritz_contestants')
      .update({ name })
      .eq('position', position);

    if (error) {
      console.error('Error updating name:', error);
      return;
    }

    setContestants(prev => 
      prev.map(c => c.position === position ? { ...c, name } : c)
    );
  };

  const uploadImage = async (position: number, file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${position}-${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('fritz_images')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Error uploading image:', uploadError);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('fritz_images')
      .getPublicUrl(filePath);

    const { error: updateError } = await supabase
      .from('fritz_contestants')
      .update({ image_url: publicUrl })
      .eq('position', position);

    if (updateError) {
      console.error('Error updating image URL:', updateError);
      return;
    }

    setContestants(prev => 
      prev.map(c => c.position === position ? { ...c, image_url: publicUrl } : c)
    );
  };

  return (
    <div className="min-h-screen bg-transparent p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-['Radiate Sans Extra Bold'] text-white">
          Fritz on the Street
        </h1>
        <Button
          variant="ghost"
          size="icon"
          onClick={resetScores}
          className="text-white hover:bg-white/10"
        >
          <RefreshCw className="h-6 w-6" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[1, 2, 3].map((position) => {
          const contestant = contestants.find(c => c.position === position) || {
            id: `temp-${position}`,
            name: '',
            score: 0,
            image_url: '',
            position
          };

          return (
            <div key={position} className="flex flex-col items-center space-y-4">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => updateScore(position, true)}
                  className="text-white hover:bg-white/10"
                >
                  <ArrowUp className="h-6 w-6" />
                </Button>
                <div className="text-4xl font-['Digital-7'] text-white w-16 text-center">
                  {contestant.score || 0}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => updateScore(position, false)}
                  className="text-white hover:bg-white/10"
                >
                  <ArrowDown className="h-6 w-6" />
                </Button>
              </div>

              <div className="relative w-64 h-64 border-4 border-white/20 rounded-lg overflow-hidden">
                {contestant.image_url ? (
                  <img
                    src={contestant.image_url}
                    alt={contestant.name || ''}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-black/20 flex items-center justify-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) uploadImage(position, file);
                      }}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <span className="text-white/50">Click to upload image</span>
                  </div>
                )}
              </div>

              <Input
                type="text"
                value={contestant.name || ''}
                onChange={(e) => updateName(position, e.target.value)}
                placeholder="Enter name"
                className="bg-black/20 border-white/20 text-white placeholder:text-white/50 text-center"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Fritz;