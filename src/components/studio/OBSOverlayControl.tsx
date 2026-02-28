import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Layers, ExternalLink, Pin, RotateCw } from "lucide-react";
import { Link } from "react-router-dom";
import {
  useOBSOverlayConfig,
  useUpdateOBSOverlayConfig,
  STUDIO_MODULES,
  OBSOverlayConfig,
} from "@/hooks/useOBSOverlayConfig";
import { StudioModule } from "@/hooks/useOutputConfig";
import { toast } from "sonner";

const INTERVAL_OPTIONS = [
  { value: 10, label: "10s" },
  { value: 15, label: "15s" },
  { value: 30, label: "30s" },
  { value: 60, label: "60s" },
];

const OBSOverlayControl = () => {
  const { data: config, isLoading } = useOBSOverlayConfig();
  const updateConfig = useUpdateOBSOverlayConfig();

  const save = (newConfig: OBSOverlayConfig) => {
    updateConfig.mutate(newConfig, {
      onError: (err: any) => toast.error(err.message),
    });
  };

  const toggleModule = (id: StudioModule) => {
    if (!config) return;
    const enabled = config.enabledModules.includes(id);
    const newModules = enabled
      ? config.enabledModules.filter((m) => m !== id)
      : [...config.enabledModules, id];

    // If we just removed the pinned module, clear the pin
    const pinnedModule =
      config.pinnedModule && !newModules.includes(config.pinnedModule)
        ? null
        : config.pinnedModule;

    save({ ...config, enabledModules: newModules, pinnedModule });
  };

  const pinModule = (id: StudioModule) => {
    if (!config) return;
    const isPinned = config.pinnedModule === id;
    save({
      ...config,
      mode: isPinned ? "auto" : "manual",
      pinnedModule: isPinned ? null : id,
    });
  };

  const setInterval = (seconds: number) => {
    if (!config) return;
    save({ ...config, cycleIntervalSeconds: seconds });
  };

  return (
    <Card className="border-purple-500/30 bg-gradient-to-br from-[#1a1a2e] to-[#2a1a3e]">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Layers className="h-5 w-5 text-purple-400" />
            <CardTitle className="text-purple-400 text-lg">OBS Overlay</CardTitle>
          </div>
          <Link
            to="/obs-overlay"
            target="_blank"
            className="flex items-center gap-1 text-purple-400 hover:text-purple-300 text-sm transition-colors"
          >
            Open Overlay <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <p className="text-gray-500 text-sm">Loading...</p>
        ) : (
          <>
            {/* Module toggles */}
            <div>
              <h3 className="text-xs font-semibold text-purple-300/70 uppercase tracking-wider mb-2">
                Modules in Rotation
              </h3>
              <div className="space-y-1.5">
                {STUDIO_MODULES.map((mod) => {
                  const enabled = config?.enabledModules.includes(mod.id);
                  const pinned = config?.pinnedModule === mod.id;

                  return (
                    <div key={mod.id} className="flex items-center gap-1.5">
                      <button
                        onClick={() => toggleModule(mod.id)}
                        className={`flex-1 text-left px-3 py-2 rounded text-sm transition-colors ${
                          enabled
                            ? "bg-purple-500/20 text-purple-300 border border-purple-500/40"
                            : "bg-black/20 text-gray-400 hover:bg-black/30 border border-transparent"
                        }`}
                      >
                        {mod.label}
                      </button>
                      {enabled && (
                        <button
                          onClick={() => pinModule(mod.id)}
                          title={pinned ? "Unpin (resume cycling)" : "Pin this module"}
                          className={`p-2 rounded transition-colors ${
                            pinned
                              ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                              : "bg-black/20 text-gray-500 hover:text-gray-300 border border-transparent"
                          }`}
                        >
                          <Pin className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Mode indicator */}
            <div className="flex items-center gap-2 px-3 py-2 rounded bg-black/20 text-sm">
              {config?.mode === "manual" && config.pinnedModule ? (
                <>
                  <Pin className="h-3.5 w-3.5 text-amber-400" />
                  <span className="text-amber-300">
                    Pinned: {STUDIO_MODULES.find((m) => m.id === config.pinnedModule)?.label}
                  </span>
                </>
              ) : (
                <>
                  <RotateCw className="h-3.5 w-3.5 text-purple-400" />
                  <span className="text-purple-300">
                    Auto-cycling ({config?.enabledModules.length ?? 0} modules)
                  </span>
                </>
              )}
            </div>

            {/* Cycle interval */}
            <div>
              <h3 className="text-xs font-semibold text-purple-300/70 uppercase tracking-wider mb-2">
                Cycle Interval
              </h3>
              <div className="flex gap-1.5">
                {INTERVAL_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setInterval(opt.value)}
                    className={`flex-1 px-3 py-1.5 rounded text-sm transition-colors ${
                      config?.cycleIntervalSeconds === opt.value
                        ? "bg-purple-500/20 text-purple-300 border border-purple-500/40"
                        : "bg-black/20 text-gray-500 hover:text-gray-300 border border-transparent"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick jump */}
            {(config?.enabledModules.length ?? 0) > 1 && (
              <div>
                <h3 className="text-xs font-semibold text-purple-300/70 uppercase tracking-wider mb-2">
                  Quick Show
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {config?.enabledModules.map((id) => {
                    const mod = STUDIO_MODULES.find((m) => m.id === id);
                    if (!mod) return null;
                    return (
                      <Button
                        key={id}
                        size="sm"
                        variant="outline"
                        onClick={() => pinModule(id)}
                        className={`text-xs ${
                          config.pinnedModule === id
                            ? "border-amber-500/40 text-amber-300 bg-amber-500/10"
                            : "border-purple-500/30 text-purple-300 hover:bg-purple-500/10"
                        }`}
                      >
                        {mod.label}
                      </Button>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default OBSOverlayControl;
