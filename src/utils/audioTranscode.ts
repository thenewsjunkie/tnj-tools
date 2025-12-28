/**
 * Transcodes audio blobs to MP3 format using FFmpeg.wasm
 * This handles formats like ALAC that browsers can't decode natively
 */
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

export interface TranscodeResult {
  blob: Blob;
  duration: number;
}

export interface TranscodeProgress {
  current: number;
  total: number;
  currentFile: string;
  failed: string[];
  status: 'loading' | 'transcoding';
}

let ffmpeg: FFmpeg | null = null;
let ffmpegLoaded = false;
let ffmpegLoading = false;

/**
 * Load FFmpeg.wasm (only once)
 */
async function loadFFmpeg(onProgress?: (progress: TranscodeProgress) => void): Promise<FFmpeg> {
  if (ffmpegLoaded && ffmpeg) {
    return ffmpeg;
  }
  
  if (ffmpegLoading) {
    // Wait for existing load to complete
    while (ffmpegLoading) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    if (ffmpegLoaded && ffmpeg) {
      return ffmpeg;
    }
  }
  
  ffmpegLoading = true;
  
  try {
    ffmpeg = new FFmpeg();
    
    // Use CDN for core files
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';
    
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    });
    
    ffmpegLoaded = true;
    return ffmpeg;
  } catch (error) {
    ffmpegLoading = false;
    throw error;
  } finally {
    ffmpegLoading = false;
  }
}

/**
 * Transcode a single audio blob to MP3 using FFmpeg.wasm
 */
async function transcodeWithFFmpeg(
  ffmpeg: FFmpeg,
  blob: Blob,
  inputExt: string
): Promise<TranscodeResult> {
  const inputName = `input.${inputExt}`;
  const outputName = 'output.mp3';
  
  // Write input file
  await ffmpeg.writeFile(inputName, await fetchFile(blob));
  
  // Convert to MP3 (high quality, 192kbps)
  await ffmpeg.exec([
    '-i', inputName,
    '-vn', // No video
    '-ar', '44100', // Sample rate
    '-ac', '2', // Stereo
    '-b:a', '192k', // Bitrate
    '-f', 'mp3',
    outputName
  ]);
  
  // Read output
  const data = await ffmpeg.readFile(outputName);
  // Safely copy to a new ArrayBuffer to avoid SharedArrayBuffer issues
  const uint8 = data as Uint8Array;
  const copy = new Uint8Array(uint8.length);
  copy.set(uint8);
  const outputBlob = new Blob([copy.buffer as ArrayBuffer], { type: 'audio/mpeg' });
  
  // Clean up
  await ffmpeg.deleteFile(inputName);
  await ffmpeg.deleteFile(outputName);
  
  // Get duration using Audio element
  const duration = await getAudioDuration(outputBlob);
  
  return { blob: outputBlob, duration };
}

/**
 * Get audio duration from a blob
 */
function getAudioDuration(blob: Blob): Promise<number> {
  return new Promise((resolve) => {
    const audio = new Audio();
    audio.src = URL.createObjectURL(blob);
    audio.addEventListener('loadedmetadata', () => {
      const duration = audio.duration;
      URL.revokeObjectURL(audio.src);
      resolve(duration);
    });
    audio.addEventListener('error', () => {
      URL.revokeObjectURL(audio.src);
      resolve(0);
    });
  });
}

/**
 * Get file extension from filename
 */
function getExtension(title: string): string {
  const match = title.match(/\.([a-zA-Z0-9]+)$/);
  return match ? match[1].toLowerCase() : 'm4a';
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
  
  // Load FFmpeg first
  onProgress?.({
    current: 0,
    total: files.length,
    currentFile: 'Loading FFmpeg...',
    failed: [],
    status: 'loading',
  });
  
  let ffmpegInstance: FFmpeg;
  try {
    ffmpegInstance = await loadFFmpeg(onProgress);
  } catch (error) {
    console.error('Failed to load FFmpeg:', error);
    // Return all as failed
    return { results, failed: files.map(f => f.title) };
  }
  
  // Process each file
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    
    onProgress?.({
      current: i + 1,
      total: files.length,
      currentFile: file.title,
      failed,
      status: 'transcoding',
    });
    
    try {
      const ext = getExtension(file.title);
      const result = await transcodeWithFFmpeg(ffmpegInstance, file.blob, ext);
      results.set(i, result);
    } catch (error) {
      console.warn(`Failed to transcode "${file.title}":`, error);
      failed.push(file.title);
    }
  }
  
  return { results, failed };
}
