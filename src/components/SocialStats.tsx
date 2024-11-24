import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Facebook, Youtube, Twitter, Instagram, Settings2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const initialPlatforms = [
  { name: 'Facebook', icon: Facebook, handle: 'thenewsjunkie', followers: '125K' },
  { name: 'YouTube', icon: Youtube, handle: 'thenewsjunkie', followers: '45K' },
  { name: 'Twitter', icon: Twitter, handle: 'thenewsjunkie', followers: '67K' },
  { name: 'Instagram', icon: Instagram, handle: 'thenewsjunkie', followers: '89K' },
];

const SocialStats = () => {
  const [platforms, setPlatforms] = useState(initialPlatforms);
  const [formData, setFormData] = useState({
    Facebook: '125K',
    YouTube: '45K',
    Twitter: '67K',
    Instagram: '89K'
  });

  const handleInputChange = (platform: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [platform]: value
    }));
  };

  const handleSubmit = () => {
    const updatedPlatforms = platforms.map(platform => ({
      ...platform,
      followers: formData[platform.name as keyof typeof formData]
    }));
    setPlatforms(updatedPlatforms);
  };

  return (
    <Card className="bg-black/50 border-white/10 relative">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-white text-lg sm:text-xl">Social Media Stats</CardTitle>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="text-white hover:text-primary hover:bg-white/10">
              <Settings2 className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <DialogHeader>
              <DialogTitle>Update Follower Counts</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {platforms.map((platform) => (
                <div key={platform.name} className="flex items-center gap-4">
                  <platform.icon className="w-4 h-4" />
                  <div className="flex-1">
                    <Input
                      value={formData[platform.name as keyof typeof formData]}
                      onChange={(e) => handleInputChange(platform.name, e.target.value)}
                      placeholder={`Enter ${platform.name} followers`}
                    />
                  </div>
                </div>
              ))}
              <Button onClick={handleSubmit} className="w-full">Update Counts</Button>
            </div>
          </DialogContent>
        </Dialog>
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