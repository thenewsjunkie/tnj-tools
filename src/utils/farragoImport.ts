import JSZip from 'jszip';

export interface FarragoSound {
  title: string;
  audioBlob: Blob;
  extension: string;
  mimeType: string;
  color?: string;
  volume?: number;
  trimStart?: number;
  trimEnd?: number | null;
  duration?: number;
}

function getMimeType(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  const mimeTypes: Record<string, string> = {
    'mp3': 'audio/mpeg',
    'wav': 'audio/wav',
    'aiff': 'audio/aiff',
    'aif': 'audio/aiff',
    'm4a': 'audio/mp4',
    'aac': 'audio/aac',
    'ogg': 'audio/ogg',
    'flac': 'audio/flac',
  };
  return mimeTypes[ext] || 'audio/mpeg';
}

function getExtension(fileName: string): string {
  return fileName.split('.').pop()?.toLowerCase() || 'mp3';
}

export interface FarragoSetMetadata {
  name: string;
  sounds: FarragoSound[];
}

// Farrago color palette mapping (approximate)
const FARRAGO_COLORS: Record<string, string> = {
  'red': '#ef4444',
  'orange': '#f97316',
  'yellow': '#eab308',
  'green': '#22c55e',
  'teal': '#14b8a6',
  'blue': '#3b82f6',
  'purple': '#8b5cf6',
  'pink': '#ec4899',
  'gray': '#6b7280',
  'grey': '#6b7280',
};

function parseColorValue(colorValue: unknown): string {
  if (!colorValue) return '#3b82f6';
  
  if (typeof colorValue === 'string') {
    const lower = colorValue.toLowerCase();
    if (FARRAGO_COLORS[lower]) return FARRAGO_COLORS[lower];
    if (colorValue.startsWith('#')) return colorValue;
    return '#3b82f6';
  }
  
  // Handle color object format (RGBA)
  if (typeof colorValue === 'object' && colorValue !== null) {
    const obj = colorValue as Record<string, number>;
    if ('red' in obj && 'green' in obj && 'blue' in obj) {
      const r = Math.round((obj.red || 0) * 255);
      const g = Math.round((obj.green || 0) * 255);
      const b = Math.round((obj.blue || 0) * 255);
      return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }
  }
  
  return '#3b82f6';
}

export async function parseFarragoSet(file: File): Promise<FarragoSetMetadata> {
  const zip = new JSZip();
  const contents = await zip.loadAsync(file);
  
  let setName = file.name.replace('.farragoset', '');
  const sounds: FarragoSound[] = [];
  
  // Find all audio files and their metadata
  const audioFiles: Map<string, JSZip.JSZipObject> = new Map();
  const metadataFiles: Map<string, JSZip.JSZipObject> = new Map();
  
  contents.forEach((relativePath, zipEntry) => {
    if (zipEntry.dir) return;
    
    const lowerPath = relativePath.toLowerCase();
    
    // Audio files
    if (lowerPath.endsWith('.mp3') || lowerPath.endsWith('.wav') || 
        lowerPath.endsWith('.aiff') || lowerPath.endsWith('.m4a') ||
        lowerPath.endsWith('.aac') || lowerPath.endsWith('.ogg')) {
      audioFiles.set(relativePath, zipEntry);
    }
    
    // Metadata files (plist or json)
    if (lowerPath.endsWith('.plist') || lowerPath.endsWith('.json')) {
      metadataFiles.set(relativePath, zipEntry);
    }
  });
  
  // Try to parse metadata for sound settings
  let soundMetadata: Map<string, { title?: string; color?: string; volume?: number; inPoint?: number; outPoint?: number }> = new Map();
  
  for (const [path, entry] of metadataFiles) {
    try {
      const content = await entry.async('string');
      
      // Try JSON first
      if (path.endsWith('.json')) {
        const json = JSON.parse(content);
        if (json.name) setName = json.name;
        if (json.sounds && Array.isArray(json.sounds)) {
          for (const sound of json.sounds) {
            if (sound.filename) {
              soundMetadata.set(sound.filename, {
                title: sound.title || sound.name,
                color: parseColorValue(sound.color),
                volume: sound.volume,
                inPoint: sound.inPoint,
                outPoint: sound.outPoint,
              });
            }
          }
        }
      }
      
      // Try to parse plist (simplified - just extract key values)
      if (path.endsWith('.plist')) {
        // Extract set name from plist if present
        const nameMatch = content.match(/<key>name<\/key>\s*<string>([^<]+)<\/string>/);
        if (nameMatch) setName = nameMatch[1];
        
        // Look for tile/sound entries - match each dict that contains a filename
        const tileMatches = content.matchAll(/<dict>[\s\S]*?<key>filename<\/key>\s*<string>([^<]+)<\/string>[\s\S]*?<\/dict>/g);
        for (const match of tileMatches) {
          const filename = match[1];
          const dictContent = match[0];
          
          // Extract title/name from the dict
          const titleMatch = dictContent.match(/<key>title<\/key>\s*<string>([^<]+)<\/string>/) ||
                            dictContent.match(/<key>name<\/key>\s*<string>([^<]+)<\/string>/);
          const colorMatch = dictContent.match(/<key>color<\/key>\s*<string>([^<]+)<\/string>/);
          const volumeMatch = dictContent.match(/<key>volume<\/key>\s*<real>([^<]+)<\/real>/);
          const inPointMatch = dictContent.match(/<key>inPoint<\/key>\s*<real>([^<]+)<\/real>/);
          const outPointMatch = dictContent.match(/<key>outPoint<\/key>\s*<real>([^<]+)<\/real>/);
          
          soundMetadata.set(filename, {
            title: titleMatch ? titleMatch[1] : undefined,
            color: colorMatch ? parseColorValue(colorMatch[1]) : undefined,
            volume: volumeMatch ? parseFloat(volumeMatch[1]) : undefined,
            inPoint: inPointMatch ? parseFloat(inPointMatch[1]) : undefined,
            outPoint: outPointMatch ? parseFloat(outPointMatch[1]) : undefined,
          });
        }
      }
    } catch (e) {
      console.warn('Could not parse metadata file:', path, e);
    }
  }
  
  // Process audio files
  for (const [path, entry] of audioFiles) {
    try {
      const audioData = await entry.async('arraybuffer');
      const fileName = path.split('/').pop() || path;
      const title = fileName.replace(/\.[^/.]+$/, ''); // Remove extension
      const extension = getExtension(fileName);
      const mimeType = getMimeType(fileName);
      
      // Create blob with correct MIME type
      const audioBlob = new Blob([audioData], { type: mimeType });
      
      // Look up metadata by filename
      const meta = soundMetadata.get(fileName) || soundMetadata.get(path) || {};
      
      sounds.push({
        title: meta.title || title,
        audioBlob,
        extension,
        mimeType,
        color: meta.color || '#3b82f6',
        volume: meta.volume,
        trimStart: meta.inPoint,
        trimEnd: meta.outPoint,
      });
    } catch (e) {
      console.warn('Could not process audio file:', path, e);
    }
  }
  
  return { name: setName, sounds };
}

export function isValidFarragoSet(file: File): boolean {
  const name = file.name.toLowerCase();
  const isValidExtension = name.endsWith('.farragoset') || name.endsWith('.zip');
  const isZipMime = file.type === 'application/zip' || 
                    file.type === 'application/x-zip-compressed' || 
                    file.type === 'application/octet-stream' ||
                    file.type === '';
  return isValidExtension || isZipMime;
}
