import { Settings } from "lucide-react";
import { Link } from "react-router-dom";

const ChatStatusIndicator = () => {
  return (
    <div className="fixed bottom-4 right-4 flex items-center gap-2 bg-black/50 backdrop-blur-sm p-2 rounded-lg">
      <Link to="/chat/settings">
        <Settings className="h-5 w-5 hover:text-primary transition-colors" />
      </Link>
    </div>
  );
};

export default ChatStatusIndicator;