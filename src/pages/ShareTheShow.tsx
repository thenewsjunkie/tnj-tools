
import { useEffect, useState, useRef } from "react";
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

  useEffect(() => {
    fetchMembers();

    // Send height to parent window
    const sendHeight = () => {
      if (containerRef.current) {
        const height = containerRef.current.offsetHeight;
        console.log('Sending height:', height);
        window.parent.postMessage({ type: 'resize', height }, '*');
      }
    };

    // Create ResizeObserver to watch for container size changes
    const resizeObserver = new ResizeObserver(() => {
      sendHeight();
    });

    // Create MutationObserver to watch for DOM changes
    const mutationObserver = new MutationObserver(() => {
      sendHeight();
    });

    if (containerRef.current) {
      // Observe container size changes
      resizeObserver.observe(containerRef.current);
      
      // Observe DOM changes within container
      mutationObserver.observe(containerRef.current, {
        childList: true,
        subtree: true,
        attributes: true,
        characterData: true
      });
    }

    // Handle image loading
    const handleImagesLoad = () => {
      const images = document.querySelectorAll('img');
      let loadedImages = 0;
      const totalImages = images.length;

      const checkAllImagesLoaded = () => {
        loadedImages++;
        if (loadedImages === totalImages) {
          console.log('All images loaded, updating height');
          sendHeight();
        }
      };

      images.forEach(img => {
        if (img.complete) {
          checkAllImagesLoaded();
        } else {
          img.addEventListener('load', checkAllImagesLoaded);
          img.addEventListener('error', checkAllImagesLoaded); // Handle failed loads too
        }
      });

      // If no images, still send height
      if (totalImages === 0) {
        sendHeight();
      }
    };

    // Initial height calculation after component mounts
    setTimeout(() => {
      handleImagesLoad();
      sendHeight();
    }, 100);

    // Clean up
    return () => {
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, [members]); // Re-run when members change

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
