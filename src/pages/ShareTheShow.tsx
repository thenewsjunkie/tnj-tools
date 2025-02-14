
import { useEffect, useState, useLayoutEffect, useRef } from "react";
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
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate and update iframe height
  const updateIframeHeight = () => {
    if (!containerRef.current) return;
    
    const calculateTotalHeight = () => {
      const totalMembers = members.length;
      const cardHeight = 300; // Estimated height of each card including margins
      const containerPadding = 48; // 24px top + 24px bottom
      
      // Get current window width to determine number of columns
      const windowWidth = window.innerWidth;
      let columns = 3; // Default for desktop
      
      if (windowWidth < 640) { // sm breakpoint
        columns = 1;
      } else if (windowWidth < 768) { // md breakpoint
        columns = 2;
      }
      
      // Calculate rows needed
      const rows = Math.ceil(totalMembers / columns);
      const totalHeight = (rows * cardHeight) + containerPadding;
      
      return totalHeight;
    };

    const height = calculateTotalHeight();
    console.log('Calculated height:', height, 'Members:', members.length);
    window.parent.postMessage({ type: 'resize', height }, '*');
  };

  // Listen for window resize
  useEffect(() => {
    const handleResize = () => {
      updateIframeHeight();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [members]);

  // Update height when members change
  useLayoutEffect(() => {
    updateIframeHeight();
  }, [members]);

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

  useEffect(() => {
    fetchMembers();
  }, []);

  return (
    <div ref={containerRef} className="w-full px-2 py-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
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
