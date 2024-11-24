import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      <nav className="fixed top-0 right-0 p-4">
        <Link 
          to="/login" 
          className="text-white hover:text-neon-red transition-colors px-4 py-2 border border-white/20 rounded"
        >
          Login
        </Link>
      </nav>
      
      <div className="digital text-[clamp(4rem,20vw,12rem)] leading-none text-neon-red animate-led-flicker tracking-tight">
        TNJ Tools
      </div>
      <div className="absolute bottom-8 text-white/50 text-sm">
        555am.io
      </div>
    </div>
  );
};

export default Index;