import { useState, useEffect } from "react";
import { X, Play, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useToast } from "./ui/use-toast";

interface MediaItem {
  id: string;
  url: string;
  thumbnail: string;
  type: 'youtube' | 'twitter';
}

const MediaPool = () => {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [newUrl, setNewUrl] = useState("");
  const [fullscreenMedia, setFullscreenMedia] = useState<MediaItem | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const saved = localStorage.getItem('mediaPool');
    if (saved) {
      setMediaItems(JSON.parse(saved));
    }
  }, []);

  const saveToLocalStorage = (items: MediaItem[]) => {
    localStorage.setItem('mediaPool', JSON.stringify(items));
  };

  const getYouTubeVideoId = (url: string) => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const getTwitterVideoId = (url: string) => {
    const regex = /(?:twitter\.com|x\.com)\/(?:#!\/)?(\w+)\/status(?:es)?\/(\d+)/;
    const match = url.match(regex);
    return match ? match[2] : null;
  };

  const handleAddMedia = async () => {
    try {
      let type: 'youtube' | 'twitter';
      let thumbnail: string;
      let id: string;

      if (newUrl.includes('youtube.com') || newUrl.includes('youtu.be')) {
        const videoId = getYouTubeVideoId(newUrl);
        if (!videoId) throw new Error("Invalid YouTube URL");
        type = 'youtube';
        thumbnail = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
        id = videoId;
      } else if (newUrl.includes('twitter.com') || newUrl.includes('x.com')) {
        const tweetId = getTwitterVideoId(newUrl);
        if (!tweetId) throw new Error("Invalid Twitter URL");
        type = 'twitter';
        // Use a better placeholder for Twitter videos
        thumbnail = 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=800&q=80';
        id = tweetId;
      } else {
        throw new Error("Please enter a valid YouTube or Twitter video URL");
      }

      const newItem: MediaItem = {
        id,
        url: newUrl,
        thumbnail,
        type
      };

      const updatedItems = [...mediaItems, newItem];
      setMediaItems(updatedItems);
      saveToLocalStorage(updatedItems);
      setNewUrl("");
      toast({
        title: "Media added",
        description: "Your media has been added to the pool",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add media",
        variant: "destructive",
      });
    }
  };

  const handleDelete = (id: string) => {
    const updatedItems = mediaItems.filter(item => item.id !== id);
    setMediaItems(updatedItems);
    saveToLocalStorage(updatedItems);
    toast({
      title: "Media removed",
      description: "The media has been removed from your pool",
    });
  };

  return (
    <div className="w-full md:col-span-2 space-y-4">
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

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {mediaItems.map((item) => (
          <div key={item.id} className="relative group">
            <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
              <img
                src={item.thumbnail}
                alt="Media thumbnail"
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setFullscreenMedia(item)}
                className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Play className="w-12 h-12 text-white" />
              </button>
              <button
                onClick={() => handleDelete(item.id)}
                className="absolute top-2 right-2 p-1 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {fullscreenMedia && (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
          <button
            onClick={() => setFullscreenMedia(null)}
            className="absolute top-4 right-4 p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
          <div className="w-full h-full max-w-7xl max-h-screen p-4">
            {fullscreenMedia.type === 'youtube' ? (
              <iframe
                src={`https://www.youtube.com/embed/${fullscreenMedia.id}?autoplay=1`}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <iframe
                src={`https://platform.twitter.com/embed/Tweet.html?id=${fullscreenMedia.id}`}
                className="w-full h-full"
                allowFullScreen
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaPool;