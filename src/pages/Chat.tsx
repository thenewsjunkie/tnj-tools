import { useEffect } from "react";
import { useChat, MESSAGES_TO_LOAD_MORE } from "@/hooks/useChat";
import { ChatInput } from "@/components/chat/ChatInput";
import { ChatMessageList } from "@/components/chat/ChatMessageList";
import { useLocation, useNavigate } from "react-router-dom";

const Chat = () => {
  const { messages, isLoading, hasMore, loadMessages } = useChat();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("[Chat] Component mounted at path:", location.pathname);
    
    return () => {
      console.log("[Chat] Component unmounting from path:", location.pathname);
    };
  }, [location.pathname]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      console.log("[Chat] Page is being unloaded");
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  const handleLoadMore = () => {
    loadMessages(messages.length, MESSAGES_TO_LOAD_MORE);
  };

  return (
    <div className="fixed inset-0 bg-black text-white flex flex-col">
      <ChatMessageList
        messages={messages}
        isLoading={isLoading}
        hasMore={hasMore}
        onLoadMore={handleLoadMore}
      />
      <ChatInput />
    </div>
  );
};

export default Chat;