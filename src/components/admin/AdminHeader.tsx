
import { Link } from "react-router-dom";
import { Settings, Github } from "lucide-react";
import { Button } from "@/components/ui/button";

const AdminHeader = () => {
  return (
    <nav className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
      <Link 
        to="/" 
        className="text-foreground hover:text-neon-red transition-colors"
      >
        ← Home
      </Link>
      <div className="flex items-center gap-4">
        <a
          href="https://github.com/thenewsjunkie/tnj-tools"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-foreground hover:text-primary transition-colors"
        >
          <Github className="h-5 w-5" />
        </a>
        <h1 className="text-foreground text-xl sm:text-2xl digital">TNJ Tools</h1>
        <Link to="/admin/settings">
          <Button
            variant="ghost"
            size="icon"
            className="text-foreground hover:text-primary hover:bg-white/10"
          >
            <Settings className="h-5 w-5" />
          </Button>
        </Link>
      </div>
    </nav>
  );
};

export default AdminHeader;
