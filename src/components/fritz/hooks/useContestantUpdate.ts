import { supabase } from "@/integrations/supabase/client";
import { FritzContestant } from "@/integrations/supabase/types/tables/fritz";
import { useContestantImage } from "./useContestantImage";

export const useContestantUpdate = (
  contestants: FritzContestant[],
  setContestants: (contestants: FritzContestant[]) => void
) => {
  const { uploadImage, updateDefaultContestantImage } = useContestantImage();
  const currentYear = new Date().getFullYear();

  const handleImageUpload = async (position: number, file: File) => {
    const publicUrl = await uploadImage(position, file);
    if (!publicUrl) return;

    const contestant = contestants.find(c => c.position === position);
    if (contestant?.name) {
      // Update the default contestant's image if it exists
      await updateDefaultContestantImage(contestant.name, publicUrl);
    }

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
    
    const isCustom = name === 'Custom';
    let defaultContestant;

    if (!isCustom) {
      // Fetch the default contestant's image
      const { data, error: fetchError } = await supabase
        .from('fritz_default_contestants')
        .select('image_url')
        .eq('name', name)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') { // Ignore "not found" errors
        console.error('Error fetching default contestant:', fetchError);
        return;
      }

      defaultContestant = data;
    }

    const { error } = await supabase
      .from('fritz_contestants')
      .update({ 
        name: isCustom ? null : name,
        score: 0,
        image_url: defaultContestant?.image_url || null
      })
      .eq('position', position);

    if (error) {
      console.error('Error updating contestant:', error);
      return;
    }

    console.log('Successfully updated contestant in database');

    if (!isCustom) {
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
    }

    setContestants(
      contestants.map(c => 
        c.position === position ? { 
          ...c, 
          name: isCustom ? null : name,
          score: 0,
          image_url: defaultContestant?.image_url || null
        } : c
      )
    );

    console.log('Updated contestants state');
  };

  const saveCustomContestant = async (name: string, imageUrl: string | null) => {
    console.log('Saving custom contestant:', { name, imageUrl });

    // First, check if the contestant already exists
    const { data: existing } = await supabase
      .from('fritz_default_contestants')
      .select('*')
      .eq('name', name)
      .single();

    if (existing) {
      // Update existing contestant
      const { error } = await supabase
        .from('fritz_default_contestants')
        .update({ image_url: imageUrl })
        .eq('name', name);

      if (error) {
        console.error('Error updating custom contestant:', error);
        return false;
      }
    } else {
      // Create new contestant
      const { error } = await supabase
        .from('fritz_default_contestants')
        .insert({ name, image_url: imageUrl });

      if (error) {
        console.error('Error creating custom contestant:', error);
        return false;
      }
    }

    return true;
  };

  return {
    handleImageUpload,
    updateContestantName,
    saveCustomContestant
  };
};