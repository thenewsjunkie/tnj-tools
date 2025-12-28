import { useRef, useState, useCallback } from 'react';
import { SoundEffect } from './useSoundEffects';

export function useSoundPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
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
    
    // Use Web Audio API for volume control (allows values > 1 for boost)
    const audioContext = new AudioContext();
    audioContextRef.current = audioContext;
    
    const gainNode = audioContext.createGain();
    gainNode.gain.value = Math.max(sound.volume, 0);
    gainNodeRef.current = gainNode;
    
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

    // Connect audio to gain node after play starts (required for some browsers)
    audio.addEventListener('canplaythrough', () => {
      if (!sourceRef.current && audioContextRef.current) {
        const source = audioContextRef.current.createMediaElementSource(audio);
        sourceRef.current = source;
        source.connect(gainNode);
        gainNode.connect(audioContextRef.current.destination);
      }
    }, { once: true });

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
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    sourceRef.current = null;
    gainNodeRef.current = null;
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
