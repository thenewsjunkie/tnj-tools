import { useOutputConfig, StudioModule } from "@/hooks/useOutputConfig";
import SecretShowsLeaderboard from "@/pages/SecretShowsLeaderboard";
import HallOfFramePage from "@/pages/HallOfFrame";

const MODULE_COMPONENTS: Record<StudioModule, React.ComponentType> = {
  "leaderboard": SecretShowsLeaderboard,
  "hall-of-frame": HallOfFramePage,
};

const OutputColumn = ({ modules }: { modules: StudioModule[] }) => (
  <div className="flex-1 overflow-auto">
    {modules.map((id) => {
      const Component = MODULE_COMPONENTS[id];
      return Component ? <Component key={id} /> : null;
    })}
  </div>
);

const Output = () => {
  const { data: config, isLoading } = useOutputConfig();

  if (isLoading) {
    return <div className="h-screen bg-black flex items-center justify-center text-muted-foreground">Loading...</div>;
  }

  const left = config?.leftColumn ?? [];
  const right = config?.rightColumn ?? [];

  return (
    <div className="h-screen bg-black flex">
      {left.length > 0 && <OutputColumn modules={left} />}
      {left.length > 0 && right.length > 0 && (
        <div className="w-px bg-white/10" />
      )}
      {right.length > 0 && <OutputColumn modules={right} />}
      {left.length === 0 && right.length === 0 && (
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          No modules configured. Use Studio Screen to set up the output.
        </div>
      )}
    </div>
  );
};

export default Output;
