/**
 * Transcodes audio blobs to WAV format using Web Audio API
 * This ensures browser-compatible playback for formats like ALAC
 */

export interface TranscodeResult {
  blob: Blob;
  duration: number;
}

export interface TranscodeProgress {
  current: number;
  total: number;
  currentFile: string;
  failed: string[];
}

/**
 * Encode PCM audio data as a WAV file
 */
function encodeWav(audioBuffer: AudioBuffer): Blob {
  const numChannels = audioBuffer.numberOfChannels;
  const sampleRate = audioBuffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;
  
  // Interleave channels
  const length = audioBuffer.length * numChannels;
  const buffer = new ArrayBuffer(44 + length * 2);
  const view = new DataView(buffer);
  
  // Get channel data
  const channels: Float32Array[] = [];
  for (let i = 0; i < numChannels; i++) {
    channels.push(audioBuffer.getChannelData(i));
  }
  
  // Write WAV header
  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };
  
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + length * 2, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true); // fmt chunk size
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * (bitDepth / 8), true); // byte rate
  view.setUint16(32, numChannels * (bitDepth / 8), true); // block align
  view.setUint16(34, bitDepth, true);
  writeString(36, 'data');
  view.setUint32(40, length * 2, true);
  
  // Write interleaved PCM samples
  let offset = 44;
  for (let i = 0; i < audioBuffer.length; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      const sample = Math.max(-1, Math.min(1, channels[ch][i]));
      const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
      view.setInt16(offset, intSample, true);
      offset += 2;
    }
  }
  
  return new Blob([buffer], { type: 'audio/wav' });
}

/**
 * Transcode a single audio blob to WAV format
 */
export async function transcodeToWav(blob: Blob): Promise<TranscodeResult> {
  const arrayBuffer = await blob.arrayBuffer();
  const audioContext = new AudioContext();
  
  try {
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    const wavBlob = encodeWav(audioBuffer);
    return {
      blob: wavBlob,
      duration: audioBuffer.duration,
    };
  } finally {
    await audioContext.close();
  }
}

/**
 * Transcode multiple audio files with progress callback
 */
export async function transcodeMany(
  files: { title: string; blob: Blob }[],
  onProgress?: (progress: TranscodeProgress) => void
): Promise<{ results: Map<number, TranscodeResult>; failed: string[] }> {
  const results = new Map<number, TranscodeResult>();
  const failed: string[] = [];
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    
    onProgress?.({
      current: i + 1,
      total: files.length,
      currentFile: file.title,
      failed,
    });
    
    try {
      const result = await transcodeToWav(file.blob);
      results.set(i, result);
    } catch (error) {
      console.warn(`Failed to transcode "${file.title}":`, error);
      failed.push(file.title);
    }
  }
  
  return { results, failed };
}
