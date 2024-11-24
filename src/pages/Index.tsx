import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      <nav className="fixed top-0 right-0 p-4">
        <Link 
          to="/admin" 
          className="text-white hover:text-neon-red transition-colors px-4 py-2 border border-white/20 rounded"
        >
          Admin
        </Link>
      </nav>
      
      <div className="digital text-[clamp(100px,30vw,200px)] text-neon-red animate-led-flicker">
        5:55
      </div>
      <div className="digital text-[clamp(20px,8vw,40px)] text-neon-red/80 -mt-2 sm:-mt-4 md:-mt-8">
        AM
      </div>
      <div className="absolute bottom-8 text-white/50 text-sm">
        555am.io
      </div>
    </div>
  );
};

export default Index;