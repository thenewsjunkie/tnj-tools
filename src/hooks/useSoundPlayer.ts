import { useRef, useState, useCallback, useEffect } from 'react';
import { SoundEffect } from './useSoundEffects';

export function useSoundPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [remainingTime, setRemainingTime] = useState<number | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const currentSoundRef = useRef<SoundEffect | null>(null);

  // Update remaining time while playing
  useEffect(() => {
    const updateTime = () => {
      if (audioRef.current && currentSoundRef.current && playingId) {
        const currentTime = audioRef.current.currentTime;
        const trimEnd = currentSoundRef.current.trim_end ?? currentSoundRef.current.duration ?? audioRef.current.duration;
        const remaining = Math.max(0, trimEnd - currentTime);
        setRemainingTime(remaining);
        animationFrameRef.current = requestAnimationFrame(updateTime);
      }
    };

    if (playingId) {
      animationFrameRef.current = requestAnimationFrame(updateTime);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [playingId]);

  const stopCurrent = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    currentSoundRef.current = null;
    setRemainingTime(null);
  }, []);

  const playSound = useCallback((sound: SoundEffect) => {
    // Stop any currently playing sound
    stopCurrent();

    const audio = new Audio(sound.audio_url);
    audio.crossOrigin = 'anonymous';
    audioRef.current = audio;
    currentSoundRef.current = sound;
    
    // Apply trim start
    audio.currentTime = sound.trim_start || 0;
    
    // Set initial remaining time
    const soundTrimEnd = sound.trim_end ?? sound.duration ?? 0;
    setRemainingTime(soundTrimEnd - (sound.trim_start || 0));
    
    setPlayingId(sound.id);

    // Handle trim end
    if (soundTrimEnd > (sound.trim_start || 0)) {
      const playDuration = (soundTrimEnd - (sound.trim_start || 0)) * 1000;
      timeoutRef.current = setTimeout(() => {
        audio.pause();
        setPlayingId(null);
        setRemainingTime(null);
      }, playDuration);
    }

    audio.addEventListener('ended', () => {
      setPlayingId(null);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    });

    audio.addEventListener('error', (e) => {
      console.error('Audio playback error:', sound.audio_url, e);
      const ext = sound.audio_url.split('.').pop() || 'unknown';
      console.warn(`Failed to play audio (format: .${ext}). This format may not be supported by your browser.`);
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
    setRemainingTime(null);
  }, [stopCurrent]);

  const isPlaying = useCallback((id: string) => {
    return playingId === id;
  }, [playingId]);

  return {
    playSound,
    stopAll,
    isPlaying,
    playingId,
    remainingTime,
  };
}
