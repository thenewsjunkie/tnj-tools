import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Frame, Plus, Trash2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useArtModeConfig, useUpdateArtModeConfig, ArtModeConfig, ArtModeImage } from "@/hooks/useArtMode";

const ArtModeManager = () => {
  const { data: config, isLoading } = useArtModeConfig();
  const updateConfig = useUpdateArtModeConfig();
  const [uploading, setUploading] = useState(false);
  const [label, setLabel] = useState("");

  const images = config?.images ?? [];
  const intervalSeconds = config?.intervalSeconds ?? 30;
  const permanent = config?.permanent ?? false;
  const transition = config?.transition ?? "fade";
  const frameStyle = config?.frameStyle ?? "gold";

  const save = (partial: Partial<ArtModeConfig>) => {
    const full: ArtModeConfig = { images, intervalSeconds, permanent, transition, frameStyle, ...partial };
    updateConfig.mutate(full, { onError: (e: any) => toast.error(e.message) });
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const { data, error } = await supabase.functions.invoke("upload-show-note-image", { body: formData });
      if (error) throw error;
      const newImage: ArtModeImage = {
        id: crypto.randomUUID(),
        imageUrl: data.url,
        label: label.trim() || file.name,
      };
      save({ images: [...images, newImage] });
      setLabel("");
      toast.success("Art image added");
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const removeImage = (id: string) => {
    save({ images: images.filter((img) => img.id !== id) });
    toast.success("Image removed");
  };

  return (
    <Card className="border-purple-500/30 bg-gradient-to-br from-[#1a1a2e] to-[#16213e]">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <Frame className="h-5 w-5 text-purple-400" />
          <CardTitle className="text-purple-400 text-lg">Art Mode</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <p className="text-muted-foreground text-sm">Loading...</p>
        ) : (
          <>
            {/* Image grid */}
            {images.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {images.map((img) => (
                  <div key={img.id} className="relative group rounded overflow-hidden border border-purple-500/20 bg-black/20">
                    <img src={img.imageUrl} alt={img.label} className="w-full h-24 object-cover" />
                    <div className="absolute bottom-0 left-0 right-0 bg-black/70 px-2 py-1 text-[10px] text-white truncate">
                      {img.label}
                    </div>
                    <button
                      onClick={() => removeImage(img.id)}
                      className="absolute top-1 right-1 bg-black/60 rounded p-1 opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload */}
            <div className="space-y-2">
              <Input
                placeholder="Image label (optional)"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                className="bg-black/30 border-purple-500/20 text-white placeholder:text-gray-500 text-sm"
              />
              <label>
                <input type="file" accept="image/*" onChange={handleUpload} className="hidden" disabled={uploading} />
                <Button size="sm" variant="outline" className="w-full border-purple-500/30 text-purple-400 hover:bg-purple-500/10" disabled={uploading} asChild>
                  <span>
                    {uploading ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Plus className="h-4 w-4 mr-1" />}
                    {uploading ? "Uploading..." : "Add Art Image"}
                  </span>
                </Button>
              </label>
            </div>

            {/* Interval + Permanent */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 flex-1">
                <Label className="text-xs text-gray-400 whitespace-nowrap">Display</Label>
                <Input
                  type="number"
                  min={5}
                  value={intervalSeconds}
                  onChange={(e) => save({ intervalSeconds: Math.max(5, Number(e.target.value)) })}
                  disabled={permanent}
                  className="bg-black/30 border-purple-500/20 text-white w-20 text-sm"
                />
                <span className="text-xs text-gray-400">sec</span>
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-xs text-gray-400">Permanent</Label>
                <Switch checked={permanent} onCheckedChange={(v) => save({ permanent: v })} />
              </div>
            </div>

            {/* Transition */}
            <div className="flex items-center gap-2">
              <Label className="text-xs text-gray-400 whitespace-nowrap">Transition</Label>
              <Select value={transition} onValueChange={(v: any) => save({ transition: v })}>
                <SelectTrigger className="bg-black/30 border-purple-500/20 text-white text-sm h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fade">Fade</SelectItem>
                  <SelectItem value="slide">Slide</SelectItem>
                  <SelectItem value="zoom">Zoom</SelectItem>
                  <SelectItem value="none">None</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Frame style */}
            <div className="flex items-center gap-2">
              <Label className="text-xs text-gray-400 whitespace-nowrap">Frame</Label>
              <Select value={frameStyle} onValueChange={(v: any) => save({ frameStyle: v })}>
                <SelectTrigger className="bg-black/30 border-purple-500/20 text-white text-sm h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gold">Gold</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="minimal">Minimal</SelectItem>
                  <SelectItem value="none">None</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ArtModeManager;
