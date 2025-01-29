interface ConversationDisplayProps {
  conversation: {
    question_text?: string;
    answer_text?: string;
  } | null;
  interimTranscript?: string;
}

export const ConversationDisplay = ({ conversation, interimTranscript }: ConversationDisplayProps) => {
  if (!conversation && !interimTranscript) return null

  return (
    <div className="space-y-4 text-sm">
      {(conversation?.question_text || interimTranscript) && (
        <div className="bg-muted/50 p-3 rounded-lg">
          <p className="font-medium mb-1">You:</p>
          <p>{conversation?.question_text || interimTranscript}</p>
        </div>
      )}
      
      {conversation?.answer_text && (
        <div className="bg-primary/10 p-3 rounded-lg">
          <p className="font-medium mb-1">TNJ:</p>
          <p>{conversation.answer_text}</p>
        </div>
      )}
    </div>
  )
}