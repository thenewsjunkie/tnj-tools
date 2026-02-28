import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";

const RESTREAM_CHAT_URL = "https://chat.restream.io/embed?token=2e6e4e85-bd6b-411a-89c1-a8bebf957699";

const RestreamChat = () => {
  return (
    <Card className="border-purple-500/30 bg-gradient-to-br from-[#1a1a2e] to-[#16213e]">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <MessageSquare className="h-5 w-5 text-purple-400" />
          <CardTitle className="text-purple-400 text-lg">Live Chat</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded overflow-hidden" style={{ height: 500 }}>
          <iframe
            src={RESTREAM_CHAT_URL}
            className="w-full h-full"
            style={{ border: 0 }}
            allow="clipboard-write"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default RestreamChat;
