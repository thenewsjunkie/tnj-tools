import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Download, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const YouTubeToMp3 = () => {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setDownloadUrl(null);

    try {
      const { data, error } = await supabase.functions.invoke('youtube-to-mp3', {
        body: { url }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message);
      }

      if (!data?.downloadUrl) {
        throw new Error('No download URL received');
      }

      setDownloadUrl(data.downloadUrl);
      toast({
        title: "Success",
        description: "Your MP3 is ready! Click download now - the link expires in 10 minutes.",
        duration: 10000,
      });

      // Clear the download URL after 10 minutes
      setTimeout(() => {
        setDownloadUrl(null);
        toast({
          title: "Download link expired",
          description: "Please generate a new download link.",
          variant: "destructive",
        });
      }, 10 * 60 * 1000);
    } catch (error) {
      console.error('Conversion error:', error);
      toast({
        title: "Error",
        description: error instanceof Error 
          ? error.message 
          : "Failed to convert video. Please check the URL and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-black/50 border-white/10">
      <CardHeader>
        <CardTitle className="text-white text-lg sm:text-xl">YouTube to MP3</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Paste YouTube URL"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1"
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading || !url}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Convert"
              )}
            </Button>
          </div>
          
          {downloadUrl && (
            <div className="space-y-2">
              <Button 
                variant="secondary" 
                className="w-full"
                onClick={() => window.open(downloadUrl, '_blank')}
              >
                <Download className="mr-2 h-4 w-4" />
                Download MP3
              </Button>
              <p className="text-xs text-yellow-400">
                ⚠️ Download link expires in 10 minutes. Click download now!
              </p>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
};

export default YouTubeToMp3;