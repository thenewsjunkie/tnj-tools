import { RemoteParticipant, RemoteTrack } from 'livekit-client';
import { TrackCallback } from './types';

export class ParticipantManager {
  handleParticipantTracks(participant: RemoteParticipant, onTrackCallback: TrackCallback | null) {
    const stream = new MediaStream();
    
    participant.on('trackSubscribed', (track: RemoteTrack) => {
      console.log('Track subscribed:', track.kind);
      stream.addTrack(track.mediaStreamTrack);
      if (onTrackCallback) {
        onTrackCallback(stream);
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
}