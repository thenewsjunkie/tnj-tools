
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Facebook, Instagram, Twitter, ArrowLeft, Youtube, Globe, Ghost, CircleDollarSign, Copy } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import AddMemberDialog from "@/components/show/AddMemberDialog";

interface SocialLink {
  id: string;
  platform: 'facebook' | 'instagram' | 'x' | 'tiktok' | 'youtube' | 'website' | 'snapchat' | 'venmo' | 'cashapp';
  url: string;
  member_id: string;
}

interface Member {
  id: string;
  name: string;
  image_url: string | null;
  socials: SocialLink[];
  isEditing?: boolean;
}

export default function EditShowMember() {
  const navigate = useNavigate();
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const embedCode = `<iframe 
  src="https://tnjtools.com/sharetheshow"
  width="100%"
  style="border: none; min-height: 400px; height: 100vh;"
  title="Show Members"
></iframe>`;

  const copyEmbedCode = () => {
    navigator.clipboard.writeText(embedCode)
      .then(() => {
        toast({
          title: "Copied!",
          description: "Embed code has been copied to your clipboard",
        });
      })
      .catch(() => {
        toast({
          title: "Error",
          description: "Failed to copy embed code",
          variant: "destructive",
        });
      });
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const { data: membersData, error: membersError } = await supabase
        .from('show_members')
        .select('*')
        .order('display_order');

      if (membersError) throw membersError;

      const { data: socialsData, error: socialsError } = await supabase
        .from('show_member_socials')
        .select('*');

      if (socialsError) throw socialsError;

      const membersWithSocials = membersData.map(member => ({
        ...member,
        socials: socialsData.filter(social => social.member_id === member.id),
        isEditing: false,
      }));

      setMembers(membersWithSocials);
    } catch (error) {
      console.error('Error fetching members:', error);
      toast({
        title: "Error",
        description: "Failed to load members",
        variant: "destructive",
      });
    }
  };

  const handleAddSocial = (memberId: string, platform: 'facebook' | 'instagram' | 'x' | 'tiktok' | 'youtube' | 'website' | 'snapchat' | 'venmo' | 'cashapp') => {
    setMembers(members.map(member => {
      if (member.id === memberId) {
        return {
          ...member,
          socials: [...member.socials, {
            id: crypto.randomUUID(),
            platform,
            url: '',
            member_id: memberId
          }]
        };
      }
      return member;
    }));
  };

  const handleSocialChange = (memberId: string, socialId: string, url: string) => {
    setMembers(members.map(member => {
      if (member.id === memberId) {
        return {
          ...member,
          socials: member.socials.map(social => 
            social.id === socialId ? { ...social, url } : social
          )
        };
      }
      return member;
    }));
  };

  const handleImageChange = async (memberId: string, file: File) => {
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('show_member_photos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('show_member_photos')
        .getPublicUrl(filePath);

      setMembers(members.map(member => 
        member.id === memberId ? { ...member, image_url: publicUrl } : member
      ));

      await supabase
        .from('show_members')
        .update({ image_url: publicUrl })
        .eq('id', memberId);

      toast({
        title: "Success",
        description: "Image updated successfully",
      });
    } catch (error) {
      console.error('Error updating image:', error);
      toast({
        title: "Error",
        description: "Failed to update image",
        variant: "destructive",
      });
    }
  };

  const handleNameChange = (memberId: string, name: string) => {
    setMembers(members.map(member =>
      member.id === memberId ? { ...member, name } : member
    ));
  };

  const handleSave = async (member: Member) => {
    setIsLoading(true);
    try {
      // Update member
      const { error: memberError } = await supabase
        .from('show_members')
        .update({ name: member.name })
        .eq('id', member.id);

      if (memberError) throw memberError;

      // Delete existing socials
      const { error: deleteError } = await supabase
        .from('show_member_socials')
        .delete()
        .eq('member_id', member.id);

      if (deleteError) throw deleteError;

      // Insert new socials
      if (member.socials.length > 0) {
        const { error: socialsError } = await supabase
          .from('show_member_socials')
          .insert(
            member.socials.map(social => ({
              member_id: member.id,
              platform: social.platform,
              url: social.url,
            }))
          );

        if (socialsError) throw socialsError;
      }

      toast({
        title: "Success",
        description: "Member updated successfully",
      });

      // Refresh members list
      await fetchMembers();
    } catch (error) {
      console.error('Error updating member:', error);
      toast({
        title: "Error",
        description: "Failed to update member",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getSocialIcon = (platform: SocialLink['platform']) => {
    switch (platform) {
      case 'facebook':
        return <Facebook className="h-4 w-4" />;
      case 'instagram':
        return <Instagram className="h-4 w-4" />;
      case 'x':
        return <Twitter className="h-4 w-4" />;
      case 'youtube':
        return <Youtube className="h-4 w-4" />;
      case 'website':
        return <Globe className="h-4 w-4" />;
      case 'snapchat':
        return <Ghost className="h-4 w-4" />;
      case 'venmo':
      case 'cashapp':
        return <CircleDollarSign className="h-4 w-4" />;
      case 'tiktok':
        return (
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
          </svg>
        );
    }
  };

  const platformLabels = {
    facebook: 'Facebook',
    instagram: 'Instagram',
    x: 'X',
    tiktok: 'TikTok',
    youtube: 'YouTube',
    website: 'Website',
    snapchat: 'Snapchat',
    venmo: 'Venmo',
    cashapp: 'Cash App'
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/sharetheshow')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Members
        </Button>
        <div className="flex gap-4">
          <Button
            onClick={copyEmbedCode}
          >
            <Copy className="h-4 w-4 mr-2" />
            Copy Embed Code
          </Button>
          <AddMemberDialog onMemberAdded={fetchMembers} />
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Edit Show Members</h1>
        </div>
        
        <div className="space-y-8">
          {members.map((member) => (
            <div key={member.id} className="bg-slate-800 rounded-lg p-6 space-y-4">
              <div className="flex items-start gap-6">
                <div className="space-y-2">
                  <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200">
                    {member.image_url ? (
                      <img
                        src={member.image_url}
                        alt={member.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        No Image
                      </div>
                    )}
                  </div>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageChange(member.id, file);
                    }}
                    className="cursor-pointer"
                  />
                </div>

                <div className="flex-1 space-y-4">
                  <div>
                    <label className="text-sm font-medium text-white">Name</label>
                    <Input
                      value={member.name}
                      onChange={(e) => handleNameChange(member.id, e.target.value)}
                      placeholder="Enter name"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white">Social Media Links</label>
                    <div className="flex flex-wrap gap-2">
                      {(Object.keys(platformLabels) as Array<keyof typeof platformLabels>)
                        .filter(platform => !member.socials.some(s => s.platform === platform))
                        .map(platform => (
                          <Button 
                            key={platform}
                            type="button" 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleAddSocial(member.id, platform)}
                            className="text-white hover:text-white"
                          >
                            {getSocialIcon(platform)}
                            <span className="ml-2">Add {platformLabels[platform]}</span>
                          </Button>
                        ))
                      }
                    </div>
                    {member.socials.map((social) => (
                      <div key={social.id} className="flex items-center gap-2">
                        <Input
                          placeholder={`${platformLabels[social.platform]} URL`}
                          value={social.url}
                          onChange={(e) => handleSocialChange(member.id, social.id, e.target.value)}
                        />
                      </div>
                    ))}
                  </div>

                  <Button 
                    onClick={() => handleSave(member)}
                    disabled={isLoading}
                    className="w-full"
                  >
                    {isLoading ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
