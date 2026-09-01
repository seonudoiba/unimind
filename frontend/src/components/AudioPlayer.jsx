// frontend/src/components/AudioPlayer.jsx
import React from 'react';
import { useAudio } from '../hooks/useAudio';

export const AudioPlayer = ({ url, text, onPlayEnd, children }) => {
  const { play, stop, isPlaying, isLoading, isError, toggleMute } = useAudio(url, {
    onEnd: onPlayEnd
  });

  return (
    <div className="audio-player inline-flex items-center gap-2">
      {/* Loading spinner */}
      {isLoading && (
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-sun border-t-transparent" />
      )}
      
      {/* Play/Stop button */}
      <button
        onClick={() => {
          if (isPlaying) {
            stop();
          } else {
            play();
          }
        }}
        className={`audio-btn flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
          isPlaying 
            ? 'bg-grass text-white hover:bg-grass/80' 
            : isError
            ? 'bg-coral text-white hover:bg-coral/80'
            : 'bg-sun text-white hover:bg-sun-dark'
        }`}
        disabled={isLoading}
        title={isPlaying ? 'Stop audio' : isError ? 'Audio error - tap to retry' : 'Play audio'}
      >
        <span className="text-base">
          {isLoading ? '⏳' : isPlaying ? '⏹️' : isError ? '⚠️' : '🔊'}
        </span>
        <span className="text-xs">
          {isPlaying ? 'Playing...' : isError ? 'Retry' : text ? 'Listen' : 'Play'}
        </span>
      </button>
      
      {/* Mute toggle */}
      <button
        onClick={toggleMute}
        className="text-[#7A8B99] hover:text-navy text-sm transition-colors"
        title="Toggle mute"
      >
        🔊
      </button>
    </div>
  );
};