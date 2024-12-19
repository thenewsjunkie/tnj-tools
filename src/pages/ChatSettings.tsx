import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { BotControls } from "@/components/chat/settings/BotControls";
import { MessageSearch } from "@/components/chat/settings/MessageSearch";

const ChatSettings = () => {
  return (
    <div className="fixed inset-0 bg-black text-white overflow-auto">
      <div className="max-w-2xl mx-auto space-y-8 p-4">
        <Link
          to="/chat"
          className="text-red-500 hover:text-red-400 transition-colors flex items-center gap-2"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Chat
        </Link>

        <h1 className="text-2xl font-bold">Chat Settings</h1>

        <BotControls />

        <div className="space-y-4 pt-8 border-t border-gray-800">
          <MessageSearch />
        </div>
      </div>
    </div>
  );
};

export default ChatSettings;