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
        // If no profile exists, create one and auto-approve it
        const { error: insertError } = await supabase
          .from('profiles')
          .insert([
            { 
              id: userId,
              status: 'approved', // Auto-approve new profiles
              timezone: 'UTC'
            }
          ]);
        
        if (insertError) {
          console.error("Error creating profile:", insertError);
          // Even if there's an error, allow access
          setIsApproved(true);
          return;
        }
        
        setIsApproved(true);
        return;
      }

      // Existing profiles are approved by default
      setIsApproved(true);
    } catch (error) {
      console.error("Error in checkApprovalStatus:", error);
      // If anything goes wrong, still allow access
      setIsApproved(true);
    }
  };

  return { isApproved, setIsApproved, checkApprovalStatus };
};
