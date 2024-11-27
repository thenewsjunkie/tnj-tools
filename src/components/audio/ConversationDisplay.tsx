interface ConversationDisplayProps {
  conversation: {
    question_text?: string;
    answer_text?: string;
  } | null
}

export const ConversationDisplay = ({ conversation }: ConversationDisplayProps) => {
  if (!conversation) return null

  return (
    <div className="mt-4 p-4 bg-secondary/10 rounded-lg">
      <div className="mb-2">
        <span className="font-semibold">Q:</span> {conversation.question_text}
      </div>
      <div>
        <span className="font-semibold">A:</span> {conversation.answer_text}
      </div>
    </div>
  )
}