import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

let ffmpeg: FFmpeg | null = null;
let ffmpegLoaded = false;
let ffmpegLoading = false;
let loadPromise: Promise<FFmpeg> | null = null;

export interface VideoTranscodeOptions {
  startTime: number;
  endTime: number;
  borderSize: number;
  borderColor: string;
}

export interface VideoTranscodeProgress {
  status: "loading" | "processing" | "done";
  message: string;
  progress?: number;
}

// Load FFmpeg singleton (matches audioTranscode.ts pattern)
async function loadFFmpeg(onProgress?: (progress: VideoTranscodeProgress) => void): Promise<FFmpeg> {
  // Already loaded
  if (ffmpegLoaded && ffmpeg) {
    return ffmpeg;
  }
  
  // Loading in progress - wait for it
  if (ffmpegLoading && loadPromise) {
    return loadPromise;
  }
  
  ffmpegLoading = true;
  
  loadPromise = (async () => {
    try {
      onProgress?.({ status: "loading", message: "Loading video processor..." });
      
      console.log('[FFmpeg Video] Starting load...');
      const ff = new FFmpeg();
      
      // Use jsDelivr CDN with matching version (0.12.10) - same as audioTranscode.ts
      const baseURL = "https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/esm";
      
      console.log('[FFmpeg Video] Fetching core.js...');
      const coreURL = await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript");
      
      console.log('[FFmpeg Video] Fetching core.wasm...');
      const wasmURL = await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm");
      
      console.log('[FFmpeg Video] Fetching worker.js...');
      const workerURL = await toBlobURL(`${baseURL}/ffmpeg-core.worker.js`, "text/javascript");
      
      console.log('[FFmpeg Video] Loading FFmpeg with worker...');
      
      // Add timeout for load operation (30 seconds)
      const loadPromiseWithTimeout = Promise.race([
        ff.load({ coreURL, wasmURL, workerURL }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('FFMPEG_LOAD_TIMEOUT')), 30000)
        )
      ]);
      
      await loadPromiseWithTimeout;
      
      console.log('[FFmpeg Video] Loaded successfully');
      ffmpeg = ff;
      ffmpegLoaded = true;
      return ff;
    } catch (error) {
      console.error('[FFmpeg Video] Load failed:', error);
      ffmpegLoaded = false;
      ffmpegLoading = false;
      ffmpeg = null;
      loadPromise = null;
      throw error;
    }
  })();

  return loadPromise;
}

// Convert hex color to FFmpeg format
function hexToFFmpegColor(hex: string): string {
  // FFmpeg uses format: 0xRRGGBBAA or just color name
  const clean = hex.replace("#", "");
  return `0x${clean}FF`;
}

export async function transcodeVideoWithBorder(
  videoBlob: Blob,
  options: VideoTranscodeOptions,
  onProgress?: (progress: VideoTranscodeProgress) => void
): Promise<Blob> {
  const ff = await loadFFmpeg(onProgress);
  
  onProgress?.({ status: "processing", message: "Preparing video..." });
  
  // Determine input extension from blob type
  const mimeType = videoBlob.type;
  let inputExt = "mp4";
  if (mimeType.includes("webm")) inputExt = "webm";
  else if (mimeType.includes("quicktime") || mimeType.includes("mov")) inputExt = "mov";
  
  const inputFile = `input.${inputExt}`;
  const outputFile = "output.webm";
  
  // Write input file
  await ff.writeFile(inputFile, await fetchFile(videoBlob));
  
  const duration = options.endTime - options.startTime;
  const borderPx = options.borderSize;
  const borderColorFFmpeg = hexToFFmpegColor(options.borderColor);
  
  onProgress?.({ status: "processing", message: "Processing video...", progress: 20 });
  
  // Build FFmpeg command
  // Using pad filter to add border around the video
  const args: string[] = [
    "-ss", options.startTime.toString(),
    "-i", inputFile,
    "-t", duration.toString(),
  ];
  
  // Add padding filter for border if border size > 0
  if (borderPx > 0) {
    args.push(
      "-vf",
      `pad=w=iw+${borderPx * 2}:h=ih+${borderPx * 2}:x=${borderPx}:y=${borderPx}:color=${borderColorFFmpeg}`
    );
  }
  
  // Output settings for WebM with VP9 and alpha support
  args.push(
    "-c:v", "libvpx-vp9",
    "-pix_fmt", "yuva420p", // Enable alpha channel
    "-auto-alt-ref", "0", // Required for alpha in VP9
    "-b:v", "2M",
    "-an", // No audio
    "-f", "webm",
    outputFile
  );
  
  onProgress?.({ status: "processing", message: "Encoding video...", progress: 40 });
  
  console.log('[FFmpeg Video] Executing:', args.join(' '));
  await ff.exec(args);
  
  onProgress?.({ status: "processing", message: "Finalizing...", progress: 80 });
  
  // Read output file
  const data = await ff.readFile(outputFile);
  
  // Cleanup
  await ff.deleteFile(inputFile);
  await ff.deleteFile(outputFile);
  
  onProgress?.({ status: "done", message: "Complete!", progress: 100 });
  
  // Safely copy to a new ArrayBuffer to avoid SharedArrayBuffer issues
  const uint8 = data as Uint8Array;
  const copy = new Uint8Array(uint8.length);
  copy.set(uint8);
  return new Blob([copy.buffer as ArrayBuffer], { type: "video/webm" });
}

// Get video duration from a blob
export function getVideoDuration(videoUrl: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    
    video.onloadedmetadata = () => {
      resolve(video.duration);
      video.src = "";
    };
    
    video.onerror = () => {
      reject(new Error("Failed to load video metadata"));
    };
    
    video.src = videoUrl;
  });
}

// Format seconds to MM:SS display
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}
