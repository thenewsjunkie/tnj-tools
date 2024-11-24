export interface SessionData {
  id: string;
  host_device_id: string | null;
  viewer_device_id: string | null;
  host_connected: boolean;
  viewer_connected: boolean;
  is_active: boolean;
  share_code: string;
  expires_at: string;
}

export interface SessionValidatorProps {
  code: string;
  onValidSession: (data: SessionData, isHost: boolean) => void;
}