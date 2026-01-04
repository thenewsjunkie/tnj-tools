/**
 * Normalizes a URL by ensuring it has a protocol.
 * Returns the normalized URL or null if invalid.
 */
export function normalizeUrl(url: string): string | null {
  if (!url) return null;
  
  let normalized = url.trim();
  
  if (!normalized) return null;
  
  // If it starts with //, add https:
  if (normalized.startsWith("//")) {
    normalized = "https:" + normalized;
  }
  // If it doesn't have a protocol, add https://
  else if (!/^https?:\/\//i.test(normalized)) {
    normalized = "https://" + normalized;
  }
  
  // Validate the URL
  try {
    new URL(normalized);
    return normalized;
  } catch {
    return null;
  }
}
