import { Link } from "react-router-dom";
import SecretShowsLeaderboard from "@/components/studio/SecretShowsLeaderboard";
import HallOfFrame from "@/components/studio/HallOfFrame";

const StudioScreen = () => {
  return (
    <div className="min-h-screen bg-background p-4 sm:p-8">
      <nav className="flex items-center justify-between mb-8">
        <Link
          to="/admin"
          className="text-foreground hover:text-neon-red transition-colors"
        >
          ← Admin
        </Link>
        <h1 className="text-foreground text-xl sm:text-2xl digital">Studio Screen</h1>
        <div className="w-16" />
      </nav>
      <div className="max-w-2xl mx-auto space-y-6">
        <SecretShowsLeaderboard />
        <HallOfFrame />
      </div>
    </div>
  );
};

export default StudioScreen;
