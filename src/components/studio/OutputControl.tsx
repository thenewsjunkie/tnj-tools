import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Monitor, ArrowLeft, ArrowRight, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { useOutputConfig, useUpdateOutputConfig, STUDIO_MODULES, StudioModule } from "@/hooks/useOutputConfig";
import { toast } from "sonner";

const OutputControl = () => {
  const { data: config, isLoading } = useOutputConfig();
  const updateConfig = useUpdateOutputConfig();

  const leftColumn = config?.leftColumn ?? [];
  const rightColumn = config?.rightColumn ?? [];

  const isInLeft = (id: StudioModule) => leftColumn.includes(id);
  const isInRight = (id: StudioModule) => rightColumn.includes(id);

  const toggleModule = (id: StudioModule, column: "left" | "right") => {
    if (!config) return;
    const newConfig = { ...config };

    if (column === "left") {
      newConfig.leftColumn = isInLeft(id)
        ? leftColumn.filter((m) => m !== id)
        : [...leftColumn, id];
    } else {
      newConfig.rightColumn = isInRight(id)
        ? rightColumn.filter((m) => m !== id)
        : [...rightColumn, id];
    }

    updateConfig.mutate(newConfig, {
      onError: (err: any) => toast.error(err.message),
    });
  };

  return (
    <Card className="border-blue-500/30 bg-gradient-to-br from-[#1a1a2e] to-[#16213e]">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Monitor className="h-5 w-5 text-blue-400" />
            <CardTitle className="text-blue-400 text-lg">Output Control</CardTitle>
          </div>
          <Link
            to="/output"
            target="_blank"
            className="flex items-center gap-1 text-blue-400 hover:text-blue-300 text-sm transition-colors"
          >
            Open Output <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-gray-500 text-sm">Loading...</p>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {/* Left Column */}
            <div>
              <h3 className="text-xs font-semibold text-blue-300/70 uppercase tracking-wider mb-2 flex items-center gap-1">
                <ArrowLeft className="h-3 w-3" /> Left Column
              </h3>
              <div className="space-y-1.5">
                {STUDIO_MODULES.map((mod) => (
                  <button
                    key={mod.id}
                    onClick={() => toggleModule(mod.id, "left")}
                    className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                      isInLeft(mod.id)
                        ? "bg-blue-500/20 text-blue-300 border border-blue-500/40"
                        : "bg-black/20 text-gray-400 hover:bg-black/30 border border-transparent"
                    }`}
                  >
                    {mod.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Right Column */}
            <div>
              <h3 className="text-xs font-semibold text-blue-300/70 uppercase tracking-wider mb-2 flex items-center gap-1">
                <ArrowRight className="h-3 w-3" /> Right Column
              </h3>
              <div className="space-y-1.5">
                {STUDIO_MODULES.map((mod) => (
                  <button
                    key={mod.id}
                    onClick={() => toggleModule(mod.id, "right")}
                    className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                      isInRight(mod.id)
                        ? "bg-blue-500/20 text-blue-300 border border-blue-500/40"
                        : "bg-black/20 text-gray-400 hover:bg-black/30 border border-transparent"
                    }`}
                  >
                    {mod.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OutputControl;
