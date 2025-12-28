import { useRef, useState, useCallback } from 'react';
import { SoundEffect } from './useSoundEffects';

export function useSoundPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const playSound = useCallback((sound: SoundEffect) => {
    // Stop any currently playing sound
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    const audio = new Audio(sound.audio_url);
    audioRef.current = audio;
    
    // Apply volume
    audio.volume = Math.min(Math.max(sound.volume, 0), 2);
    
    // Apply trim start
    audio.currentTime = sound.trim_start || 0;
    
    setPlayingId(sound.id);

    // Handle trim end
    const trimEnd = sound.trim_end ?? sound.duration ?? null;
    if (trimEnd !== null && trimEnd > (sound.trim_start || 0)) {
      const playDuration = (trimEnd - (sound.trim_start || 0)) * 1000;
      timeoutRef.current = setTimeout(() => {
        audio.pause();
        setPlayingId(null);
      }, playDuration);
    }

    audio.addEventListener('ended', () => {
      setPlayingId(null);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    });

    audio.addEventListener('error', () => {
      setPlayingId(null);
    });

    audio.play().catch(() => {
      setPlayingId(null);
    });
  }, []);

  const stopAll = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setPlayingId(null);
  }, []);

  const isPlaying = useCallback((id: string) => {
    return playingId === id;
  }, [playingId]);

  return {
    playSound,
    stopAll,
    isPlaying,
    playingId,
  };
}
