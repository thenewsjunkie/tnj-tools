import { useParams } from "react-router-dom";
import { useShowSongs } from "@/hooks/useShowSongs";
import MusicPlayer from "@/components/music/MusicPlayer";
import { useEffect } from "react";

const MusicEmbed = () => {
  const { id } = useParams<{ id?: string }>();
  const { songs, isLoading } = useShowSongs();

  // Add body class so CSS can override the dark background
  useEffect(() => {
    document.body.classList.add("music-embed");
    return () => {
      document.body.classList.remove("music-embed");
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4" style={{ background: "white" }}>
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const filtered = id ? songs.filter((s) => s.id === id) : songs;

  return (
    <div className="flex items-center justify-center p-4" style={{ background: "white" }}>
      <MusicPlayer songs={filtered} initialIndex={0} />
    </div>
  );
};

export default MusicEmbed;
