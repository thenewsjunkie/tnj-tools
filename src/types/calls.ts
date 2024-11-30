export interface CallSession {
  id: string;
  caller_name: string;
  topic: string | null;
  status: "waiting" | "connected" | "ended";
  is_muted: boolean;
  started_at: string;
  ended_at: string | null;
  connection_quality?: string;
  created_at: string;
}