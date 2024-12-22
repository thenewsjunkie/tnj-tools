import { supabase } from "@/integrations/supabase/client";
import { FritzContestant } from "@/integrations/supabase/types/tables/fritz";
import { useContestantImage } from "./useContestantImage";

export const useContestantUpdate = (
  contestants: FritzContestant[],
  setContestants: (contestants: FritzContestant[]) => void
) => {
  const { uploadImage } = useContestantImage();
  const currentYear = new Date().getFullYear();

  const handleImageUpload = async (position: number, file: File) => {
    const publicUrl = await uploadImage(position, file);
    if (!publicUrl) return;

    const { error: updateError } = await supabase
      .from('fritz_contestants')
      .update({ image_url: publicUrl })
      .eq('position', position);

    if (updateError) {
      console.error('Error updating image URL:', updateError);
      return;
    }

    console.log('Successfully updated image URL in database');

    setContestants(
      contestants.map(c => 
        c.position === position ? { ...c, image_url: publicUrl } : c
      )
    );

    console.log('Updated contestants state');
  };

  const updateContestantName = async (position: number, name: string) => {
    console.log('Updating contestant name:', { position, name });
    
    // Important: Don't get the default contestant image if we're just updating the name
    // This prevents the old image from reappearing
    const { error } = await supabase
      .from('fritz_contestants')
      .update({ 
        name,
        score: 0
      })
      .eq('position', position);

    if (error) {
      console.error('Error updating contestant:', error);
      return;
    }

    console.log('Successfully updated contestant in database');

    // Create or update yearly score entry
    const { data: yearlyScore } = await supabase
      .from('fritz_yearly_scores')
      .select('*')
      .eq('contestant_name', name)
      .eq('year', currentYear)
      .single();

    console.log('Found yearly score:', yearlyScore);

    if (!yearlyScore) {
      await supabase
        .from('fritz_yearly_scores')
        .insert({
          contestant_name: name,
          total_score: 0,
          year: currentYear
        });
      console.log('Created new yearly score entry');
    }

    setContestants(
      contestants.map(c => 
        c.position === position ? { 
          ...c, 
          name,
          score: 0 
        } : c
      )
    );

    console.log('Updated contestants state');
  };

  return {
    handleImageUpload,
    updateContestantName
  };
};