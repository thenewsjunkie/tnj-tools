export interface InterviewRequest {
  id: string;
  guest_email: string;
  email_script: string;
  status: 'pending' | 'sent' | 'replied' | 'scheduled';
  created_at: string;
  scheduled_date?: string;
  conversation_history?: ConversationMessage[];
}

export interface ConversationMessage {
  id: string;
  request_id: string;
  sender: 'host' | 'guest';
  content: string;
  sent_at: string;
}