import { supabase } from "@/integrations/supabase/client";
import { AudioRecorder, encodeAudioForAPI } from "./AudioRecorder";

export interface RealtimeMessage {
  type: string;
  timestamp: number;
  content?: string;
  audio?: string;
  delta?: string;
  event_id?: string;
  response_id?: string;
  item_id?: string;
}

class AudioQueue {
  private queue: Uint8Array[] = [];
  private isPlaying = false;
  private audioContext: AudioContext;

  constructor(audioContext: AudioContext) {
    this.audioContext = audioContext;
  }

  async addToQueue(audioData: Uint8Array) {
    this.queue.push(audioData);
    if (!this.isPlaying) {
      await this.playNext();
    }
  }

  private async playNext() {
    if (this.queue.length === 0) {
      this.isPlaying = false;
      return;
    }

    this.isPlaying = true;
    const audioData = this.queue.shift()!;

    try {
      const wavData = this.createWavFromPCM(audioData);
      const audioBuffer = await this.audioContext.decodeAudioData(wavData.buffer);
      
      const source = this.audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.audioContext.destination);
      
      source.onended = () => this.playNext();
      source.start(0);
    } catch (error) {
      console.error('Error playing audio:', error);
      this.playNext();
    }
  }

  private createWavFromPCM(pcmData: Uint8Array): Uint8Array {
    const int16Data = new Int16Array(pcmData.length / 2);
    for (let i = 0; i < pcmData.length; i += 2) {
      int16Data[i / 2] = (pcmData[i + 1] << 8) | pcmData[i];
    }
    
    const wavHeader = new ArrayBuffer(44);
    const view = new DataView(wavHeader);
    
    const writeString = (view: DataView, offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    const sampleRate = 24000;
    const numChannels = 1;
    const bitsPerSample = 16;
    const blockAlign = (numChannels * bitsPerSample) / 8;
    const byteRate = sampleRate * blockAlign;

    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + int16Data.byteLength, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitsPerSample, true);
    writeString(view, 36, 'data');
    view.setUint32(40, int16Data.byteLength, true);

    const wavArray = new Uint8Array(wavHeader.byteLength + int16Data.byteLength);
    wavArray.set(new Uint8Array(wavHeader), 0);
    wavArray.set(new Uint8Array(int16Data.buffer), wavHeader.byteLength);
    
    return wavArray;
  }
}

export class RealtimeChat {
  private ws: WebSocket | null = null;
  private recorder: AudioRecorder | null = null;
  private audioQueue: AudioQueue | null = null;
  private audioContext: AudioContext | null = null;
  private isConnected = false;
  private sessionEstablished = false;

  constructor(
    private onMessage: (message: RealtimeMessage) => void,
    private onConnectionChange: (connected: boolean) => void,
    private onSpeakingChange: (speaking: boolean) => void
  ) {}

  async connect(): Promise<void> {
    try {
      console.log('Starting realtime chat connection...');
      
      this.audioContext = new AudioContext();
      this.audioQueue = new AudioQueue(this.audioContext);
      
      const { data: tokenData, error } = await supabase.functions.invoke('openai-realtime-session');
      
      if (error || !tokenData?.client_secret?.value) {
        throw new Error('Failed to get ephemeral token');
      }

      const ephemeralKey = tokenData.client_secret.value;
      console.log('Got ephemeral token, connecting to OpenAI...');

      this.ws = new WebSocket('wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17');
      
      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.isConnected = true;
        this.onConnectionChange(true);
        
        // Send authorization
        this.send({
          type: 'session.update',
          session: {
            modalities: ['text', 'audio'],
            instructions: 'You are a helpful AI assistant. Be conversational and engaging.',
            voice: 'alloy',
            input_audio_format: 'pcm16',
            output_audio_format: 'pcm16',
            input_audio_transcription: {
              model: 'whisper-1'
            },
            turn_detection: {
              type: 'server_vad',
              threshold: 0.5,
              prefix_padding_ms: 300,
              silence_duration_ms: 1000
            },
            temperature: 0.8,
            max_response_output_tokens: 'inf'
          }
        });
      };

      this.ws.onmessage = async (event) => {
        const message = JSON.parse(event.data);
        console.log('Received message:', message.type, message);
        
        this.onMessage({
          type: message.type,
          timestamp: Date.now(),
          content: message.content,
          delta: message.delta,
          event_id: message.event_id,
          response_id: message.response_id,
          item_id: message.item_id
        });

        if (message.type === 'session.created') {
          console.log('Session created, starting audio recording...');
          this.sessionEstablished = true;
          await this.startAudioRecording();
        } else if (message.type === 'response.audio.delta') {
          if (message.delta) {
            const binaryString = atob(message.delta);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
              bytes[i] = binaryString.charCodeAt(i);
            }
            await this.audioQueue?.addToQueue(bytes);
            this.onSpeakingChange(true);
          }
        } else if (message.type === 'response.audio.done') {
          this.onSpeakingChange(false);
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      this.ws.onclose = () => {
        console.log('WebSocket closed');
        this.isConnected = false;
        this.sessionEstablished = false;
        this.onConnectionChange(false);
        this.cleanup();
      };

    } catch (error) {
      console.error('Error connecting to realtime chat:', error);
      throw error;
    }
  }

  private async startAudioRecording() {
    try {
      this.recorder = new AudioRecorder((audioData) => {
        if (this.isConnected && this.sessionEstablished) {
          const encodedAudio = encodeAudioForAPI(audioData);
          this.send({
            type: 'input_audio_buffer.append',
            audio: encodedAudio
          });
        }
      });
      
      await this.recorder.start();
      console.log('Audio recording started');
    } catch (error) {
      console.error('Error starting audio recording:', error);
      throw error;
    }
  }

  sendTextMessage(text: string) {
    if (!this.isConnected) {
      throw new Error('Not connected');
    }

    this.send({
      type: 'conversation.item.create',
      item: {
        type: 'message',
        role: 'user',
        content: [
          {
            type: 'input_text',
            text
          }
        ]
      }
    });

    this.send({ type: 'response.create' });
  }

  private send(message: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  disconnect() {
    console.log('Disconnecting realtime chat...');
    this.cleanup();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  private cleanup() {
    this.recorder?.stop();
    this.recorder = null;
    this.audioContext?.close();
    this.audioContext = null;
    this.audioQueue = null;
  }
}