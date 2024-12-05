import { Room, RoomEvent, RemoteParticipant, LocalParticipant, RemoteTrack, RoomOptions } from 'livekit-client';
import { supabase } from "@/integrations/supabase/client";

class WebRTCService {
  private room: Room | null = null;
  private _localParticipant: LocalParticipant | null = null;
  private _remoteParticipants: Map<string, RemoteParticipant> = new Map();
  private onTrackCallback: ((stream: MediaStream) => void) | null = null;

  get localStream(): MediaStream | null {
    if (!this._localParticipant) return null;
    const tracks = this._localParticipant.getTracks();
    if (tracks.length === 0) return null;
    
    const stream = new MediaStream();
    tracks.forEach(track => {
      if (track.track) {
        stream.addTrack(track.track);
      }
    });
    return stream;
  }

  async initializeCall(callId: string): Promise<MediaStream | null> {
    try {
      console.log('Initializing call with ID:', callId);
      
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
      await this.room.connect('wss://tnj-tools-2azakdqh.livekit.cloud', token);
      console.log('Connected to LiveKit room');
      
      // Start capturing local media
      await this.room.localParticipant.enableCameraAndMicrophone();
      console.log('Local media enabled');
      
      this._localParticipant = this.room.localParticipant;

      // Set up remote participant handling
      this.room.on(RoomEvent.ParticipantConnected, (participant: RemoteParticipant) => {
        console.log('Remote participant connected:', participant.identity);
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
      console.log('Track subscribed:', track.kind);
      stream.addTrack(track.mediaStreamTrack);
      if (this.onTrackCallback) {
        this.onTrackCallback(stream);
      }
    });

    participant.on('trackUnsubscribed', (track: RemoteTrack) => {
      console.log('Track unsubscribed:', track.kind);
      const tracks = stream.getTracks();
      tracks.forEach(t => {
        if (t.id === track.mediaStreamTrack.id) {
          stream.removeTrack(t);
        }
      });
    });
  }

  onTrack(callback: (stream: MediaStream) => void) {
    this.onTrackCallback = callback;
  }

  async cleanup() {
    if (this.room) {
      console.log('Cleaning up WebRTC connection');
      await this.room.disconnect();
      this.room = null;
    }
    this._localParticipant = null;
    this._remoteParticipants.clear();
    this.onTrackCallback = null;
  }
}

export const webRTCService = new WebRTCService();