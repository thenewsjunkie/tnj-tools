import { MessageSquare } from "lucide-react";
import { ViewerCount } from "./ViewerCount";

interface ChatStatsProps {
  totalMessages: number;
  isBotConnected: boolean;
}

export const ChatStats = ({ totalMessages, isBotConnected }: ChatStatsProps) => {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1.5 bg-black/90 backdrop-blur-sm px-2 py-1 rounded-md">
        <MessageSquare className="h-4 w-4 text-white/90" />
        <div className="flex items-center gap-2 text-sm font-mono text-white/90">
          <span>{totalMessages}</span>
        </div>
      </div>
      <ViewerCount />
      {!isBotConnected && (
        <div className="text-red-500 text-sm">
          Bot disconnected
        </div>
      )}
    </div>
  );
};