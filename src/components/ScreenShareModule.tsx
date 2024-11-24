import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Monitor, Copy, ExternalLink } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { addDays } from "date-fns";

const ScreenShareModule = () => {
  const [shareCode, setShareCode] = useState<string>("");
  const { toast } = useToast();

  const generateShareCode = async () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const { error } = await supabase.from("screen_share_sessions").insert({
      share_code: code,
      expires_at: addDays(new Date(), 1),
    });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to generate share code",
        variant: "destructive",
      });
      return;
    }

    setShareCode(code);
    toast({
      title: "Success",
      description: "Share code generated successfully",
    });
  };

  const copyToClipboard = () => {
    const shareUrl = `${window.location.origin}/screen-share/${shareCode}`;
    navigator.clipboard.writeText(shareUrl);
    toast({
      title: "Copied!",
      description: "Share link copied to clipboard",
    });
  };

  const openFullScreen = () => {
    window.open(`/screen-share/${shareCode}`, "_blank");
  };

  return (
    <Card className="bg-black/50 border-white/10">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-white text-lg sm:text-xl">Screen Share</CardTitle>
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:text-primary hover:bg-white/10"
          onClick={generateShareCode}
        >
          <Monitor className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        {shareCode ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Input
                value={shareCode}
                readOnly
                className="bg-white/5 border-white/10 text-white"
              />
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:text-primary hover:bg-white/10"
                onClick={copyToClipboard}
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:text-primary hover:bg-white/10"
                onClick={openFullScreen}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-3 bg-white/5 rounded-lg">
            <p className="text-white text-sm">No active share code</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ScreenShareModule;