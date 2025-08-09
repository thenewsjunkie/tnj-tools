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
  private isMuted = false;
  private speakingHoldTimer: number | null = null;
  private readonly SPEAKING_HOLD_MS = 2000;
  // WebAudio VAD fields for remote audio
  private remoteAudioContext: AudioContext | null = null;
  private remoteAnalyser: AnalyserNode | null = null;
  private remoteSource: MediaStreamAudioSourceNode | null = null;
  private vadRafId: number | null = null;
  private readonly VAD_THRESHOLD = 0.015;

  constructor(
    private onMessage: (message: RealtimeMessage) => void,
    private onConnectionChange: (connected: boolean) => void,
    private onSpeakingChange: (speaking: boolean) => void,
    private onRemoteLevel?: (level: number) => void
  ) {
    this.audioEl = document.createElement("audio");
    this.audioEl.autoplay = true;
    this.audioEl.style.display = "none";
    document.body.appendChild(this.audioEl);

    // Heuristic speaking indicator based on audio element events with hold
    this.audioEl.addEventListener("playing", () => this.resetSpeakingHold());
    this.audioEl.addEventListener("pause", () => this.resetSpeakingHold());
    this.audioEl.addEventListener("ended", () => this.resetSpeakingHold());
  }

  private clearSpeakingHold() {
    if (this.speakingHoldTimer !== null) {
      clearTimeout(this.speakingHoldTimer);
      this.speakingHoldTimer = null;
    }
  }

  private resetSpeakingHold() {
    this.clearSpeakingHold();
    this.onSpeakingChange(true);
    this.speakingHoldTimer = window.setTimeout(() => {
      this.onSpeakingChange(false);
      this.speakingHoldTimer = null;
    }, this.SPEAKING_HOLD_MS);
  }

  // Start WebAudio VAD on the remote audio stream
  private async setupVAD(stream: MediaStream) {
    try {
      this.stopVAD();

      // Some browsers require a user gesture; resume if suspended
      this.remoteAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      await this.remoteAudioContext.resume().catch(() => {});

      this.remoteSource = this.remoteAudioContext.createMediaStreamSource(stream);
      this.remoteAnalyser = this.remoteAudioContext.createAnalyser();
      this.remoteAnalyser.fftSize = 1024;
      this.remoteAnalyser.smoothingTimeConstant = 0.3;

      this.remoteSource.connect(this.remoteAnalyser);

      const buffer = new Float32Array(this.remoteAnalyser.fftSize);
      const loop = () => {
        if (!this.remoteAnalyser) return;
        this.remoteAnalyser.getFloatTimeDomainData(buffer);

        // RMS energy
        let sum = 0;
        for (let i = 0; i < buffer.length; i++) {
          const v = buffer[i];
          sum += v * v;
        }
        const rms = Math.sqrt(sum / buffer.length);

        // Map to 0..1 range using VAD threshold as noise floor
        const noiseFloor = this.VAD_THRESHOLD;
        let normalized = (rms - noiseFloor) / (0.3 - noiseFloor);
        if (!isFinite(normalized)) normalized = 0;
        normalized = Math.max(0, Math.min(1, normalized));

        // Emit remote audio level for UI visualizers
        try { this.onRemoteLevel?.(normalized); } catch {}

        if (rms > this.VAD_THRESHOLD) {
          this.resetSpeakingHold();
        }

        this.vadRafId = requestAnimationFrame(loop);
      };

      this.vadRafId = requestAnimationFrame(loop);
      console.log("[RTC] VAD started");
    } catch (err) {
      console.warn("[RTC] VAD setup failed", err);
    }
  }

  private stopVAD() {
    if (this.vadRafId !== null) {
      cancelAnimationFrame(this.vadRafId);
      this.vadRafId = null;
    }
    try {
      if (this.remoteSource) {
        this.remoteSource.disconnect();
        this.remoteSource = null;
      }
      if (this.remoteAnalyser) {
        this.remoteAnalyser.disconnect();
        this.remoteAnalyser = null;
      }
      if (this.remoteAudioContext) {
        this.remoteAudioContext.close().catch(() => {});
        this.remoteAudioContext = null;
      }
    } catch {}
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
        const remoteStream = e.streams[0];
        this.audioEl.srcObject = remoteStream;
        this.setupVAD(remoteStream);
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

          // Speaking indicator: extend hold on audio chunks and when done
          if (msg?.type === "response.audio.delta" || msg?.type === "response.audio.done") this.resetSpeakingHold();
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

  setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach((track) => {
        track.enabled = !muted;
      });
    }
  }

  disconnect() {
    try {
      this.clearSpeakingHold();
      this.stopVAD();
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
