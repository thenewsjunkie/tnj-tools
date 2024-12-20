import ShowNotes from "@/components/ShowNotes";
import { Link } from "react-router-dom";

const Notes = () => {
  return (
    <div className="min-h-screen bg-background p-4">
      <nav className="flex justify-between items-center mb-8 max-w-7xl mx-auto">
        <Link 
          to="/" 
          className="text-foreground hover:text-neon-red transition-colors"
        >
          ← Home
        </Link>
        <h1 className="text-foreground text-xl sm:text-2xl digital">TNJ Notes</h1>
      </nav>
      
      <div className="max-w-3xl mx-auto">
        <ShowNotes />
      </div>
    </div>
  );
};

export default Notes;