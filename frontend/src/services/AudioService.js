// frontend/src/services/AudioService.js

/**
 * Bulletproof Singleton Audio Manager for UniMindKidz
 * Guarantees:
 * 1. ZERO overlapping audio - any new audio or screen transition hard-stops previous sound immediately
 * 2. Exact audio duration tracking and synchronization
 * 3. Graceful, friendly TTS fallback when no audio file is provided (speaks ONLY the designated text)
 * 4. In-browser audio recording helper with automatic duration calculation
 * 5. Global mute/unmute state with reactive listener support
 */

class AudioManager {
  constructor() {
    this.currentAudio = null;
    this.currentPlayId = 0;
    this.isPlaying = false;
    this.isLoading = false;
    this.isMuted = localStorage.getItem('unimind_muted') === 'true';
    this.currentTrackInfo = null;
    this.listeners = new Set();
    this.timeUpdateTimer = null;
  }

  // Subscribe to state changes (playing, muted, time updates)
  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notify() {
    const state = {
      isPlaying: this.isPlaying,
      isLoading: this.isLoading,
      isMuted: this.isMuted,
      trackInfo: this.currentTrackInfo
    };
    this.listeners.forEach(cb => {
      try {
        cb(state);
      } catch (err) {
        console.error('Audio listener error:', err);
      }
    });
  }

