
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Facebook, Instagram, Twitter } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface SocialLink {
  platform: 'facebook' | 'instagram' | 'x';
  url: string;
}

export default function AddMemberDialog({ onMemberAdded }: { onMemberAdded: () => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [socials, setSocials] = useState<SocialLink[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleAddSocial = (platform: 'facebook' | 'instagram' | 'x') => {
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
            <label className="text-sm font-medium">Name</label>
            <Input
              placeholder="Enter name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Profile Photo</label>
            <Input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="cursor-pointer"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Social Media Links</label>
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
              <div key={index} className="flex items-center gap-2">
                <Input
                  placeholder={`${social.platform} URL`}
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
