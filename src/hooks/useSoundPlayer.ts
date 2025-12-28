import { useRef, useState, useCallback } from 'react';
import { SoundEffect } from './useSoundEffects';

export function useSoundPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const stopCurrent = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
  }, []);

  const playSound = useCallback((sound: SoundEffect) => {
    // Stop any currently playing sound
    stopCurrent();

    const audio = new Audio(sound.audio_url);
    audio.crossOrigin = 'anonymous';
    audioRef.current = audio;
    
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

    // Set up Web Audio API for volume boost support
    const startPlayback = async () => {
      try {
        const audioContext = new AudioContext();
        audioContextRef.current = audioContext;
        
        const source = audioContext.createMediaElementSource(audio);
        const gainNode = audioContext.createGain();
        gainNode.gain.value = Math.max(sound.volume, 0);
        
        source.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        await audio.play();
      } catch (err) {
        // Fallback to native volume if Web Audio fails
        console.warn('Web Audio API failed, using native volume:', err);
        audio.volume = Math.min(Math.max(sound.volume, 0), 1);
        audio.play().catch(() => setPlayingId(null));
      }
    };

    startPlayback();
  }, [stopCurrent]);

  const stopAll = useCallback(() => {
    stopCurrent();
    setPlayingId(null);
  }, [stopCurrent]);

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
