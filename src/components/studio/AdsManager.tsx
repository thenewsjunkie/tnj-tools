import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Image, Plus, Trash2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export interface AdItem {
  id: string;
  imageUrl: string;
  label: string;
}

export interface AdsConfig {
  ads: AdItem[];
  intervalSeconds: number;
}

const ADS_CONFIG_KEY = "studio_ads_config";

const DEFAULT_ADS_CONFIG: AdsConfig = {
  ads: [],
  intervalSeconds: 10,
};

export const useAdsConfig = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["ads-config"],
    queryFn: async (): Promise<AdsConfig> => {
      const { data, error } = await supabase
        .from("system_settings")
        .select("value")
        .eq("key", ADS_CONFIG_KEY)
        .maybeSingle();
      if (error) throw error;
      if (!data) return DEFAULT_ADS_CONFIG;
      return data.value as unknown as AdsConfig;
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel("ads-config-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "system_settings", filter: `key=eq.${ADS_CONFIG_KEY}` },
        () => queryClient.invalidateQueries({ queryKey: ["ads-config"] })
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  return query;
};

export const useUpdateAdsConfig = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (config: AdsConfig) => {
      const { error } = await supabase
        .from("system_settings")
        .upsert({ key: ADS_CONFIG_KEY, value: config as any, updated_at: new Date().toISOString() }, { onConflict: "key" });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["ads-config"] }),
  });
};

const AdsManager = () => {
  const { data: config, isLoading } = useAdsConfig();
  const updateConfig = useUpdateAdsConfig();
  const [uploading, setUploading] = useState(false);
  const [label, setLabel] = useState("");

  const ads = config?.ads ?? [];
  const intervalSeconds = config?.intervalSeconds ?? 10;

  const save = (newConfig: AdsConfig) => {
    updateConfig.mutate(newConfig, { onError: (e: any) => toast.error(e.message) });
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

      const newAd: AdItem = {
        id: crypto.randomUUID(),
        imageUrl: data.url,
        label: label.trim() || file.name,
      };
      save({ ads: [...ads, newAd], intervalSeconds });
      setLabel("");
      toast.success("Ad image added");
    } catch (err: any) {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const removeAd = (id: string) => {
    save({ ads: ads.filter((a) => a.id !== id), intervalSeconds });
    toast.success("Ad removed");
  };

  const updateInterval = (seconds: number) => {
    if (seconds < 3) return;
    save({ ads, intervalSeconds: seconds });
  };

  return (
    <Card className="border-amber-500/30 bg-gradient-to-br from-[#1a1a2e] to-[#16213e]">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <Image className="h-5 w-5 text-amber-400" />
          <CardTitle className="text-amber-400 text-lg">Ads</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <p className="text-muted-foreground text-sm">Loading...</p>
        ) : (
          <>
            {/* Existing ads */}
            {ads.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {ads.map((ad) => (
                  <div key={ad.id} className="relative group rounded overflow-hidden border border-amber-500/20 bg-black/20">
                    <img src={ad.imageUrl} alt={ad.label} className="w-full h-24 object-cover" />
                    <div className="absolute bottom-0 left-0 right-0 bg-black/70 px-2 py-1 text-[10px] text-white truncate">
                      {ad.label}
                    </div>
                    <button
                      onClick={() => removeAd(ad.id)}
                      className="absolute top-1 right-1 bg-black/60 rounded p-1 opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add new ad */}
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  placeholder="Ad label (optional)"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  className="bg-black/30 border-amber-500/20 text-white placeholder:text-gray-500 text-sm flex-1"
                />
              </div>
              <div className="flex gap-2 items-center">
                <label className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
                    disabled={uploading}
                    asChild
                  >
                    <span>
                      {uploading ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Plus className="h-4 w-4 mr-1" />}
                      {uploading ? "Uploading..." : "Add Ad Image"}
                    </span>
                  </Button>
                </label>
              </div>
            </div>

            {/* Rotation interval */}
            <div className="flex items-center gap-2">
              <Label className="text-xs text-gray-400 whitespace-nowrap">Rotate every</Label>
              <Input
                type="number"
                min={3}
                value={intervalSeconds}
                onChange={(e) => updateInterval(Number(e.target.value))}
                className="bg-black/30 border-amber-500/20 text-white w-20 text-sm"
              />
              <span className="text-xs text-gray-400">sec</span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default AdsManager;
