import { useRef, useState, useCallback, useEffect } from 'react';
import { SoundEffect } from './useSoundEffects';

export function useSoundPlayer() {
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const startTimeRef = useRef<number>(0);
  const offsetRef = useRef<number>(0);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [remainingTime, setRemainingTime] = useState<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const currentSoundRef = useRef<SoundEffect | null>(null);

  // Update remaining time while playing
  useEffect(() => {
    const updateTime = () => {
      if (audioContextRef.current && currentSoundRef.current && playingId) {
        const elapsed = audioContextRef.current.currentTime - startTimeRef.current;
        const currentPosition = offsetRef.current + elapsed;
        const trimEnd = currentSoundRef.current.trim_end ?? currentSoundRef.current.duration ?? 0;
        const remaining = Math.max(0, trimEnd - currentPosition);
        setRemainingTime(remaining);
        
        if (remaining > 0) {
          animationFrameRef.current = requestAnimationFrame(updateTime);
        }
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
    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.stop();
      } catch (e) {
        // Already stopped
      }
      sourceNodeRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    gainNodeRef.current = null;
    currentSoundRef.current = null;
    setRemainingTime(null);
  }, []);

  const playSound = useCallback(async (sound: SoundEffect) => {
    // Stop any currently playing sound
    stopCurrent();
    setPlayingId(sound.id);
    currentSoundRef.current = sound;

    try {
      // Fetch the audio file
      const response = await fetch(sound.audio_url);
      if (!response.ok) {
        throw new Error(`Failed to fetch audio: ${response.status}`);
      }
      const arrayBuffer = await response.arrayBuffer();

      // Create audio context and decode
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

      // Set up gain node for volume control (supports >1.0 for boost)
      const gainNode = audioContext.createGain();
      gainNode.gain.value = Math.max(sound.volume, 0);
      gainNodeRef.current = gainNode;
      gainNode.connect(audioContext.destination);

      // Create buffer source
      const sourceNode = audioContext.createBufferSource();
      sourceNode.buffer = audioBuffer;
      sourceNode.connect(gainNode);
      sourceNodeRef.current = sourceNode;

      // Calculate trim points
      const trimStart = sound.trim_start || 0;
      const trimEnd = sound.trim_end ?? sound.duration ?? audioBuffer.duration;
      const playDuration = trimEnd - trimStart;

      // Set initial remaining time
      setRemainingTime(playDuration);
      offsetRef.current = trimStart;
      startTimeRef.current = audioContext.currentTime;

      // Handle playback end
      sourceNode.onended = () => {
        setPlayingId(null);
        setRemainingTime(null);
      };

      // Start playback with trim points
      sourceNode.start(0, trimStart, playDuration);
      
    } catch (err) {
      console.error('Audio playback error:', err);
      setPlayingId(null);
      setRemainingTime(null);
    }
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
