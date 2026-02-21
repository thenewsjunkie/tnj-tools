/** Score a SpeechSynthesisVoice by likely quality — higher = better. */
export function scoreVoice(voice: SpeechSynthesisVoice): number {
  let score = 0;
  const name = voice.name;
  const lang = voice.lang;

  // Microsoft Edge "Natural" / "Neural" voices — excellent quality
  if (/Natural|Neural/i.test(name)) score += 100;

  // Google English voices on Chrome
  if (/Google/i.test(name) && /^en/i.test(lang)) score += 80;

  // Premium Apple voices
  if (/Samantha|Karen|Daniel|Moira|Tessa|Rishi/i.test(name)) score += 70;

  // Enhanced / Premium flag
  if (/Enhanced|Premium/i.test(name)) score += 50;

  // English language preference
  if (/^en/i.test(lang)) score += 20;

  // Cloud-based voices tend to be higher quality
  if (!voice.localService) score += 10;

  return score;
}

/** Return all voices sorted best-first. */
export function getSortedVoices(): SpeechSynthesisVoice[] {
  const voices = window.speechSynthesis.getVoices();
  return [...voices].sort((a, b) => scoreVoice(b) - scoreVoice(a));
}

/** Return the highest-scored voice, or null if none available. */
export function getBestVoice(): SpeechSynthesisVoice | null {
  const sorted = getSortedVoices();
  return sorted[0] ?? null;
}

/** Clean up a voice name for display. */
export function cleanVoiceName(name: string): string {
  return name
    .replace(/^Microsoft\s+/i, "")
    .replace(/\s+Online\s*\(Natural\)/i, " (Natural)")
    .replace(/\s+\(.*?Microsoft.*?\)/i, "");
}

/** Minimum score to be considered "recommended". */
export const RECOMMENDED_THRESHOLD = 50;
