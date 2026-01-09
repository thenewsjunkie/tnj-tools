import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

let ffmpeg: FFmpeg | null = null;
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

// Load FFmpeg singleton
async function loadFFmpeg(onProgress?: (progress: VideoTranscodeProgress) => void): Promise<FFmpeg> {
  // Check if SharedArrayBuffer is available (requires cross-origin isolation)
  if (typeof SharedArrayBuffer === "undefined") {
    throw new Error(
      "Video processing requires SharedArrayBuffer. Please reload the page or try a different browser."
    );
  }

  if (ffmpeg) return ffmpeg;
  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    onProgress?.({ status: "loading", message: "Loading video processor..." });
    
    const ff = new FFmpeg();
    
    // Use jsdelivr instead of unpkg for better CORS handling
    const baseURL = "https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/esm";
    
    await ff.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
    });
    
    ffmpeg = ff;
    return ff;
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
  
  // Output settings for WebM with VP9
  args.push(
    "-c:v", "libvpx-vp9",
    "-b:v", "2M",
    "-an", // No audio
    "-f", "webm",
    outputFile
  );
  
  onProgress?.({ status: "processing", message: "Encoding video...", progress: 40 });
  
  await ff.exec(args);
  
  onProgress?.({ status: "processing", message: "Finalizing...", progress: 80 });
  
  // Read output file
  const data = await ff.readFile(outputFile);
  
  // Cleanup
  await ff.deleteFile(inputFile);
  await ff.deleteFile(outputFile);
  
  onProgress?.({ status: "done", message: "Complete!", progress: 100 });
  
  // Convert FileData to Blob - handle both string and Uint8Array cases
  if (typeof data === "string") {
    // If string, encode to bytes
    const encoder = new TextEncoder();
    return new Blob([encoder.encode(data)], { type: "video/webm" });
  }
  // data is Uint8Array - create new ArrayBuffer to avoid SharedArrayBuffer issues
  const buffer = new ArrayBuffer(data.byteLength);
  new Uint8Array(buffer).set(data);
  return new Blob([buffer], { type: "video/webm" });
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
