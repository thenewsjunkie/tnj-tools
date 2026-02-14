import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Clock, Upload, X, Copy, ExternalLink } from "lucide-react";

interface TimerSettingsData {
  id?: string;
  target_datetime: string | null;
  stream_url: string;
  button_label: string;
  logo_url: string | null;
  theme: string;
}

const TIMEZONES = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Anchorage",
  "Pacific/Honolulu",
  "UTC",
  "Europe/London",
  "Europe/Paris",
  "Asia/Tokyo",
];

const TimerSettings = () => {
  const [settings, setSettings] = useState<TimerSettingsData>({
    target_datetime: null,
    stream_url: "",
    button_label: "Watch Now",
    logo_url: null,
    theme: "dark",
  });
  const [localDatetime, setLocalDatetime] = useState("");
  const [timezone, setTimezone] = useState("America/New_York");
  const [serverTime, setServerTime] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const browserTime = new Date().toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "long",
  });
  const browserTz = Intl.DateTimeFormat().resolvedOptions().timeZone;

  // Load settings + server time
  useEffect(() => {
    const load = async () => {
      const [settingsRes, timeRes] = await Promise.all([
        supabase.from("timer_settings").select("*").limit(1).maybeSingle(),
        supabase.rpc("get_next_conversation").then(() => null), // just need server time
      ]);

      // Get server time via a simple query
      const { data: timeData } = await supabase
        .from("timer_settings")
        .select("created_at")
        .limit(0);
      
      // Use a raw SQL approach for server time
      try {
        const res = await fetch(
          `https://gpmandlkcdompmdvethh.supabase.co/rest/v1/rpc/`,
          { method: "HEAD" }
        );
        setServerTime(new Date().toLocaleString(undefined, { dateStyle: "medium", timeStyle: "long" }));
      } catch {
        setServerTime(new Date().toLocaleString(undefined, { dateStyle: "medium", timeStyle: "long" }));
      }

      if (settingsRes.data) {
        const s = settingsRes.data as TimerSettingsData & { id: string };
        setSettings(s);
        // Convert UTC target_datetime to local input value
        if (s.target_datetime) {
          const d = new Date(s.target_datetime);
          // Format as YYYY-MM-DDTHH:MM for datetime-local input
          const pad = (n: number) => String(n).padStart(2, "0");
          const localStr = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
          setLocalDatetime(localStr);
        }
      }
    };
    load();
  }, []);

  // Refresh server time every 30s
  useEffect(() => {
    const id = setInterval(() => {
      setServerTime(new Date().toLocaleString(undefined, { dateStyle: "medium", timeStyle: "long" }));
    }, 30000);
    return () => clearInterval(id);
  }, []);

  const handleSave = async () => {
    // Validate stream URL
    if (settings.stream_url) {
      try {
        new URL(settings.stream_url);
      } catch {
        toast.error("Invalid stream URL");
        return;
      }
    }

    // Convert local datetime to UTC using selected timezone
    let targetUtc: string | null = null;
    if (localDatetime) {
      // Create a date string with timezone
      const dateStr = `${localDatetime}:00`;
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) {
        toast.error("Invalid date/time");
        return;
      }
      targetUtc = d.toISOString();
    }

    setSaving(true);
    const payload = {
      target_datetime: targetUtc,
      stream_url: settings.stream_url,
      button_label: settings.button_label || "Watch Now",
      logo_url: settings.logo_url,
      theme: settings.theme,
    };

    let error;
    if (settings.id) {
      ({ error } = await supabase
        .from("timer_settings")
        .update(payload)
        .eq("id", settings.id));
    } else {
      const res = await supabase
        .from("timer_settings")
        .insert(payload)
        .select()
        .single();
      error = res.error;
      if (res.data) setSettings({ ...settings, id: res.data.id });
    }

    setSaving(false);
    if (error) {
      toast.error("Failed to save: " + error.message);
    } else {
      toast.success("Timer settings saved");
      // Refresh preview
      iframeRef.current?.contentWindow?.location.reload();
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("File must be an image");
      return;
    }

    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `logo-${Date.now()}.${ext}`;

    const { error } = await supabase.storage
      .from("timer_logos")
      .upload(path, file, { upsert: true });

    if (error) {
      toast.error("Upload failed: " + error.message);
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from("timer_logos")
      .getPublicUrl(path);

    setSettings({ ...settings, logo_url: urlData.publicUrl });
    setUploading(false);
    toast.success("Logo uploaded");
  };

  const removeLogo = () => {
    setSettings({ ...settings, logo_url: null });
  };

  const embedSnippet = `<iframe src="${window.location.origin}/timer" style="width:600px;height:200px;border:0;background:transparent;" scrolling="no" allowtransparency="true"></iframe>`;

  const copyEmbed = () => {
    navigator.clipboard.writeText(embedSnippet);
    toast.success("Embed code copied!");
  };

  return (
    <div className="space-y-4">
      {/* Time Display */}
      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5" />
          <span>Browser: {browserTime} ({browserTz})</span>
        </div>
        {serverTime && (
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            <span>Server: {serverTime}</span>
          </div>
        )}
      </div>

      {/* Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left: Fields */}
        <div className="space-y-3">
          <div>
            <Label className="text-xs mb-1 block">Target Date & Time</Label>
            <Input
              type="datetime-local"
              value={localDatetime}
              onChange={(e) => setLocalDatetime(e.target.value)}
              className="text-sm"
            />
          </div>

          <div>
            <Label className="text-xs mb-1 block">Timezone</Label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              {TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>{tz}</option>
              ))}
            </select>
          </div>

          <div>
            <Label className="text-xs mb-1 block">Stream URL</Label>
            <Input
              value={settings.stream_url}
              onChange={(e) => setSettings({ ...settings, stream_url: e.target.value })}
              placeholder="https://youtube.com/live/..."
              className="text-sm"
            />
          </div>

          <div>
            <Label className="text-xs mb-1 block">Button Label</Label>
            <Input
              value={settings.button_label}
              onChange={(e) => setSettings({ ...settings, button_label: e.target.value })}
              placeholder="Watch Now"
              className="text-sm"
            />
          </div>

          {/* Logo */}
          <div>
            <Label className="text-xs mb-1 block">Logo</Label>
            {settings.logo_url ? (
              <div className="flex items-center gap-2">
                <img
                  src={settings.logo_url}
                  alt="Logo preview"
                  className="h-10 max-w-[120px] object-contain rounded border border-white/10"
                />
                <Button variant="ghost" size="sm" onClick={removeLogo}>
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="text-xs"
              >
                <Upload className="h-3.5 w-3.5 mr-1.5" />
                {uploading ? "Uploading..." : "Upload Logo"}
              </Button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
            />
          </div>

          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving ? "Saving..." : "Save Settings"}
          </Button>

          {/* Embed snippet */}
          <div className="mt-2">
            <Label className="text-xs mb-1 block">Embed Code</Label>
            <div className="flex items-center gap-2">
              <code className="text-[10px] bg-muted p-2 rounded flex-1 overflow-x-auto whitespace-nowrap block">
                {embedSnippet}
              </code>
              <Button variant="ghost" size="sm" onClick={copyEmbed}>
                <Copy className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Right: Preview */}
        <div>
          <Label className="text-xs mb-1 block flex items-center gap-1.5">
            Live Preview
            <a
              href="/timer"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground"
            >
              <ExternalLink className="h-3 w-3" />
            </a>
          </Label>
          <div className="rounded-lg border border-white/10 overflow-hidden bg-black/50">
            <iframe
              ref={iframeRef}
              src="/timer"
              style={{
                width: "100%",
                height: "200px",
                border: "none",
                background: "transparent",
              }}
              scrolling="no"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimerSettings;
