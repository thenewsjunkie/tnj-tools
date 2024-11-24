import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Facebook, Youtube, Twitter, Instagram } from "lucide-react";

const platforms = [
  { name: 'Facebook', icon: Facebook, handle: 'thenewsjunkie', followers: '125K' },
  { name: 'YouTube', icon: Youtube, handle: 'thenewsjunkie', followers: '45K' },
  { name: 'Twitter', icon: Twitter, handle: 'thenewsjunkie', followers: '67K' },
  { name: 'Instagram', icon: Instagram, handle: 'thenewsjunkie', followers: '89K' },
];

const SocialStats = () => {
  return (
    <Card className="bg-black/50 border-white/10">
      <CardHeader>
        <CardTitle className="text-white text-lg sm:text-xl">Social Media Stats</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 sm:space-y-4">
          {platforms.map((platform) => (
            <div 
              key={platform.name}
              className="flex items-center justify-between p-2 sm:p-3 bg-white/5 rounded-lg"
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <platform.icon className="w-4 h-4 sm:w-5 sm:h-5 text-neon-red" />
                <span className="text-white text-sm sm:text-base">{platform.name}</span>
              </div>
              <div className="digital text-neon-red text-lg sm:text-xl">
                {platform.followers}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SocialStats;