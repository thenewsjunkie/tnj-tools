
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Github, ArrowLeft, ExternalLink, Clipboard } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const Header = () => {
  const { toast } = useToast();

  const copyEmbedCode = () => {
    // Generate the embed code with an iframe pointing to the TNJGifsEmbed page
    // Using tnjtools.com as the base domain
    const baseUrl = "https://tnjtools.com";
    const embedCode = `<iframe 
  src="${baseUrl}/tnjgifs-embed" 
  width="100%" 
  height="600px" 
  style="border: none; max-width: 100%;" 
  title="TNJ GIFs Gallery"
  allow="clipboard-write"
></iframe>`;

    // Copy to clipboard
    navigator.clipboard.writeText(embedCode)
      .then(() => {
        toast({
          title: "Embed code copied!",
          description: "You can now paste the embed code into your website.",
        });
      })
      .catch((error) => {
        console.error("Failed to copy embed code:", error);
        toast({
          title: "Failed to copy",
          description: "Please try again or copy manually.",
          variant: "destructive",
        });
      });
  };

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
      
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold text-foreground">Manage GIFs</h1>
        <div className="flex flex-wrap gap-3 justify-center sm:justify-end">
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={copyEmbedCode}
          >
            <Clipboard size={16} />
            Copy Embed Code
          </Button>
          <a href="/tnjgifs" target="_blank" rel="noopener noreferrer">
            <Button variant="outline" className="flex items-center gap-2">
              <ExternalLink size={16} />
              View Public Page
            </Button>
          </a>
        </div>
      </div>
    </>
  );
};

export default Header;
