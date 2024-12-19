import { useChat, MESSAGES_TO_LOAD_MORE } from "@/hooks/useChat";
import { ChatInput } from "@/components/chat/ChatInput";
import { ChatMessageList } from "@/components/chat/ChatMessageList";

const Chat = () => {
  const { messages, isLoading, hasMore, loadMessages } = useChat();

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