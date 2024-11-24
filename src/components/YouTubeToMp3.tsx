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
        throw new Error(error.message);
      }

      if (!data?.downloadUrl) {
        throw new Error(data?.error || 'No download URL received');
      }

      setDownloadUrl(data.downloadUrl);
      toast({
        title: "Success",
        description: "Your MP3 is ready for download!",
      });
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

  const handleDownload = () => {
    if (!downloadUrl) return;
    
    try {
      window.open(downloadUrl, '_blank');
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download Failed",
        description: "Failed to start download. Please try again.",
        variant: "destructive",
      });
      setDownloadUrl(null);
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
            <Button 
              variant="secondary" 
              className="w-full"
              onClick={handleDownload}
            >
              <Download className="mr-2 h-4 w-4" />
              Download MP3
            </Button>
          )}
        </form>
      </CardContent>
    </Card>
  );
};

export default YouTubeToMp3;