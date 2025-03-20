
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Github, ArrowLeft, ExternalLink } from "lucide-react";

const Header = () => {
  return (
    <>
      {/* Custom header with back button to admin page */}
      <nav className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8 p-4">
        <Link 
          to="/admin" 
          className="text-foreground hover:text-neon-red transition-colors"
        >
          <div className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Admin
          </div>
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
        </div>
      </nav>
      
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-foreground">Manage GIFs</h1>
        <a href="/tnjgifs" target="_blank" rel="noopener noreferrer">
          <Button variant="outline" className="flex items-center gap-2">
            <ExternalLink size={16} />
            View Public Page
          </Button>
        </a>
      </div>
    </>
  );
};

export default Header;
