
interface ConversationDisplayProps {
  conversation: {
    question_text?: string;
    answer_text?: string;
  } | null;
  autoFade?: boolean;
}

export const ConversationDisplay = ({ conversation, autoFade = true }: ConversationDisplayProps) => {
  if (!conversation) return null

  return (
    <div className="mt-4 p-4 bg-secondary/10 rounded-lg dark:text-white">
      <div className="mb-2">
        <span className="font-semibold">Q:</span> {conversation.question_text}
      </div>
      <div>
        <span className="font-semibold">A:</span> {conversation.answer_text}
      </div>
    </div>
  )
}
