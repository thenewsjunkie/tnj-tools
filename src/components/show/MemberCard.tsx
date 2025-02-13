
import { Facebook, Instagram, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Social {
  platform: 'facebook' | 'instagram' | 'x';
  url: string;
}

interface MemberCardProps {
  name: string;
  imageUrl: string | null;
  socials: Social[];
}

export default function MemberCard({ name, imageUrl, socials }: MemberCardProps) {
  const getSocialIcon = (platform: Social['platform']) => {
    switch (platform) {
      case 'facebook':
        return <Facebook className="h-4 w-4" />;
      case 'instagram':
        return <Instagram className="h-4 w-4" />;
      case 'x':
        return <Twitter className="h-4 w-4" />;
    }
  };

  return (
    <div className="flex flex-col items-center p-6 space-y-4">
      <div className="relative w-32 h-32 rounded-full overflow-hidden bg-gray-200">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            No Image
          </div>
        )}
      </div>
      <h3 className="text-xl font-semibold">{name}</h3>
      <div className="flex gap-2">
        {socials.map((social, index) => (
          <Button
            key={index}
            variant="ghost"
            size="icon"
            className="hover:text-primary"
            asChild
          >
            <a href={social.url} target="_blank" rel="noopener noreferrer">
              {getSocialIcon(social.platform)}
            </a>
          </Button>
        ))}
      </div>
    </div>
  );
}
