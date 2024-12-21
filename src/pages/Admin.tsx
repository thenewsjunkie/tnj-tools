import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  MessageSquare, 
  Settings, 
  FileText, 
  History,
  Bot
} from "lucide-react";

const Admin = () => {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link to="/admin/survey-analytics">
          <Button variant="outline" className="w-full h-32 flex flex-col items-center justify-center gap-2">
            <BarChart3 className="w-8 h-8" />
            <span>Survey Analytics</span>
          </Button>
        </Link>

        <Link to="/admin/ai">
          <Button variant="outline" className="w-full h-32 flex flex-col items-center justify-center gap-2">
            <Bot className="w-8 h-8" />
            <span>AI Tools</span>
          </Button>
        </Link>

        <Link to="/admin/settings">
          <Button variant="outline" className="w-full h-32 flex flex-col items-center justify-center gap-2">
            <Settings className="w-8 h-8" />
            <span>Settings</span>
          </Button>
        </Link>

        <Link to="/admin/instructions">
          <Button variant="outline" className="w-full h-32 flex flex-col items-center justify-center gap-2">
            <FileText className="w-8 h-8" />
            <span>Instructions</span>
          </Button>
        </Link>

        <Link to="/admin/queue-history">
          <Button variant="outline" className="w-full h-32 flex flex-col items-center justify-center gap-2">
            <History className="w-8 h-8" />
            <span>Queue History</span>
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default Admin;