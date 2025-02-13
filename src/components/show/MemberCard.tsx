
import { Facebook, Instagram, Twitter, Youtube, Globe, Ghost, CircleDollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Social {
  platform: 'facebook' | 'instagram' | 'x' | 'tiktok' | 'youtube' | 'website' | 'snapchat' | 'venmo' | 'cashapp';
  url: string;
}

interface MemberCardProps {
  id: string;
  name: string;
  imageUrl: string | null;
  socials: Social[];
}

export default function MemberCard({ name, imageUrl, socials }: MemberCardProps) {
  const getSocialIcon = (platform: Social['platform']) => {
    switch (platform) {
      case 'facebook':
        return <Facebook className="h-4 w-4 sm:h-4 sm:w-4" />;
      case 'instagram':
        return <Instagram className="h-4 w-4 sm:h-4 sm:w-4" />;
      case 'x':
        return <Twitter className="h-4 w-4 sm:h-4 sm:w-4" />;
      case 'youtube':
        return <Youtube className="h-4 w-4 sm:h-4 sm:w-4" />;
      case 'website':
        return <Globe className="h-4 w-4 sm:h-4 sm:w-4" />;
      case 'snapchat':
        return <Ghost className="h-4 w-4 sm:h-4 sm:w-4" />;
      case 'venmo':
      case 'cashapp':
        return <CircleDollarSign className="h-4 w-4 sm:h-4 sm:w-4" />;
      case 'tiktok':
        return (
          <svg className="h-4 w-4 sm:h-4 sm:w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
          </svg>
        );
    }
  };

  return (
    <div className="flex flex-col items-center p-4 space-y-3">
      <div className="relative w-24 h-24 sm:w-24 sm:h-24 rounded-full overflow-hidden bg-gray-200">
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
      <h3 className="text-lg font-semibold">{name}</h3>
      <div className="flex gap-2 sm:gap-1 flex-wrap justify-center">
        {socials.map((social, index) => (
          <Button
            key={index}
            variant="ghost"
            size="icon"
            className="h-10 w-10 sm:h-8 sm:w-8 hover:text-primary"
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
