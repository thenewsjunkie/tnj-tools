import { Room, RoomEvent, RemoteParticipant, LocalParticipant, RemoteTrack, RoomOptions, ConnectionState } from 'livekit-client';
import { supabase } from "@/integrations/supabase/client";

class WebRTCService {
  private room: Room | null = null;
  private _localParticipant: LocalParticipant | null = null;
  private _remoteParticipants: Map<string, RemoteParticipant> = new Map();
  private onTrackCallback: ((stream: MediaStream) => void) | null = null;
  private isConnecting: boolean = false;
  private activeCallId: string | null = null;
  private connectionTimeout: NodeJS.Timeout | null = null;

  get localStream(): MediaStream | null {
    if (!this._localParticipant) return null;
    const tracks = this._localParticipant.trackPublications;
    if (tracks.size === 0) return null;
    
    const stream = new MediaStream();
    tracks.forEach(publication => {
      if (publication.track) {
        stream.addTrack(publication.track.mediaStreamTrack);
      }
    });
    return stream;
  }

  async initializeCall(callId: string): Promise<MediaStream | null> {
    // If we're already connected to this call, return the existing stream
    if (this.activeCallId === callId && this.room?.state === 'connected') {
      console.log('Already connected to this call:', callId);
      return this.localStream;
    }

    // If we're in the process of connecting, don't start another connection
    if (this.isConnecting) {
      console.log('Connection already in progress, skipping');
      return null;
    }

    this.isConnecting = true;

    try {
      console.log('Initializing call with ID:', callId);
      
      // Get LiveKit connection token from Supabase Edge Function
      const { data: { token }, error } = await supabase.functions.invoke('get-livekit-token', {
        body: { callId, role: 'publisher' }
      });

      if (error) {
        console.error('Error getting LiveKit token:', error);
        throw error;
      }

      console.log('Got LiveKit token, connecting to room...');

      // Only cleanup if we're connecting to a different call
      if (this.activeCallId !== callId) {
        await this.cleanup();
      }

      const roomOptions: RoomOptions = {
        adaptiveStream: true,
        dynacast: true,
        publishDefaults: {
          simulcast: true,
        },
      };

      this.room = new Room(roomOptions);
      
      // Set up connection state monitoring
      this.room.on(RoomEvent.ConnectionStateChanged, (state: ConnectionState) => {
        console.log('Connection state changed:', state);
        
        // Clear any existing timeout
        if (this.connectionTimeout) {
          clearTimeout(this.connectionTimeout);
          this.connectionTimeout = null;
        }

        // Set new timeout for connecting state
        if (state === 'connecting') {
          this.connectionTimeout = setTimeout(() => {
            console.log('Connection timeout, cleaning up');
            this.cleanup();
          }, 10000); // 10 second timeout
        }
      });

      // Connect to LiveKit room
      await this.room.connect('wss://tnj-tools-2azakdqh.livekit.cloud', token);
      
      // Wait for the connection to be fully established
      await new Promise<void>((resolve, reject) => {
        if (!this.room) {
          reject(new Error('Room not initialized'));
          return;
        }

        if (this.room.state === 'connected') {
          resolve();
          return;
        }

        const timeout = setTimeout(() => {
          reject(new Error('Connection timeout'));
        }, 10000);

        this.room.once(RoomEvent.Connected, () => {
          clearTimeout(timeout);
          resolve();
        });

        this.room.once(RoomEvent.Disconnected, () => {
          clearTimeout(timeout);
          reject(new Error('Connection failed'));
        });
      });

      console.log('Connected to LiveKit room');
      
      // Start capturing local media
      if (!this.room.localParticipant) {
        throw new Error('Local participant not available');
      }

      await this.room.localParticipant.enableCameraAndMicrophone();
      console.log('Local media enabled');
      
      this._localParticipant = this.room.localParticipant;
      this.activeCallId = callId;

      // Set up remote participant handling
      this.room.on(RoomEvent.ParticipantConnected, (participant: RemoteParticipant) => {
        console.log('Remote participant connected:', participant.identity);
        this._remoteParticipants.set(participant.sid, participant);
        this.handleParticipantTracks(participant);
      });

      // Add error handling for room events
      this.room.on(RoomEvent.Disconnected, () => {
        console.log('Disconnected from room');
        this.activeCallId = null;
      });

      return this.localStream;
    } catch (error) {
      console.error('Error initializing call:', error);
      await this.cleanup();
      throw error;
    } finally {
      this.isConnecting = false;
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
    this.isConnecting = false;
    this.activeCallId = null;
    
    if (this.connectionTimeout) {
      clearTimeout(this.connectionTimeout);
      this.connectionTimeout = null;
    }
  }
}

export const webRTCService = new WebRTCService();