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

// Parse plist XML using DOMParser for robust extraction
type PlistValue = string | number | boolean | PlistValue[] | { [key: string]: PlistValue };

function parsePlistXml(xmlContent: string): PlistValue | null {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlContent, 'application/xml');
    
    const parseError = doc.querySelector('parsererror');
    if (parseError) {
      console.warn('Plist XML parse error:', parseError.textContent);
      return null;
    }
    
    const plist = doc.querySelector('plist');
    if (!plist) return null;
    
    const firstChild = plist.firstElementChild;
    if (!firstChild) return null;
    
    return parseNode(firstChild);
  } catch (e) {
    console.warn('Failed to parse plist:', e);
    return null;
  }
}

function parseNode(node: Element): PlistValue {
  const tagName = node.tagName.toLowerCase();
  
  switch (tagName) {
    case 'string':
      return node.textContent || '';
    case 'integer':
      return parseInt(node.textContent || '0', 10);
    case 'real':
      return parseFloat(node.textContent || '0');
    case 'true':
      return true;
    case 'false':
      return false;
    case 'array': {
      const items: PlistValue[] = [];
      for (const child of Array.from(node.children)) {
        items.push(parseNode(child));
      }
      return items;
    }
    case 'dict': {
      const obj: { [key: string]: PlistValue } = {};
      const children = Array.from(node.children);
      for (let i = 0; i < children.length; i += 2) {
        const keyNode = children[i];
        const valueNode = children[i + 1];
        if (keyNode?.tagName?.toLowerCase() === 'key' && valueNode) {
          const key = keyNode.textContent || '';
          obj[key] = parseNode(valueNode);
        }
      }
      return obj;
    }
    default:
      return '';
  }
}

interface SoundMetadata {
  title?: string;
  color?: string;
  volume?: number;
  inPoint?: number;
  outPoint?: number;
}

// Extract sound metadata from parsed plist object
function extractSoundMetadata(plistData: PlistValue): Map<string, SoundMetadata> {
  const metadata = new Map<string, SoundMetadata>();
  
  function traverse(value: PlistValue) {
    if (typeof value !== 'object' || value === null) return;
    
    if (Array.isArray(value)) {
      for (const item of value) {
        traverse(item);
      }
      return;
    }
    
    // Check if this object looks like a sound entry
    const obj = value as { [key: string]: PlistValue };
    
    // Look for filename, uuid, or id fields to use as keys
    const filename = obj['filename'] as string | undefined;
    const uuid = obj['uuid'] as string | undefined;
    const id = obj['id'] as string | undefined;
    const title = (obj['title'] as string) || (obj['name'] as string);
    
    if (title && (filename || uuid || id)) {
      const meta: SoundMetadata = {
        title,
        color: parseColorValue(obj['color']),
        volume: typeof obj['volume'] === 'number' ? obj['volume'] : undefined,
        inPoint: typeof obj['inPoint'] === 'number' ? obj['inPoint'] : undefined,
        outPoint: typeof obj['outPoint'] === 'number' ? obj['outPoint'] : undefined,
      };
      
      // Store under multiple keys for matching
      if (filename) {
        metadata.set(filename, meta);
        metadata.set(filename.toLowerCase(), meta);
        // Also store without extension
        const baseName = filename.replace(/\.[^/.]+$/, '');
        metadata.set(baseName, meta);
        metadata.set(baseName.toLowerCase(), meta);
      }
      if (uuid) {
        metadata.set(uuid, meta);
        metadata.set(uuid.toLowerCase(), meta);
        metadata.set(uuid.toUpperCase(), meta);
      }
      if (id && typeof id === 'string') {
        metadata.set(id, meta);
        metadata.set(id.toLowerCase(), meta);
      }
    }
    
    // Recurse into child objects
    for (const key of Object.keys(obj)) {
      traverse(obj[key]);
    }
  }
  
  traverse(plistData);
  return metadata;
}

// Try to find metadata for an audio file using various key formats
function findMetadata(
  fileName: string,
  metadata: Map<string, SoundMetadata>
): SoundMetadata | undefined {
  const baseName = fileName.replace(/\.[^/.]+$/, '');
  
  // Try various key formats
  const keysToTry = [
    fileName,
    fileName.toLowerCase(),
    baseName,
    baseName.toLowerCase(),
    baseName.toUpperCase(),
  ];
  
  for (const key of keysToTry) {
    const meta = metadata.get(key);
    if (meta) return meta;
  }
  
  return undefined;
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
  
  // Parse all metadata files and build a combined metadata map
  let soundMetadata = new Map<string, SoundMetadata>();
  
  for (const [path, entry] of metadataFiles) {
    try {
      const content = await entry.async('string');
      
      // Try JSON first
      if (path.toLowerCase().endsWith('.json')) {
        try {
          const json = JSON.parse(content);
          if (json.name) setName = json.name;
          if (json.sounds && Array.isArray(json.sounds)) {
            for (const sound of json.sounds) {
              if (sound.filename || sound.uuid || sound.id) {
                const meta: SoundMetadata = {
                  title: sound.title || sound.name,
                  color: parseColorValue(sound.color),
                  volume: sound.volume,
                  inPoint: sound.inPoint,
                  outPoint: sound.outPoint,
                };
                const key = sound.filename || sound.uuid || sound.id;
                soundMetadata.set(key, meta);
                soundMetadata.set(key.toLowerCase(), meta);
              }
            }
          }
        } catch {
          // Not valid JSON, skip
        }
      }
      
      // Try plist XML
      if (path.toLowerCase().endsWith('.plist')) {
        const parsed = parsePlistXml(content);
        if (parsed) {
          // Check for set name at root level
          if (typeof parsed === 'object' && !Array.isArray(parsed)) {
            const rootObj = parsed as { [key: string]: PlistValue };
            if (rootObj['name'] && typeof rootObj['name'] === 'string') {
              setName = rootObj['name'];
            }
          }
          
          // Extract all sound metadata
          const extracted = extractSoundMetadata(parsed);
          for (const [key, value] of extracted) {
            soundMetadata.set(key, value);
          }
        }
      }
    } catch (e) {
      console.warn('Could not parse metadata file:', path, e);
    }
  }
  
  console.log('Farrago metadata keys:', Array.from(soundMetadata.keys()));
  
  // Process audio files
  for (const [path, entry] of audioFiles) {
    try {
      const audioData = await entry.async('arraybuffer');
      const fileName = path.split('/').pop() || path;
      const baseName = fileName.replace(/\.[^/.]+$/, ''); // Remove extension for fallback title
      const extension = getExtension(fileName);
      const mimeType = getMimeType(fileName);
      
      // Create blob with correct MIME type
      const audioBlob = new Blob([audioData], { type: mimeType });
      
      // Look up metadata
      const meta = findMetadata(fileName, soundMetadata);
      
      console.log(`Processing: ${fileName}, meta found:`, !!meta, meta?.title);
      
      sounds.push({
        title: meta?.title || baseName,
        audioBlob,
        extension,
        mimeType,
        color: meta?.color || '#3b82f6',
        volume: meta?.volume,
        trimStart: meta?.inPoint,
        trimEnd: meta?.outPoint,
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
