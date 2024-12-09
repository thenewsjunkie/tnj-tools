import { Room, RemoteParticipant, RemoteTrack } from 'livekit-client';
import { WebRTCState, TrackCallback } from './types';
import { ConnectionManager } from './connection';
import { MediaManager } from './media';

class WebRTCService {
  private state: WebRTCState = {
    room: null,
    localParticipant: null,
    remoteParticipants: new Map(),
    isConnecting: false,
    activeCallId: null
  };

  private onTrackCallback: TrackCallback | null = null;
  private connectionManager = new ConnectionManager();
  private mediaManager = new MediaManager();

  get localStream(): MediaStream | null {
    if (!this.state.localParticipant) return null;
    const tracks = this.state.localParticipant.trackPublications;
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
    if (this.state.activeCallId === callId && this.state.room?.state === 'connected') {
      console.log('Already connected to this call:', callId);
      return this.localStream;
    }

    // If we're in the process of connecting, don't start another connection
    if (this.state.isConnecting) {
      console.log('Connection already in progress, skipping');
      return null;
    }

    this.state.isConnecting = true;

    try {
      // Only cleanup if we're connecting to a different call
      if (this.state.activeCallId !== callId) {
        await this.cleanup();
      }

      const room = await this.connectionManager.connect(callId);
      this.state.room = room;
      this.state.localParticipant = room.localParticipant;
      this.state.activeCallId = callId;

      // Set up remote participant handling
      room.on('participantConnected', this.handleParticipantConnected.bind(this));
      room.on('participantDisconnected', this.handleParticipantDisconnected.bind(this));

      const stream = await this.mediaManager.enableLocalMedia(room.localParticipant);
      return stream;
    } catch (error) {
      console.error('Error initializing call:', error);
      await this.cleanup();
      throw error;
    } finally {
      this.state.isConnecting = false;
    }
  }

  private handleParticipantConnected(participant: RemoteParticipant) {
    console.log('Remote participant connected:', participant.identity);
    this.state.remoteParticipants.set(participant.sid, participant);
    this.handleParticipantTracks(participant);
  }

  private handleParticipantDisconnected(participant: RemoteParticipant) {
    console.log('Remote participant disconnected:', participant.identity);
    this.state.remoteParticipants.delete(participant.sid);
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

  onTrack(callback: TrackCallback) {
    this.onTrackCallback = callback;
  }

  async cleanup() {
    if (this.state.room) {
      console.log('Cleaning up WebRTC connection');
      await this.state.room.disconnect();
    }
    
    this.state = {
      room: null,
      localParticipant: null,
      remoteParticipants: new Map(),
      isConnecting: false,
      activeCallId: null
    };
    
    this.onTrackCallback = null;
  }
}

export const webRTCService = new WebRTCService();