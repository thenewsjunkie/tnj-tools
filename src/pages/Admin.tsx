import { Link } from "react-router-dom";
import Stopwatch from "@/components/Stopwatch";
import SocialStats from "@/components/SocialStats";
import SocialGraph from "@/components/SocialGraph";
import ShowNotes from "@/components/ShowNotes";
import MediaPool from "@/components/MediaPool";
import Reminders from "@/components/Reminders";
import InterviewRequestsModule from "@/components/InterviewRequestsModule";

const Admin = () => {
  return (
    <div className="min-h-screen bg-black p-4 sm:p-6 md:p-8">
      <nav className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
        <Link 
          to="/" 
          className="text-white hover:text-neon-red transition-colors"
        >
          ← Home
        </Link>
        <h1 className="text-white text-xl sm:text-2xl digital">555am.io Admin</h1>
      </nav>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 max-w-7xl mx-auto">
        <Reminders />
        <Stopwatch />
        <SocialStats />
        <ShowNotes />
        <div className="md:col-span-2">
          <SocialGraph />
        </div>
        <InterviewRequestsModule />
        <MediaPool />
      </div>
    </div>
  );
};

export default Admin;