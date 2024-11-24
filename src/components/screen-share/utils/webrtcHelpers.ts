import { getRTCConfiguration } from "./webrtcConfig";

export const setupPeerConnection = (
  isHost: boolean,
  onTrack: (stream: MediaStream) => void,
  onConnectionEstablished: () => void
) => {
  const peerConnection = new RTCPeerConnection(getRTCConfiguration());
  const remoteStream = new MediaStream();

  peerConnection.oniceconnectionstatechange = () => {
    console.log('ICE connection state:', peerConnection.iceConnectionState);
    if (peerConnection.iceConnectionState === 'connected' || 
        peerConnection.iceConnectionState === 'completed') {
      console.log('Connection established');
      onConnectionEstablished();
    }
  };

  peerConnection.ontrack = (event) => {
    console.log('Received remote track:', event.track.kind);
    if (!isHost) {
      remoteStream.addTrack(event.track);
      console.log('Added track to remote stream:', event.track.kind);
      onTrack(remoteStream);
    }
  };

  return { peerConnection, remoteStream };
};

export const addTracksToConnection = (
  peerConnection: RTCPeerConnection,
  stream: MediaStream
) => {
  if (peerConnection.signalingState === 'closed') {
    console.warn('Cannot add tracks: connection is closed');
    return;
  }

  stream.getTracks().forEach(track => {
    console.log('Adding track to connection:', track.kind);
    peerConnection.addTrack(track, stream);
  });
};

export const cleanupWebRTC = (
  peerConnection: RTCPeerConnection | null,
  remoteStream: MediaStream | null
) => {
  if (remoteStream) {
    remoteStream.getTracks().forEach(track => track.stop());
  }
  if (peerConnection) {
    peerConnection.close();
  }
};