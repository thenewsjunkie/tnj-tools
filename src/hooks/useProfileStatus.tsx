import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useProfileStatus = () => {
  const [isApproved, setIsApproved] = useState<boolean | null>(null);

  const checkApprovalStatus = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('status')
        .eq('id', userId)
        .single();

      if (error) {
        // If no profile exists, create one with pending status
        const { error: insertError } = await supabase
          .from('profiles')
          .insert([
            { 
              id: userId,
              status: 'pending',
              timezone: 'UTC'
            }
          ]);
        
        if (insertError) {
          console.error("Error creating profile:", insertError);
          // Don't lock out the user if there's an error
          setIsApproved(null);
          return;
        }
        
        setIsApproved(false);
        return;
      }

      // Check if the user is approved
      setIsApproved(data.status === 'approved');
    } catch (error) {
      console.error("Error in checkApprovalStatus:", error);
      // Don't lock out the user if there's an error
      setIsApproved(null);
    }
  };

  return { isApproved, setIsApproved, checkApprovalStatus };
};