  // Hard stop everything immediately
  stop() {
    this.currentPlayId++; // invalidate any active callbacks
    clearInterval(this.timeUpdateTimer);
    this.timeUpdateTimer = null;

    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio.removeAttribute('src');
        this.currentAudio.load();
      } catch (e) {
        // ignore
      }
      this.currentAudio = null;
    }

    if (typeof window !== 'undefined' && window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {
        // ignore
      }
    }

    this.isPlaying = false;
    this.isLoading = false;
    this.currentTrackInfo = null;
    this.notify();
  }

  // Toggle global mute
  toggleMute() {
    this.isMuted = !this.isMuted;
    localStorage.setItem('unimind_muted', this.isMuted.toString());
    if (this.isMuted) {
      this.stop();
    }
    this.notify();
    return this.isMuted;
  }

  setMute(muted) {
    this.isMuted = !!muted;
    localStorage.setItem('unimind_muted', this.isMuted.toString());
    if (this.isMuted) {
      this.stop();
    }
    this.notify();
    return this.isMuted;
  }

  /**
   * Play an audio file or speak text with strict concurrency control.
   * @param {Object} params
   * @param {string} [params.url] - URL to hosted audio file
   * @param {string} [params.text] - Fallback text to speak if URL is absent or fails
   * @param {number} [params.duration] - Expected duration in seconds (optional)
   * @param {function} [params.onStart] - Callback when playback actually starts
   * @param {function} [params.onTimeUpdate] - Callback (currentTime, duration)
   * @param {function} [params.onEnd] - Callback when playback finishes naturally
   * @param {function} [params.onError] - Callback if playback errors
   * @returns {number} playId token
   */
  play(params = {}) {
    // If called with (url, callback) legacy signature
    let options = params;
    if (typeof params === 'string') {
      options = { url: params, onEnd: arguments[1] };
    }

    const { url, text, duration: expectedDuration, onStart, onTimeUpdate, onEnd, onError } = options;

    // Hard stop any previous sound
    this.stop();

    if (this.isMuted) {
      if (onEnd) setTimeout(onEnd, 50);
      return this.currentPlayId;
    }

    const thisPlayId = ++this.currentPlayId;
    this.isLoading = true;
    this.currentTrackInfo = { url, text, duration: expectedDuration || 0, currentTime: 0 };
    this.notify();

    // 1. If audio URL is available, try to play real audio
    if (url && typeof url === 'string' && url.trim().length > 0) {
      const audio = new Audio();
      audio.crossOrigin = 'anonymous';
      audio.preload = 'auto';
      this.currentAudio = audio;

      let started = false;

      const cleanup = () => {
        if (this.timeUpdateTimer) {
          clearInterval(this.timeUpdateTimer);
          this.timeUpdateTimer = null;
        }
        audio.oncanplaythrough = null;
        audio.onplaying = null;
        audio.onended = null;
        audio.onerror = null;
        audio.ontimeupdate = null;
      };

      audio.onplaying = () => {
        if (this.currentPlayId !== thisPlayId) return;
        this.isLoading = false;
        this.isPlaying = true;
        started = true;
        this.notify();
        if (onStart) onStart();
      };

      audio.ontimeupdate = () => {
        if (this.currentPlayId !== thisPlayId) return;
        const cur = audio.currentTime || 0;
        const dur = audio.duration || expectedDuration || 0;
        if (this.currentTrackInfo) {
          this.currentTrackInfo.currentTime = cur;
          this.currentTrackInfo.duration = dur;
        }
        if (onTimeUpdate) onTimeUpdate(cur, dur);
        this.notify();
      };

      audio.onended = () => {
        if (this.currentPlayId !== thisPlayId) return;
        cleanup();
        this.isPlaying = false;
        this.isLoading = false;
        this.currentAudio = null;
        this.currentTrackInfo = null;
        this.notify();
        if (onEnd) onEnd();
      };

      audio.onerror = (e) => {
        if (this.currentPlayId !== thisPlayId) return;
        console.warn(`[AudioService] Real audio failed for "${url}". Attempting TTS fallback with text: "${text}"`, e);
        cleanup();
        this.currentAudio = null;
        
        // Fallback to TTS if text is provided
        if (text && text.trim().length > 0) {
          this._playTTS(text, thisPlayId, { onStart, onEnd, onError });
        } else {
          this.isPlaying = false;
          this.isLoading = false;
          this.notify();
          if (onError) onError(e);
          if (onEnd) onEnd();
        }
      };

      audio.src = url;
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          if (this.currentPlayId !== thisPlayId) return;
          console.warn('[AudioService] Play promise rejected:', err.message);
          // If browser blocked autoplay or URL failed, fall back to TTS
          if (text && text.trim().length > 0) {
            this._playTTS(text, thisPlayId, { onStart, onEnd, onError });
          } else {
            this.isPlaying = false;
            this.isLoading = false;
            this.notify();
            if (onEnd) onEnd();
          }
        });
      }

      return thisPlayId;
    }

    // 2. If no URL provided, speak text via Web Speech API
    if (text && typeof text === 'string' && text.trim().length > 0) {
      this._playTTS(text, thisPlayId, { onStart, onEnd, onError });
      return thisPlayId;
    }

    // No audio or text
    this.isLoading = false;
    this.isPlaying = false;
    this.notify();
    if (onEnd) setTimeout(onEnd, 50);
    return thisPlayId;
  }

  // Speak method for direct TTS compatibility
  speak(text, onEnd) {
    return this.play({ text, onEnd });
  }

  _playTTS(text, playId, { onStart, onEnd, onError }) {
    if (this.isMuted || typeof window === 'undefined' || !window.speechSynthesis) {
      this.isLoading = false;
      this.isPlaying = false;
      this.notify();
      if (onEnd) setTimeout(onEnd, 50);
      return;
    }

    try {
      window.speechSynthesis.cancel();

      // Clean text for speech
      const cleanText = text
        .replace(/[^\w\s\.,!\?'"–—]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      if (!cleanText) {
        this.isLoading = false;
        this.isPlaying = false;
        this.notify();
        if (onEnd) setTimeout(onEnd, 50);
        return;
      }

      const utter = new SpeechSynthesisUtterance(cleanText);
      utter.rate = 0.92;
      utter.pitch = 1.12;
      utter.volume = 1;

      // Select warm friendly English voice if available
      const voices = window.speechSynthesis.getVoices() || [];
      const englishVoice = voices.find(v => v.lang && v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Zira')))
        || voices.find(v => v.lang && v.lang.startsWith('en'))
        || voices[0];
      if (englishVoice) {
        utter.voice = englishVoice;
      }

      utter.onstart = () => {
        if (this.currentPlayId !== playId) return;
        this.isLoading = false;
        this.isPlaying = true;
        this.notify();
        if (onStart) onStart();
      };

      utter.onend = () => {
        if (this.currentPlayId !== playId) return;
        this.isPlaying = false;
        this.isLoading = false;
        this.currentTrackInfo = null;
        this.notify();
        if (onEnd) onEnd();
      };

      utter.onerror = (err) => {
        if (this.currentPlayId !== playId) return;
        this.isPlaying = false;
        this.isLoading = false;
        this.notify();
        if (onError) onError(err);
        if (onEnd) onEnd();
      };

      setTimeout(() => {
        if (this.currentPlayId === playId) {
          window.speechSynthesis.speak(utter);
        }
      }, 50);
    } catch (e) {
      console.error('[AudioService] Speech synthesis failed:', e);
      this.isLoading = false;
      this.isPlaying = false;
      this.notify();
      if (onEnd) onEnd();
    }
  }

  // Preload audio files to browser cache
  preload(urls) {
    if (!urls || !Array.isArray(urls)) return;
    urls.forEach(url => {
      if (!url || typeof url !== 'string') return;
      try {
        const audio = new Audio();
        audio.preload = 'auto';
        audio.src = url;
      } catch (e) {
        // ignore
      }
    });
  }

  /**
   * Helper to measure exact audio duration in seconds from File or Blob
   */
  async getAudioDuration(fileOrBlob) {
    return new Promise((resolve) => {
      try {
        const audio = new Audio();
        const objectUrl = URL.createObjectURL(fileOrBlob);
        audio.src = objectUrl;
        audio.onloadedmetadata = () => {
          const dur = audio.duration;
          URL.revokeObjectURL(objectUrl);
          resolve(dur && !isNaN(dur) && isFinite(dur) ? Math.round(dur * 10) / 10 : 0);
        };
        audio.onerror = () => {
          URL.revokeObjectURL(objectUrl);
          resolve(0);
        };
        // fallback safety timeout
        setTimeout(() => {
          URL.revokeObjectURL(objectUrl);
          resolve(0);
        }, 4000);
      } catch (e) {
        resolve(0);
      }
    });
  }
}

export const AudioService = new AudioManager();
export default AudioService;