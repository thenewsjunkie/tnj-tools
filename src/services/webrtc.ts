import { supabase } from "@/integrations/supabase/client";

class WebRTCService {
  private _peerConnection: RTCPeerConnection | null = null;
  private _localStream: MediaStream | null = null;
  private channel: any = null;
  private callId: string | null = null;

  // Add getter for localStream
  get localStream(): MediaStream | null {
    return this._localStream;
  }

  async initializeCall(callId: string) {
    this.callId = callId;
    this._peerConnection = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });

    try {
      this._localStream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      this._localStream.getTracks().forEach(track => {
        if (this._localStream && this._peerConnection) {
          this._peerConnection.addTrack(track, this._localStream);
        }
      });

      this.channel = supabase.channel(`call-${callId}`);
      
      this._peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          this.channel.send({
            type: 'broadcast',
            event: 'ice-candidate',
            payload: event.candidate
          });
        }
      };

      this.channel
        .on('broadcast', { event: 'ice-candidate' }, ({ payload }) => {
          if (this._peerConnection) {
            this._peerConnection.addIceCandidate(new RTCIceCandidate(payload));
          }
        })
        .on('broadcast', { event: 'offer' }, async ({ payload }) => {
          if (this._peerConnection) {
            await this._peerConnection.setRemoteDescription(new RTCSessionDescription(payload));
            const answer = await this._peerConnection.createAnswer();
            await this._peerConnection.setLocalDescription(answer);
            this.channel.send({
              type: 'broadcast',
              event: 'answer',
              payload: answer
            });
          }
        })
        .on('broadcast', { event: 'answer' }, async ({ payload }) => {
          if (this._peerConnection) {
            await this._peerConnection.setRemoteDescription(new RTCSessionDescription(payload));
          }
        })
        .subscribe();
    } catch (error) {
      console.error('Error accessing media devices:', error);
      throw error;
    }

    return this._localStream;
  }

  async createOffer() {
    if (!this._peerConnection) return;

    try {
      const offer = await this._peerConnection.createOffer();
      await this._peerConnection.setLocalDescription(offer);
      
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
    if (!this._peerConnection) return;

    this._peerConnection.ontrack = (event) => {
      callback(event.streams[0]);
    };
  }

  async cleanup() {
    if (this._localStream) {
      this._localStream.getTracks().forEach(track => track.stop());
      this._localStream = null;
    }

    if (this._peerConnection) {
      this._peerConnection.close();
      this._peerConnection = null;
    }

    if (this.channel) {
      await supabase.removeChannel(this.channel);
      this.channel = null;
    }

    this.callId = null;
  }
}

export const webRTCService = new WebRTCService();