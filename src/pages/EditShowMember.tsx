
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Facebook, Instagram, Twitter, Plus, ArrowLeft } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface SocialLink {
  id: string;
  platform: 'facebook' | 'instagram' | 'x';
  url: string;
}

interface Member {
  id: string;
  name: string;
  image_url: string | null;
  socials: SocialLink[];
}

export default function EditShowMember() {
  const { memberId } = useParams();
  const navigate = useNavigate();
  const [member, setMember] = useState<Member | null>(null);
  const [name, setName] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [socials, setSocials] = useState<SocialLink[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchMember = async () => {
      try {
        // Fetch member
        const { data: memberData, error: memberError } = await supabase
          .from('show_members')
          .select('*')
          .eq('id', memberId)
          .single();

        if (memberError) throw memberError;

        // Fetch socials
        const { data: socialsData, error: socialsError } = await supabase
          .from('show_member_socials')
          .select('*')
          .eq('member_id', memberId);

        if (socialsError) throw socialsError;

        setMember({
          ...memberData,
          socials: socialsData,
        });
        setName(memberData.name);
        setSocials(socialsData);
      } catch (error) {
        console.error('Error fetching member:', error);
        toast({
          title: "Error",
          description: "Failed to load member details",
          variant: "destructive",
        });
      }
    };

    if (memberId) {
      fetchMember();
    }
  }, [memberId]);

  const handleAddSocial = (platform: 'facebook' | 'instagram' | 'x') => {
    setSocials([...socials, { id: crypto.randomUUID(), platform, url: '' }]);
  };

  const handleSocialChange = (index: number, url: string) => {
    const newSocials = [...socials];
    newSocials[index].url = url;
    setSocials(newSocials);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !memberId) return;

    setIsLoading(true);

    try {
      let imageUrl = member?.image_url;
      if (image) {
        const fileExt = image.name.split('.').pop();
        const filePath = `${crypto.randomUUID()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('show_member_photos')
          .upload(filePath, image);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('show_member_photos')
          .getPublicUrl(filePath);

        imageUrl = publicUrl;
      }

      // Update member
      const { error: memberError } = await supabase
        .from('show_members')
        .update({
          name,
          image_url: imageUrl,
        })
        .eq('id', memberId);

      if (memberError) throw memberError;

      // Delete existing socials
      const { error: deleteError } = await supabase
        .from('show_member_socials')
        .delete()
        .eq('member_id', memberId);

      if (deleteError) throw deleteError;

      // Insert new socials
      if (socials.length > 0) {
        const { error: socialsError } = await supabase
          .from('show_member_socials')
          .insert(
            socials.map(social => ({
              member_id: memberId,
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

      navigate('/sharetheshow');
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

  if (!member) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <Button 
        variant="ghost" 
        onClick={() => navigate('/sharetheshow')} 
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Members
      </Button>

      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Edit Show Member</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Name</label>
            <Input
              placeholder="Enter name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Profile Photo</label>
            {member.image_url && (
              <div className="w-32 h-32 mb-4 rounded-full overflow-hidden">
                <img
                  src={member.image_url}
                  alt={name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <Input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="cursor-pointer"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Social Media Links</label>
            <div className="flex flex-wrap gap-2">
              {!socials.some(s => s.platform === 'facebook') && (
                <Button type="button" variant="outline" size="sm" onClick={() => handleAddSocial('facebook')}>
                  <Facebook className="h-4 w-4 mr-2" />
                  Add Facebook
                </Button>
              )}
              {!socials.some(s => s.platform === 'instagram') && (
                <Button type="button" variant="outline" size="sm" onClick={() => handleAddSocial('instagram')}>
                  <Instagram className="h-4 w-4 mr-2" />
                  Add Instagram
                </Button>
              )}
              {!socials.some(s => s.platform === 'x') && (
                <Button type="button" variant="outline" size="sm" onClick={() => handleAddSocial('x')}>
                  <Twitter className="h-4 w-4 mr-2" />
                  Add X
                </Button>
              )}
            </div>
            {socials.map((social, index) => (
              <div key={social.id} className="flex items-center gap-2">
                <Input
                  placeholder={`${social.platform} URL`}
                  value={social.url}
                  onChange={(e) => handleSocialChange(index, e.target.value)}
                />
              </div>
            ))}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Updating..." : "Update Member"}
          </Button>
        </form>
      </div>
    </div>
  );
}
