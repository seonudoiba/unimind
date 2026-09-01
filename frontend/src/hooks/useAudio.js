import { useState, useEffect, useCallback, useRef } from 'react';
import { AudioService } from '../services/AudioService';

export const useAudio = (url, options = {}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef(null);

  const play = useCallback(() => {
    if (!url) return;
    
    setIsError(false);
    setIsLoading(true);
    
    audioRef.current = AudioService.play(url, {
      onStart: () => {
        setIsLoading(false);
        setIsPlaying(true);
      },
      onEnd: () => {
        setIsPlaying(false);
        setIsLoading(false);
        if (options.onEnd) options.onEnd();
      },
      onError: (error) => {
        setIsLoading(false);
        setIsPlaying(false);
        setIsError(true);
        if (options.onError) options.onError(error);
      }
    });
  }, [url]);

  const stop = useCallback(() => {
    AudioService.stop();
    setIsPlaying(false);
    setIsLoading(false);
  }, []);

  const toggleMute = useCallback(() => {
    return AudioService.toggleMute();
  }, []);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        AudioService.stop();
      }
    };
  }, []);

  return {
    play,
    stop,
    toggleMute,
    isPlaying,
    isLoading,
    isError,
    progress
  };
};