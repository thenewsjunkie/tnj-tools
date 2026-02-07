import { useState } from "react";
import CountdownBanner from "@/components/ss-tools/CountdownBanner";
import SSToolsAdmin from "@/components/ss-tools/SSToolsAdmin";
import { Settings, Copy, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const EMBED_CODE = `<iframe src="${window.location.origin}/sstools/embed" width="100%" height="100" frameborder="0" style="border:none;overflow:hidden;" allowtransparency="true"></iframe>`;

const SSTools = () => {
  const [showSettings, setShowSettings] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = async () => {
    await navigator.clipboard.writeText(EMBED_CODE);
    setCopied(true);
    toast({ title: "Copied", description: "Embed code copied to clipboard" });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative">
      <CountdownBanner />

      {/* Gear icon */}
      <button
        onClick={() => setShowSettings((v) => !v)}
        className="absolute top-3 right-3 p-2 rounded-full text-foreground hover:bg-muted transition-colors z-20"
        aria-label="Toggle settings"
      >
        <Settings className="h-5 w-5" />
      </button>

      {/* Settings overlay */}
      {showSettings && (
        <div className="absolute inset-0 z-10 bg-background/95 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-foreground text-sm font-semibold tracking-wider uppercase">
                SS Tools Settings
              </h2>
              <button
                onClick={() => setShowSettings(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <SSToolsAdmin />

            {/* Embed code */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Embed Code</label>
              <div className="relative">
                <pre className="bg-muted border border-border rounded-md p-3 text-xs text-muted-foreground overflow-x-auto whitespace-pre-wrap break-all">
                  {EMBED_CODE}
                </pre>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCopy}
                  className="absolute top-1.5 right-1.5 h-7 px-2 text-muted-foreground hover:text-foreground"
                >
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SSTools;
