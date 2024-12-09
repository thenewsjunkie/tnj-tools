import { Room, LocalParticipant, RemoteParticipant } from 'livekit-client';

export interface WebRTCState {
  room: Room | null;
  localParticipant: LocalParticipant | null;
  remoteParticipants: Map<string, RemoteParticipant>;
  isConnecting: boolean;
  activeCallId: string | null;
}

export type TrackCallback = (stream: MediaStream) => void;