import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Facebook, Instagram, Twitter, Youtube, Globe, Ghost, CircleDollarSign } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface SocialLink {
  platform: 'facebook' | 'instagram' | 'x' | 'tiktok' | 'youtube' | 'website' | 'snapchat' | 'venmo' | 'cashapp';
  url: string;
}

export default function AddMemberDialog({ onMemberAdded }: { onMemberAdded: () => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [socials, setSocials] = useState<SocialLink[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

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

  const handleAddSocial = (platform: 'facebook' | 'instagram' | 'x' | 'tiktok' | 'youtube' | 'website' | 'snapchat' | 'venmo' | 'cashapp') => {
    setSocials([...socials, { platform, url: '' }]);
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
    if (!name) {
      toast({
        title: "Error",
        description: "Please enter a name",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      // Get the max display order
      const { data: maxOrderData } = await supabase
        .from('show_members')
        .select('display_order')
        .order('display_order', { ascending: false })
        .limit(1)
        .single();

      const newDisplayOrder = (maxOrderData?.display_order || 0) + 1;

      let imageUrl = null;
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

      // Insert the member
      const { data: member, error: memberError } = await supabase
        .from('show_members')
        .insert({
          name,
          image_url: imageUrl,
          display_order: newDisplayOrder,
        })
        .select()
        .single();

      if (memberError) throw memberError;

      // Insert social links
      if (socials.length > 0) {
        const { error: socialsError } = await supabase
          .from('show_member_socials')
          .insert(
            socials.map(social => ({
              member_id: member.id,
              platform: social.platform,
              url: social.url,
            }))
          );

        if (socialsError) throw socialsError;
      }

      toast({
        title: "Success",
        description: "Member added successfully",
      });

      setOpen(false);
      setName("");
      setImage(null);
      setSocials([]);
      onMemberAdded();
    } catch (error) {
      console.error('Error adding member:', error);
      toast({
        title: "Error",
        description: "Failed to add member",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Member
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Show Member</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
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
              {(Object.keys(platformLabels) as Array<keyof typeof platformLabels>)
                .filter(platform => !socials.some(s => s.platform === platform))
                .map(platform => (
                  <Button 
                    key={platform}
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleAddSocial(platform)}
                    className="text-white hover:text-white"
                  >
                    {getSocialIcon(platform)}
                    <span className="ml-2">Add {platformLabels[platform]}</span>
                  </Button>
                ))
              }
            </div>
            {socials.map((social, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  placeholder={`${platformLabels[social.platform]} URL`}
                  value={social.url}
                  onChange={(e) => handleSocialChange(index, e.target.value)}
                />
              </div>
            ))}
          </div>

          <Button type="submit" className="w-full" disabled={isUploading}>
            {isUploading ? "Adding..." : "Add Member"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
