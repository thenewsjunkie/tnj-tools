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
        className="absolute top-3 right-3 p-2 rounded-full text-white/30 hover:text-white/70 hover:bg-white/10 transition-colors z-20"
        aria-label="Toggle settings"
      >
        <Settings className="h-5 w-5" />
      </button>

      {/* Settings overlay */}
      {showSettings && (
        <div className="absolute inset-0 z-10 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-white text-sm font-semibold tracking-wider uppercase">
                SS Tools Settings
              </h2>
              <button
                onClick={() => setShowSettings(false)}
                className="text-white/40 hover:text-white/80 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <SSToolsAdmin />

            {/* Embed code */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-400">Embed Code</label>
              <div className="relative">
                <pre className="bg-gray-900 border border-gray-700 rounded-md p-3 text-xs text-gray-300 overflow-x-auto whitespace-pre-wrap break-all">
                  {EMBED_CODE}
                </pre>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCopy}
                  className="absolute top-1.5 right-1.5 h-7 px-2 text-gray-400 hover:text-white hover:bg-gray-700"
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
