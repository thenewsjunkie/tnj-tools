import { supabase } from "@/integrations/supabase/client";

export interface RealtimeMessage {
  type: string;
  timestamp: number;
  content?: string;
  delta?: string;
  event_id?: string;
  response_id?: string;
  item_id?: string;
}

export class RealtimeChat {
  private pc: RTCPeerConnection | null = null;
  private dc: RTCDataChannel | null = null;
  private audioEl: HTMLAudioElement;
  private localStream: MediaStream | null = null;
  private isConnected = false;

  constructor(
    private onMessage: (message: RealtimeMessage) => void,
    private onConnectionChange: (connected: boolean) => void,
    private onSpeakingChange: (speaking: boolean) => void
  ) {
    this.audioEl = document.createElement("audio");
    this.audioEl.autoplay = true;
    this.audioEl.style.display = "none";
    document.body.appendChild(this.audioEl);

    // Heuristic speaking indicator based on audio element events
    this.audioEl.addEventListener("playing", () => this.onSpeakingChange(true));
    this.audioEl.addEventListener("pause", () => this.onSpeakingChange(false));
    this.audioEl.addEventListener("ended", () => this.onSpeakingChange(false));
  }

  async connect(options?: { instructions?: string; voice?: string }): Promise<void> {
    try {
      console.log("[RTC] Requesting ephemeral session token...");
      const { data, error } = await supabase.functions.invoke("openai-realtime-session", {
        body: {
          instructions: options?.instructions,
          voice: options?.voice,
        },
      });
      if (error) throw error;

      const EPHEMERAL_KEY = data?.client_secret?.value;
      if (!EPHEMERAL_KEY) throw new Error("Missing ephemeral key from session function");

      console.log("[RTC] Setting up RTCPeerConnection...");
      this.pc = new RTCPeerConnection();

      // Remote audio handling
      this.pc.ontrack = (e) => {
        console.log("[RTC] Remote track received");
        this.audioEl.srcObject = e.streams[0];
      };

      // Add local microphone
      this.localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const [audioTrack] = this.localStream.getAudioTracks();
      if (audioTrack) this.pc.addTrack(audioTrack, this.localStream);

      // Data channel for events/messages
      this.dc = this.pc.createDataChannel("oai-events");
      this.dc.onopen = () => console.log("[RTC] Data channel open");
      this.dc.onclose = () => console.log("[RTC] Data channel closed");
      this.dc.onmessage = (e) => {
        try {
          const msg = JSON.parse(e.data);
          // console.debug("[RTC] Event:", msg?.type, msg);
          this.onMessage({
            type: msg?.type ?? "event",
            timestamp: Date.now(),
            content: msg?.content,
            delta: msg?.delta,
            event_id: msg?.event_id,
            response_id: msg?.response_id,
            item_id: msg?.item_id,
          });

          // Optional speaking toggles if events exist
          if (msg?.type === "response.audio.delta") this.onSpeakingChange(true);
          if (msg?.type === "response.audio.done") this.onSpeakingChange(false);
        } catch (err) {
          console.warn("[RTC] Non-JSON message", e.data);
        }
      };

      // Create SDP offer
      const offer = await this.pc.createOffer({ offerToReceiveAudio: true });
      await this.pc.setLocalDescription(offer);

      console.log("[RTC] Exchanging SDP with OpenAI Realtime...");
      const sdpResponse = await fetch("https://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17", {
        method: "POST",
        body: offer.sdp!,
        headers: {
          Authorization: `Bearer ${EPHEMERAL_KEY}`,
          "Content-Type": "application/sdp",
        },
      });

      if (!sdpResponse.ok) {
        const errText = await sdpResponse.text();
        throw new Error(`OpenAI SDP exchange failed: ${errText}`);
      }

      const answer = { type: "answer" as RTCSdpType, sdp: await sdpResponse.text() };
      await this.pc.setRemoteDescription(answer);

      this.isConnected = true;
      this.onConnectionChange(true);
      console.log("[RTC] WebRTC connection established");
    } catch (error) {
      console.error("[RTC] connect error:", error);
      this.disconnect();
      throw error;
    }
  }

  sendTextMessage(text: string) {
    if (!this.dc || this.dc.readyState !== "open") {
      throw new Error("Data channel not ready");
    }

    const createMsg = {
      type: "conversation.item.create",
      item: {
        type: "message",
        role: "user",
        content: [
          {
            type: "input_text",
            text,
          },
        ],
      },
    };

    this.dc.send(JSON.stringify(createMsg));
    this.dc.send(JSON.stringify({ type: "response.create" }));
  }

  disconnect() {
    try {
      this.onSpeakingChange(false);
      if (this.dc) {
        try { this.dc.close(); } catch {}
        this.dc = null;
      }
      if (this.pc) {
        try { this.pc.close(); } catch {}
        this.pc = null;
      }
      if (this.localStream) {
        this.localStream.getTracks().forEach((t) => t.stop());
        this.localStream = null;
      }
      if (this.audioEl) {
        try { this.audioEl.pause(); } catch {}
        this.audioEl.srcObject = null;
      }
    } finally {
      if (this.isConnected) this.onConnectionChange(false);
      this.isConnected = false;
    }
  }
}
