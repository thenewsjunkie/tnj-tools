import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Monitor, Copy, ExternalLink } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { addDays } from "date-fns";
import { debounce } from "lodash";

const ScreenShareModule = () => {
  const [shareCode, setShareCode] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generateShareCode = debounce(async () => {
    if (isGenerating) return;
    
    try {
      setIsGenerating(true);
      // Clear the previous share code first
      setShareCode("");
      
      const now = new Date().toISOString();
      
      // First, clean up any expired or inactive sessions
      await supabase
        .from("screen_share_sessions")
        .update({ 
          is_active: false,
          host_connected: false,
          viewer_connected: false 
        })
        .or(`expires_at.lt.${now},and(host_connected.eq.false,viewer_connected.eq.false)`);

      // Generate a new unique code
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      
      // Insert new session with all required fields
      const { data, error } = await supabase
        .from("screen_share_sessions")
        .insert([{
          share_code: code,
          expires_at: addDays(new Date(), 1).toISOString(),
          is_active: true,
          host_connected: false,
          viewer_connected: false,
          room_id: code,
        }])
        .select()
        .single();

      if (error) {
        console.error('Error generating share code:', error);
        toast({
          title: "Error",
          description: `Failed to generate share code: ${error.message}`,
          variant: "destructive",
        });
        return;
      }

      if (!data) {
        console.error('No data returned from insert operation');
        toast({
          title: "Error",
          description: "Failed to generate share code: No data returned",
          variant: "destructive",
        });
        return;
      }

      setShareCode(code);
      toast({
        title: "Success",
        description: "Share code generated successfully",
      });
    } catch (error) {
      console.error('Error in generateShareCode:', error);
      toast({
        title: "Error",
        description: "Failed to generate share code: Unexpected error",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  }, 1000, { leading: true, trailing: false });

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
          disabled={isGenerating}
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
            <p className="text-white text-sm">
              {isGenerating ? "Generating share code..." : "No active share code"}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ScreenShareModule;