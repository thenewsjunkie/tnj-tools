import { useState, useRef } from "react";
import { useShowSongs } from "@/hooks/useShowSongs";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Upload, Trash2, Link, Music, Loader2 } from "lucide-react";

const MusicManager = () => {
  const { songs, isLoading, addSong, deleteSong } = useShowSongs();
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Auto-fill title from filename if empty
    const autoTitle = title || file.name.replace(/\.[^/.]+$/, "");

    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${crypto.randomUUID()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("show_songs")
        .upload(path, file, { contentType: file.type });
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from("show_songs").getPublicUrl(path);

      // Get duration
      const duration = await new Promise<number>((resolve) => {
        const audio = new Audio(URL.createObjectURL(file));
        audio.addEventListener("loadedmetadata", () => resolve(audio.duration));
        audio.addEventListener("error", () => resolve(0));
      });

      await addSong.mutateAsync({
        title: autoTitle,
        artist: artist || undefined,
        audio_url: urlData.publicUrl,
        duration,
      });

      setTitle("");
      setArtist("");
      if (fileRef.current) fileRef.current.value = "";
      toast.success("Song uploaded");
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const copyEmbedUrl = (id: string) => {
    const url = `${window.location.origin}/music-embed/${id}`;
    navigator.clipboard.writeText(url);
    toast.success("Embed URL copied");
  };

  const handleDelete = async (id: string, audioUrl: string) => {
    try {
      // Delete from storage
      const path = audioUrl.split("/show_songs/")[1];
      if (path) await supabase.storage.from("show_songs").remove([path]);
      await deleteSong.mutateAsync(id);
      toast.success("Song deleted");
    } catch (err: any) {
      toast.error(err.message || "Delete failed");
    }
  };

  const formatDuration = (d: number | null) => {
    if (!d) return "--:--";
    const m = Math.floor(d / 60);
    const s = Math.floor(d % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-4">
      {/* Upload form */}
      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <Input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="flex-1"
          />
          <Input
            placeholder="Artist"
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
            className="flex-1"
          />
        </div>
        <div className="flex gap-2">
          <input
            ref={fileRef}
            type="file"
            accept="audio/*"
            onChange={handleUpload}
            className="hidden"
          />
          <Button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Upload className="h-4 w-4 mr-2" />
            )}
            {uploading ? "Uploading..." : "Upload MP3"}
          </Button>
        </div>
      </div>

      {/* Song list */}
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : songs.length === 0 ? (
        <p className="text-sm text-muted-foreground">No songs yet</p>
      ) : (
        <div className="space-y-1">
          {songs.map((song) => (
            <div
              key={song.id}
              className="flex items-center gap-2 p-2 rounded-md bg-muted/50 text-sm"
            >
              <Music className="h-4 w-4 text-muted-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="font-medium truncate block">{song.title}</span>
                {song.artist && (
                  <span className="text-muted-foreground text-xs">{song.artist}</span>
                )}
              </div>
              <span className="text-xs text-muted-foreground shrink-0">
                {formatDuration(song.duration)}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0"
                onClick={() => copyEmbedUrl(song.id)}
                title="Copy embed URL"
              >
                <Link className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0 text-destructive hover:text-destructive"
                onClick={() => handleDelete(song.id, song.audio_url)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Copy full playlist embed */}
      {songs.length > 0 && (
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => {
            navigator.clipboard.writeText(`${window.location.origin}/music-embed`);
            toast.success("Playlist embed URL copied");
          }}
        >
          <Link className="h-4 w-4 mr-2" />
          Copy Playlist Embed URL
        </Button>
      )}
    </div>
  );
};

export default MusicManager;
