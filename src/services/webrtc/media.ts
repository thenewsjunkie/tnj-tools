import { LocalParticipant } from 'livekit-client';

export class MediaManager {
  async enableLocalMedia(participant: LocalParticipant): Promise<MediaStream> {
    try {
      await participant.enableCameraAndMicrophone();
      
      const tracks = participant.trackPublications;
      const stream = new MediaStream();
      
      tracks.forEach(publication => {
        if (publication.track) {
          stream.addTrack(publication.track.mediaStreamTrack);
        }
      });
      
      return stream;
    } catch (error) {
      console.error('Error enabling local media:', error);
      throw error;
    }
  }
}