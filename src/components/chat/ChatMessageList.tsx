import { useEffect, useRef, useState } from "react";
import ChatMessageComponent from "@/components/chat/ChatMessage";
import { Tables } from "@/integrations/supabase/types";

type ChatMessageType = Tables<"chat_messages">;

interface ChatMessageListProps {
  messages: ChatMessageType[];
  isLoading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
}

export const ChatMessageList = ({ 
  messages, 
  isLoading, 
  hasMore, 
  onLoadMore 
}: ChatMessageListProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const lastScrollTop = useRef(0);
  const [autoScroll, setAutoScroll] = useState(true);

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const element = event.currentTarget;
    const isAtBottom =
      Math.abs(
        element.scrollHeight - element.scrollTop - element.clientHeight
      ) < 10;
    
    if (element.scrollTop === 0 && !isLoading && hasMore) {
      onLoadMore();
    }

    setAutoScroll(isAtBottom);
    lastScrollTop.current = element.scrollTop;
  };

  const scrollToBottom = () => {
    if (containerRef.current && autoScroll) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  };

  // Scroll to bottom on initial load and when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <>
      {isLoading && (
        <div className="absolute top-0 left-0 right-0 bg-primary/10 text-center py-1 text-sm">
          Loading more messages...
        </div>
      )}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
      >
        <div className="min-h-full p-4">
          <div className="w-full max-w-4xl mx-auto space-y-2">
            {messages.map((message) => (
              <ChatMessageComponent key={message.id} message={message} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
};