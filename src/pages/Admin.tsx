import { Link } from "react-router-dom";
import Stopwatch from "@/components/Stopwatch";
import SocialStats from "@/components/SocialStats";
import SocialGraph from "@/components/SocialGraph";

const Admin = () => {
  return (
    <div className="min-h-screen bg-black p-8">
      <nav className="flex justify-between items-center mb-8">
        <Link 
          to="/" 
          className="text-white hover:text-neon-red transition-colors"
        >
          ← Back to Clock
        </Link>
        <h1 className="text-white text-2xl digital">555am.io Admin</h1>
      </nav>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Stopwatch />
        <SocialStats />
        <div className="md:col-span-2">
          <SocialGraph />
        </div>
      </div>
    </div>
  );
};

export default Admin;