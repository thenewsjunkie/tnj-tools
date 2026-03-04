import { useParams } from "react-router-dom";
import { useShowSongs } from "@/hooks/useShowSongs";
import MusicPlayer from "@/components/music/MusicPlayer";

const MusicEmbed = () => {
  const { id } = useParams<{ id?: string }>();
  const { songs, isLoading } = useShowSongs();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  // Single song or full playlist
  const filtered = id ? songs.filter((s) => s.id === id) : songs;
  const initialIndex = 0;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <MusicPlayer songs={filtered} initialIndex={initialIndex} />
    </div>
  );
};

export default MusicEmbed;
