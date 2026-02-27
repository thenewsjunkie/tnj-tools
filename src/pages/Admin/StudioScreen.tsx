import { Link } from "react-router-dom";

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
      <div className="border border-border rounded-lg p-8 text-center text-muted-foreground">
        Control Panel
      </div>
    </div>
  );
};

export default StudioScreen;
