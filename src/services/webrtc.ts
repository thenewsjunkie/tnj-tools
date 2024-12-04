import { Room, RoomEvent, RemoteParticipant, LocalParticipant, RemoteTrack, RoomOptions, connect } from 'livekit-client';
import { supabase } from "@/integrations/supabase/client";

class WebRTCService {
  private room: Room | null = null;
  private _localParticipant: LocalParticipant | null = null;
  private _remoteParticipants: Map<string, RemoteParticipant> = new Map();
  private onTrackCallback: ((stream: MediaStream) => void) | null = null;

  get localStream(): MediaStream | null {
    if (!this._localParticipant) return null;
    const audioTrack = this._localParticipant.getTrackPublications()[0]?.track;
    const videoTrack = this._localParticipant.getTrackPublications()[1]?.track;
    if (!audioTrack || !videoTrack) return null;
    
    const stream = new MediaStream();
    stream.addTrack(audioTrack.mediaStreamTrack);
    stream.addTrack(videoTrack.mediaStreamTrack);
    return stream;
  }

  async initializeCall(callId: string) {
    try {
      // Get LiveKit connection token from Supabase Edge Function
      const { data: { token }, error } = await supabase.functions.invoke('get-livekit-token', {
        body: { callId }
      });

      if (error) throw error;

      const roomOptions: RoomOptions = {
        adaptiveStream: true,
        dynacast: true,
        publishDefaults: {
          simulcast: true,
        },
      };

      this.room = new Room(roomOptions);

      // Connect to LiveKit room
      await this.room.connect('https://your-livekit-server.com', token);
      
      // Start capturing local media
      await this.room.localParticipant.enableCameraAndMicrophone();
      this._localParticipant = this.room.localParticipant;

      // Set up remote participant handling
      this.room.on(RoomEvent.ParticipantConnected, (participant: RemoteParticipant) => {
        this._remoteParticipants.set(participant.sid, participant);
        this.handleParticipantTracks(participant);
      });

      return this.localStream;
    } catch (error) {
      console.error('Error initializing call:', error);
      throw error;
    }
  }

  private handleParticipantTracks(participant: RemoteParticipant) {
    const stream = new MediaStream();
    
    participant.on('trackSubscribed', (track: RemoteTrack) => {
      stream.addTrack(track.mediaStreamTrack);
      if (this.onTrackCallback) {
        this.onTrackCallback(stream);
      }
    });
  }

  onTrack(callback: (stream: MediaStream) => void) {
    this.onTrackCallback = callback;
  }

  async cleanup() {
    if (this.room) {
      await this.room.disconnect();
      this.room = null;
    }
    this._localParticipant = null;
    this._remoteParticipants.clear();
    this.onTrackCallback = null;
  }
}

export const webRTCService = new WebRTCService();