import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useToast } from "../ui/use-toast";
import type { MediaItem } from "./types";

interface MediaInputProps {
  newUrl: string;
  setNewUrl: (url: string) => void;
  onAdd: (item: Omit<MediaItem, 'id'>) => void;
}

export const MediaInput = ({ newUrl, setNewUrl, onAdd }: MediaInputProps) => {
  const { toast } = useToast();

  const getYouTubeVideoId = (url: string) => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const getTwitterVideoId = (url: string) => {
    const regex = /(?:twitter\.com|x\.com)\/(?:#!\/)?(\w+)\/status(?:es)?\/(\d+)/;
    const match = url.match(regex);
    return match ? { id: match[2], handle: match[1] } : null;
  };

  const fetchYouTubeTitle = async (videoId: string) => {
    try {
      const response = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`);
      const data = await response.json();
      return data.title || 'YouTube Video';
    } catch (error) {
      console.error('Failed to fetch video title:', error);
      return 'YouTube Video';
    }
  };

  const handleAddMedia = async () => {
    try {
      let type: 'youtube' | 'twitter';
      let thumbnail: string;
      let id: string;
      let title: string;

      if (newUrl.includes('youtube.com') || newUrl.includes('youtu.be')) {
        const videoId = getYouTubeVideoId(newUrl);
        if (!videoId) throw new Error("Invalid YouTube URL");
        type = 'youtube';
        thumbnail = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
        id = videoId;
        title = await fetchYouTubeTitle(videoId);
      } else if (newUrl.includes('twitter.com') || newUrl.includes('x.com')) {
        const tweetData = getTwitterVideoId(newUrl);
        if (!tweetData) throw new Error("Invalid Twitter URL");
        type = 'twitter';
        thumbnail = 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=800&q=80';
        id = tweetData.id;
        title = `@${tweetData.handle}'s Tweet`;
      } else {
        throw new Error("Please enter a valid YouTube or Twitter video URL");
      }

      onAdd({
        url: newUrl,
        thumbnail,
        type,
        title
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add media",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col space-y-4">
      <h2 className="text-2xl font-bold">Media Pool</h2>
      <div className="flex gap-2">
        <Input
          placeholder="Paste YouTube or Twitter video URL"
          value={newUrl}
          onChange={(e) => setNewUrl(e.target.value)}
          className="flex-1"
        />
        <Button onClick={handleAddMedia}>Add Media</Button>
      </div>
    </div>
  );
};