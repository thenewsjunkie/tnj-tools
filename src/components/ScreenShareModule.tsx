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
      setShareCode(""); // Clear previous code
      
      const now = new Date().toISOString();
      
      // First, clean up expired or inactive sessions
      await supabase
        .from("screen_share_sessions")
        .update({ 
          is_active: false,
          host_connected: false,
          viewer_connected: false,
          host_device_id: null,
          viewer_device_id: null
        })
        .or(`expires_at.lt.${now},and(host_connected.eq.false,viewer_connected.eq.false)`);

      // Generate new code
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      console.log('Generated code:', code);

      // Begin transaction
      const { data: newSession, error: insertError } = await supabase.rpc('create_screen_share_session', {
        p_share_code: code,
        p_expires_at: addDays(new Date(), 1).toISOString()
      });

      if (insertError || !newSession) {
        console.error('Failed to create session:', insertError);
        toast({
          title: "Error",
          description: `Failed to generate share code: ${insertError?.message || 'Unknown error'}`,
          variant: "destructive",
        });
        return;
      }

      console.log('Session created:', newSession);
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