import { supabase } from "@/integrations/supabase/client";

class WebRTCService {
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private channel: any = null;
  private callId: string | null = null;

  async initializeCall(callId: string) {
    this.callId = callId;
    this.peerConnection = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });

    // Get local stream
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      // Add tracks to peer connection
      this.localStream.getTracks().forEach(track => {
        if (this.localStream && this.peerConnection) {
          this.peerConnection.addTrack(track, this.localStream);
        }
      });

      // Set up Supabase channel for signaling
      this.channel = supabase.channel(`call-${callId}`);
      
      // Handle ICE candidates
      this.peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          this.channel.send({
            type: 'broadcast',
            event: 'ice-candidate',
            payload: event.candidate
          });
        }
      };

      // Subscribe to channel events
      this.channel
        .on('broadcast', { event: 'ice-candidate' }, ({ payload }) => {
          if (this.peerConnection) {
            this.peerConnection.addIceCandidate(new RTCIceCandidate(payload));
          }
        })
        .on('broadcast', { event: 'offer' }, async ({ payload }) => {
          if (this.peerConnection) {
            await this.peerConnection.setRemoteDescription(new RTCSessionDescription(payload));
            const answer = await this.peerConnection.createAnswer();
            await this.peerConnection.setLocalDescription(answer);
            this.channel.send({
              type: 'broadcast',
              event: 'answer',
              payload: answer
            });
          }
        })
        .on('broadcast', { event: 'answer' }, async ({ payload }) => {
          if (this.peerConnection) {
            await this.peerConnection.setRemoteDescription(new RTCSessionDescription(payload));
          }
        })
        .subscribe();
    } catch (error) {
      console.error('Error accessing media devices:', error);
      throw error;
    }

    return this.localStream;
  }

  async createOffer() {
    if (!this.peerConnection) return;

    try {
      const offer = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(offer);
      
      this.channel.send({
        type: 'broadcast',
        event: 'offer',
        payload: offer
      });
    } catch (error) {
      console.error('Error creating offer:', error);
      throw error;
    }
  }

  onTrack(callback: (stream: MediaStream) => void) {
    if (!this.peerConnection) return;

    this.peerConnection.ontrack = (event) => {
      callback(event.streams[0]);
    };
  }

  async cleanup() {
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }

    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    if (this.channel) {
      await supabase.removeChannel(this.channel);
      this.channel = null;
    }

    this.callId = null;
  }
}

export const webRTCService = new WebRTCService();