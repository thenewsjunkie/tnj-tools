
interface ConversationDisplayProps {
  conversation: {
    question_text?: string;
    answer_text?: string;
  } | null;
  className?: string;
}

export const ConversationDisplay = ({ conversation, className = "" }: ConversationDisplayProps) => {
  if (!conversation) return null;

  return (
    <div className={`mt-4 p-4 bg-secondary/10 rounded-lg dark:text-white ${className}`}>
      {conversation.question_text && (
        <div className="mb-2">
          <span className="font-semibold">Q:</span> {conversation.question_text}
        </div>
      )}
      {conversation.answer_text && (
        <div>
          <span className="font-semibold">A:</span> {conversation.answer_text}
        </div>
      )}
    </div>
  );
};
