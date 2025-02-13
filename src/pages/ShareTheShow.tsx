import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import MemberCard from "@/components/show/MemberCard";
import { useToast } from "@/components/ui/use-toast";

interface SocialLink {
  platform: 'facebook' | 'instagram' | 'x' | 'tiktok' | 'youtube' | 'website' | 'snapchat' | 'venmo' | 'cashapp';
  url: string;
}

interface Member {
  id: string;
  name: string;
  image_url: string | null;
  socials: SocialLink[];
}

export default function ShareTheShow() {
  const [members, setMembers] = useState<Member[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchMembers();

    // Send height to parent window
    const sendHeight = () => {
      const height = document.documentElement.scrollHeight;
      window.parent.postMessage({ type: 'resize', height }, '*');
    };

    // Handle image loading
    const handleImagesLoad = () => {
      // Wait a bit after images load to get final height
      setTimeout(sendHeight, 100);
    };

    // Wait for images to load
    window.addEventListener('load', handleImagesLoad);

    // Send initial height
    sendHeight();

    // Set up a MutationObserver to watch for DOM changes
    const observer = new MutationObserver(() => {
      // Add a small delay to allow for DOM updates
      setTimeout(sendHeight, 100);
    });
    
    observer.observe(document.body, { 
      childList: true, 
      subtree: true,
      attributes: true,
      characterData: true 
    });

    // Clean up
    return () => {
      observer.disconnect();
      window.removeEventListener('load', handleImagesLoad);
    };
  }, []);

  const fetchMembers = async () => {
    try {
      // Fetch members
      const { data: membersData, error: membersError } = await supabase
        .from('show_members')
        .select('*')
        .order('display_order');

      if (membersError) throw membersError;

      // Fetch socials for all members
      const { data: socialsData, error: socialsError } = await supabase
        .from('show_member_socials')
        .select('*');

      if (socialsError) throw socialsError;

      // Combine the data
      const membersWithSocials = membersData.map(member => ({
        ...member,
        socials: socialsData
          .filter(social => social.member_id === member.id)
          .map(social => ({
            platform: social.platform,
            url: social.url,
          })),
      }));

      setMembers(membersWithSocials);
    } catch (error) {
      console.error('Error fetching members:', error);
      toast({
        title: "Error",
        description: "Failed to load show members",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="w-full px-2 py-6">
      <div className="grid grid-cols-3 gap-2">
        {members.map((member) => (
          <MemberCard
            key={member.id}
            id={member.id}
            name={member.name}
            imageUrl={member.image_url}
            socials={member.socials}
          />
        ))}
      </div>
    </div>
  );
}
