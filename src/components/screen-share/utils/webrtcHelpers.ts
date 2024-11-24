import { getRTCConfiguration } from "./webrtcConfig";

export const setupPeerConnection = (
  isHost: boolean,
  onTrack: (stream: MediaStream) => void,
  onConnectionEstablished: () => void
) => {
  console.log('[webrtcHelpers] Setting up peer connection');
  const peerConnection = new RTCPeerConnection(getRTCConfiguration());
  const remoteStream = new MediaStream();

  peerConnection.oniceconnectionstatechange = () => {
    console.log('[webrtcHelpers] ICE connection state:', peerConnection.iceConnectionState);
    if (peerConnection.iceConnectionState === 'connected' || 
        peerConnection.iceConnectionState === 'completed') {
      console.log('[webrtcHelpers] Connection established');
      onConnectionEstablished();
    }
  };

  peerConnection.ontrack = (event) => {
    console.log('[webrtcHelpers] Received track:', {
      kind: event.track.kind,
      enabled: event.track.enabled,
      muted: event.track.muted,
      streams: event.streams.length
    });
    
    if (!isHost) {
      event.streams[0].getTracks().forEach(track => {
        console.log('[webrtcHelpers] Adding track to remote stream:', {
          kind: track.kind,
          enabled: track.enabled,
          muted: track.muted
        });
        remoteStream.addTrack(track);
      });
      console.log('[webrtcHelpers] Calling onTrack with remote stream');
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
    console.warn('[webrtcHelpers] Cannot add tracks: connection is closed');
    return;
  }

  const senders = peerConnection.getSenders();
  console.log('[webrtcHelpers] Current senders:', senders.length);

  stream.getTracks().forEach(track => {
    console.log('[webrtcHelpers] Adding track to connection:', {
      kind: track.kind,
      enabled: track.enabled,
      muted: track.muted
    });
    peerConnection.addTrack(track, stream);
  });
};

export const cleanupWebRTC = (
  peerConnection: RTCPeerConnection | null,
  remoteStream: MediaStream | null
) => {
  console.log('[webrtcHelpers] Cleaning up WebRTC');
  if (remoteStream) {
    console.log('[webrtcHelpers] Stopping remote stream tracks');
    remoteStream.getTracks().forEach(track => {
      console.log('[webrtcHelpers] Stopping track:', track.kind);
      track.stop();
    });
  }
  if (peerConnection) {
    console.log('[webrtcHelpers] Closing peer connection');
    peerConnection.close();
  }
};