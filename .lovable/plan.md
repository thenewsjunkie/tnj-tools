

## Improve Read Aloud with Smart Browser Voice Selection (Free)

Modern browsers include high-quality neural/natural voices, but the current implementation defaults to the lowest-quality one. This plan auto-selects the best available voice and organizes the voice picker so users can easily find good options.

### What Changes

**1. New utility: voice scoring and sorting**

Create `src/utils/voiceUtils.ts` with:
- `scoreVoice(voice)` -- ranks voices by quality indicators
- `getSortedVoices()` -- returns voices sorted best-first
- `getBestVoice()` -- returns the top-scored voice

Scoring rules:
- +100 for "Natural" or "Neural" in name (Microsoft Edge voices)
- +80 for "Google" English voices (Chrome)
- +70 for known premium Apple voices (Samantha, Karen, Daniel)
- +50 for "Enhanced" or "Premium" in name
- +20 for English language
- +10 for non-local (cloud-based) voices

**2. Auto-select best voice on load**

Update `BookReader.tsx` to detect voices on mount and set `ttsSettings.voiceURI` to the best available voice automatically, instead of `"__default"`.

**3. Grouped voice dropdown in AudioPlayerBar and ReaderControls**

Replace the flat voice list with two groups:
- "Recommended" -- voices scoring 50+ (the good ones)
- "All Voices" -- everything else

Show cleaner display names (strip "Microsoft" prefix, etc.).

**4. No other changes needed**

The `useReadAloud.ts` hook already handles voice selection via `settingsRef.current.voiceURI` -- no changes required there.

### Files

| File | Action |
|------|--------|
| `src/utils/voiceUtils.ts` | Create -- voice scoring utility |
| `src/components/books/reader/AudioPlayerBar.tsx` | Update -- grouped voice dropdown, auto-select |
| `src/components/books/reader/ReaderControls.tsx` | Update -- grouped voice dropdown |
| `src/pages/books/BookReader.tsx` | Update -- auto-select best voice on mount |

### Technical Details

**Voice scoring function:**
```text
scoreVoice(voice: SpeechSynthesisVoice): number
  name matches /Natural|Neural/i   -> +100
  name includes "Google", en lang   -> +80
  name matches /Samantha|Karen|Daniel/ -> +70
  name matches /Enhanced|Premium/i  -> +50
  lang starts with "en"             -> +20
  localService === false            -> +10
```

**Auto-select logic in BookReader:**
- Listen for `voiceschanged` event
- If `voiceURI` is still `"__default"`, call `getBestVoice()` and update TTS settings
- This runs once on mount so users hear a good voice immediately

**Grouped dropdown rendering:**
- Split `voices` array into `recommended` (score >= 50) and `others`
- Render with `SelectGroup` + `SelectLabel` for clear separation
- Truncate long voice names for cleaner UI

### User Experience

- On Edge/Windows: automatically picks a Microsoft Natural voice (excellent quality)
- On Chrome: picks the best Google English voice
- On macOS: picks a premium Siri voice
- Users can still manually pick any voice from the full list
- Zero cost, no API keys, works offline

