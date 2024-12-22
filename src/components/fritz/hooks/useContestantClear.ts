import { supabase } from "@/integrations/supabase/client";
import { FritzContestant } from "@/integrations/supabase/types/tables/fritz";
import { useContestantImage } from "./useContestantImage";
import { useToast } from "@/components/ui/use-toast";

export const useContestantClear = (
  contestants: FritzContestant[],
  setContestants: (contestants: FritzContestant[]) => void
) => {
  const { toast } = useToast();
  const { deleteImage, updateDefaultContestantImage } = useContestantImage();

  const clearContestant = async (position: number) => {
    console.log('Clearing contestant at position:', position);
    const contestant = contestants.find(c => c.position === position);
    console.log('Found contestant:', contestant);
    
    if (!contestant || !contestant.name) {
      console.log('No contestant found or no name, returning early');
      return;
    }

    // Delete the image if it exists and update default contestant
    if (contestant.image_url) {
      await deleteImage(contestant.image_url);
      await updateDefaultContestantImage(contestant.name, null);
    }

    const { error } = await supabase
      .from('fritz_contestants')
      .update({ 
        name: null,
        image_url: null,
        score: 0
      })
      .eq('position', position);

    if (error) {
      console.error('Error clearing contestant:', error);
      return;
    }

    console.log('Successfully cleared contestant in database');

    setContestants(
      contestants.map(c => 
        c.position === position ? { ...c, name: null, image_url: null, score: 0 } : c
      )
    );

    console.log('Updated contestants state');

    toast({
      title: "Contestant Cleared",
      description: `Position ${position} has been cleared`,
    });
  };

  const clearContestantImage = async (position: number) => {
    console.log('Clearing image for position:', position);
    const contestant = contestants.find(c => c.position === position);
    console.log('Found contestant:', contestant);
    
    if (!contestant || !contestant.image_url) {
      console.log('No contestant found or no image URL, returning early');
      return;
    }

    // Delete the image from storage and update default contestant
    await deleteImage(contestant.image_url);
    if (contestant.name) {
      await updateDefaultContestantImage(contestant.name, null);
    }

    const { error } = await supabase
      .from('fritz_contestants')
      .update({ image_url: null })
      .eq('position', position);

    if (error) {
      console.error('Error clearing contestant image:', error);
      return;
    }

    console.log('Successfully cleared image URL in database');

    setContestants(
      contestants.map(c => 
        c.position === position ? { ...c, image_url: null } : c
      )
    );

    console.log('Updated contestants state');
  };

  return { clearContestant, clearContestantImage };
};