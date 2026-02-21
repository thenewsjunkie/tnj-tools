

## Fix: Audio Player Crash on Empty Select Value

### Problem

The `AudioPlayerBar` component crashes because the "Default" voice option uses `value=""`, which Radix UI's `<Select.Item>` explicitly forbids -- empty strings are reserved for clearing the selection/showing placeholder.

### Fix

**File: `src/components/books/reader/AudioPlayerBar.tsx`**

Change the "Default" voice `<SelectItem>` from `value=""` to `value="__default"`, and update the voice selection logic to treat `"__default"` the same as no voice selected.

**File: `src/hooks/books/useReadAloud.ts`**

Update the voice matching logic so that when `voiceURI` is `"__default"` (or empty), it skips setting a specific voice and uses the browser default.

### Details

- In `AudioPlayerBar.tsx` line ~100: change `<SelectItem value="">Default</SelectItem>` to `<SelectItem value="__default">Default</SelectItem>`
- In `useReadAloud.ts`: update the voice check from `if (settingsRef.current.voiceURI)` to `if (settingsRef.current.voiceURI && settingsRef.current.voiceURI !== "__default")`
- In `BookReader.tsx`: update the default TTS settings to use `voiceURI: "__default"` instead of `""`

