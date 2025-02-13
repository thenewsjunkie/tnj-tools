
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AddMemberDialog from "@/components/show/AddMemberDialog";
import MemberCard from "@/components/show/MemberCard";
import { useToast } from "@/components/ui/use-toast";

interface Member {
  id: string;
  name: string;
  image_url: string | null;
  socials: {
    platform: 'facebook' | 'instagram' | 'x';
    url: string;
  }[];
}

export default function ShareTheShow() {
  const [members, setMembers] = useState<Member[]>([]);
  const { toast } = useToast();

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
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Show Members</h1>
        <AddMemberDialog onMemberAdded={fetchMembers} />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {members.map((member) => (
          <MemberCard
            key={member.id}
            name={member.name}
            imageUrl={member.image_url}
            socials={member.socials}
          />
        ))}
      </div>
    </div>
  );
}
