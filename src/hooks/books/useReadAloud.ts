import { useCallback, useEffect, useRef, useState } from "react";

export interface ReadAloudSettings {
  rate: number;
  voiceURI: string;
}

interface UseReadAloudOptions {
  getVisibleText: () => string | null;
  onPageFinished: () => void;
  onWordBoundary?: (charIndex: number, charLength: number) => void;
  onStop?: () => void;
  settings: ReadAloudSettings;
}

export function useReadAloud({ getVisibleText, onPageFinished, onWordBoundary, onStop, settings }: UseReadAloudOptions) {
  const [isReading, setIsReading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const isReadingRef = useRef(false);
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  const stop = useCallback(() => {
    isReadingRef.current = false;
    setIsReading(false);
    setIsPaused(false);
    window.speechSynthesis.cancel();
    utteranceRef.current = null;
    onStop?.();
  }, [onStop]);

  const speakCurrentPage = useCallback(() => {
    const text = getVisibleText();
    if (!text || !text.trim()) {
      stop();
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = settingsRef.current.rate;

    if (settingsRef.current.voiceURI && settingsRef.current.voiceURI !== "__default") {
      const voices = window.speechSynthesis.getVoices();
      const voice = voices.find((v) => v.voiceURI === settingsRef.current.voiceURI);
      if (voice) utterance.voice = voice;
    }

    utterance.onboundary = (e) => {
      if (e.name === "word") {
        onWordBoundary?.(e.charIndex, e.charLength ?? 0);
      }
    };

    utterance.onend = () => {
      if (!isReadingRef.current) return;
      onPageFinished();
      setTimeout(() => {
        if (isReadingRef.current) {
          speakCurrentPage();
        }
      }, 600);
    };

    utterance.onerror = (e) => {
      if (e.error === "canceled" || e.error === "interrupted") return;
      console.error("Speech error:", e.error);
      stop();
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [getVisibleText, onPageFinished, onWordBoundary, stop]);

  const play = useCallback(() => {
    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      return;
    }
    isReadingRef.current = true;
    setIsReading(true);
    setIsPaused(false);
    speakCurrentPage();
  }, [isPaused, speakCurrentPage]);

  const pause = useCallback(() => {
    window.speechSynthesis.pause();
    setIsPaused(true);
  }, []);

  const toggle = useCallback(() => {
    if (isReading && !isPaused) {
      pause();
    } else {
      play();
    }
  }, [isReading, isPaused, pause, play]);

  useEffect(() => {
    return () => {
      isReadingRef.current = false;
      window.speechSynthesis.cancel();
    };
  }, []);

  return { isReading, isPaused, play, pause, toggle, stop };
}
