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

export type ConnectionErrorType = "mic_permission" | "network" | "webrtc" | "token" | "unknown";

export interface ConnectionError extends Error {
  errorType: ConnectionErrorType;
  actionable?: string;
}

function createConnectionError(
  message: string,
  errorType: ConnectionErrorType,
  actionable?: string
): ConnectionError {
  const err = new Error(message) as ConnectionError;
  err.errorType = errorType;
  err.actionable = actionable;
  return err;
}

// Helper to wait for ICE gathering to complete (with timeout)
function waitForIceGatheringComplete(
  pc: RTCPeerConnection,
  timeoutMs = 5000
): Promise<void> {
  return new Promise((resolve, reject) => {
    if (pc.iceGatheringState === "complete") {
      resolve();
      return;
    }

    const timeout = setTimeout(() => {
      console.warn("[RTC] ICE gathering timed out, proceeding anyway");
      resolve(); // Don't reject - some candidates are better than none
    }, timeoutMs);

    const handler = () => {
      if (pc.iceGatheringState === "complete") {
        clearTimeout(timeout);
        pc.removeEventListener("icegatheringstatechange", handler);
        resolve();
      }
    };

    pc.addEventListener("icegatheringstatechange", handler);
  });
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
        let normalized = (rms - noiseFloor) / (0.2 - noiseFloor);
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

  async connect(options?: { instructions?: string; voice?: string; deviceId?: string }): Promise<void> {
    try {
      // Step 1: Get ephemeral token
      console.log("[RTC] Requesting ephemeral session token...");
      let EPHEMERAL_KEY: string;
      try {
        const { data, error } = await supabase.functions.invoke("openai-realtime-session", {
          body: {
            instructions: options?.instructions,
            voice: options?.voice,
          },
        });
        if (error) throw error;
        EPHEMERAL_KEY = data?.client_secret?.value;
        if (!EPHEMERAL_KEY) {
          throw new Error(data?.error || "Missing ephemeral key from session function");
        }
        console.log("[RTC] Ephemeral token received");
      } catch (err: any) {
        throw createConnectionError(
          `Failed to get session token: ${err?.message || "Unknown error"}`,
          "token",
          "Check that OPENAI_API_KEY is set in Supabase Edge Function secrets."
        );
      }

      // Step 2: Get microphone access
      console.log("[RTC] Requesting microphone access...");
      try {
        this.localStream = await navigator.mediaDevices.getUserMedia({ 
          audio: options?.deviceId 
            ? { 
                deviceId: { exact: options.deviceId },
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true,
              }
            : true 
        });
        console.log("[RTC] Microphone access granted");
      } catch (err: any) {
        const errorName = err?.name || "Unknown";
        let message = "Microphone access denied";
        let actionable = "Allow microphone access in your browser settings.";

        if (errorName === "NotAllowedError") {
          message = "Microphone permission blocked";
          actionable = "Click the lock icon in your browser's address bar and allow microphone access.";
        } else if (errorName === "NotFoundError") {
          message = "No microphone found";
          actionable = "Please connect a microphone and try again.";
        } else if (errorName === "NotReadableError") {
          message = "Microphone is in use";
          actionable = "Close other apps using the microphone and try again.";
        }

        throw createConnectionError(message, "mic_permission", actionable);
      }

      // Step 3: Setup WebRTC with explicit STUN servers
      console.log("[RTC] Setting up RTCPeerConnection...");
      this.pc = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
        ],
      });

      // WebRTC event logging
      this.pc.onicegatheringstatechange = () => {
        console.log("[RTC] ICE gathering state:", this.pc?.iceGatheringState);
      };
      this.pc.oniceconnectionstatechange = () => {
        console.log("[RTC] ICE connection state:", this.pc?.iceConnectionState);
        if (this.pc?.iceConnectionState === "failed") {
          console.error("[RTC] ICE connection failed - likely firewall/NAT issue");
        }
      };
      this.pc.onconnectionstatechange = () => {
        console.log("[RTC] Connection state:", this.pc?.connectionState);
      };
      this.pc.onicecandidateerror = (event) => {
        console.warn("[RTC] ICE candidate error:", event);
      };

      // Remote audio handling
      this.pc.ontrack = (e) => {
        console.log("[RTC] Remote track received");
        const remoteStream = e.streams[0];
        this.audioEl.srcObject = remoteStream;
        this.setupVAD(remoteStream);
      };

      // Add local microphone
      const [audioTrack] = this.localStream.getAudioTracks();
      if (audioTrack) this.pc.addTrack(audioTrack, this.localStream);

      // Data channel for events/messages
      this.dc = this.pc.createDataChannel("oai-events");
      this.dc.onopen = () => console.log("[RTC] Data channel open");
      this.dc.onclose = () => console.log("[RTC] Data channel closed");
      this.dc.onmessage = (e) => {
        try {
          const msg = JSON.parse(e.data);
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

      // Step 4: Create SDP offer and wait for ICE gathering
      console.log("[RTC] Creating SDP offer...");
      const offer = await this.pc.createOffer({ offerToReceiveAudio: true });
      await this.pc.setLocalDescription(offer);

      // Wait for ICE gathering to complete (or timeout)
      console.log("[RTC] Waiting for ICE gathering...");
      await waitForIceGatheringComplete(this.pc, 5000);
      console.log("[RTC] ICE gathering complete, gathered candidates:", this.pc.localDescription?.sdp?.match(/a=candidate/g)?.length || 0);

      // Step 5: Exchange SDP with OpenAI
      console.log("[RTC] Exchanging SDP with OpenAI Realtime...");
      let sdpResponse: Response;
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);

        sdpResponse = await fetch("https://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17", {
          method: "POST",
          body: this.pc.localDescription?.sdp,
          headers: {
            Authorization: `Bearer ${EPHEMERAL_KEY}`,
            "Content-Type": "application/sdp",
          },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
      } catch (err: any) {
        if (err.name === "AbortError") {
          throw createConnectionError(
            "Connection timed out",
            "network",
            "The connection to OpenAI took too long. Check your internet connection."
          );
        }
        // TypeError with "Failed to fetch" usually means network/CORS/firewall
        if (err.name === "TypeError" && (err.message?.includes("fetch") || err.message?.includes("network"))) {
          throw createConnectionError(
            "Network blocked",
            "network",
            "Your browser or network blocked the connection to OpenAI. Try disabling ad-blockers, VPN, or try a different network."
          );
        }
        throw createConnectionError(
          `Network error: ${err.message}`,
          "network",
          "Check your internet connection and try again."
        );
      }

      if (!sdpResponse.ok) {
        const errText = await sdpResponse.text();
        throw createConnectionError(
          `OpenAI SDP exchange failed: ${sdpResponse.status} ${errText}`,
          "network",
          "OpenAI rejected the connection. The API key may be invalid or the service may be temporarily unavailable."
        );
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
