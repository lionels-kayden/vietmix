"use client";

import React, { useState, useEffect, useRef } from "react";

export function BgmPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.15); // Soft & gentle by default (15%)
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Sync volume with audio element
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Sync state with native audio events
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);

    return () => {
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
    };
  }, []);

  // Auto-play on enter web + fallback to first user interaction
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Check if user previously explicitly turned off music in this session
    const isMuted = typeof window !== "undefined" && sessionStorage.getItem("vietmix_bgm_user_muted") === "true";
    if (isMuted) return;

    let isCleanedUp = false;
    let cleanupListeners: (() => void) | null = null;

    const startAudio = async () => {
      if (isCleanedUp) return;
      if (typeof window !== "undefined" && sessionStorage.getItem("vietmix_bgm_user_muted") === "true") {
        if (cleanupListeners) cleanupListeners();
        return;
      }
      try {
        audio.volume = volume;
        if (typeof audio.play === "function") {
          const promise = audio.play();
          if (promise !== undefined) {
            await promise;
          }
        }
        setIsPlaying(true);
        if (cleanupListeners) cleanupListeners();
      } catch {
        // Autoplay policy prevented immediate unmuted playback -> will retry on first user interaction
      }
    };

    // 1. Try immediate autoplay on page enter
    startAudio().catch(() => {});

    // 2. Also register one-time listeners for first user gesture if browser blocked immediate autoplay
    const events = ["pointerdown", "click", "touchstart", "keydown"];
    const onFirstGesture = () => {
      startAudio().catch(() => {});
      if (cleanupListeners) cleanupListeners();
    };

    cleanupListeners = () => {
      if (typeof window !== "undefined") {
        events.forEach((evt) => window.removeEventListener(evt, onFirstGesture));
      }
    };

    if (typeof window !== "undefined") {
      events.forEach((evt) => window.addEventListener(evt, onFirstGesture, { passive: true }));
    }

    return () => {
      isCleanedUp = true;
      if (cleanupListeners) cleanupListeners();
    };
  }, [volume]);

  // Toggle playback
  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      // User explicitly turned off music
      if (typeof window !== "undefined") {
        sessionStorage.setItem("vietmix_bgm_user_muted", "true");
      }
      if (typeof audio.pause === "function") {
        audio.pause();
      }
      setIsPlaying(false);
    } else {
      // User explicitly turned on music
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("vietmix_bgm_user_muted");
      }
      audio.volume = volume;
      if (typeof audio.play === "function") {
        try {
          const promise = audio.play();
          if (promise !== undefined) {
            await promise;
          }
          setIsPlaying(true);
        } catch (err) {
          console.warn("BGM playback blocked or error:", err);
          setIsPlaying(false);
        }
      } else {
        setIsPlaying(true);
      }
    }
  };

  // Update volume
  const handleVolumeChange = (newVol: number) => {
    const clamped = Math.max(0, Math.min(1, newVol));
    setVolume(clamped);
    if (audioRef.current) {
      audioRef.current.volume = clamped;
    }
  };

  return (
    <aside
      aria-label="Điều khiển nhạc nền truyền thống"
      className="fixed bottom-4 right-4 z-40 flex items-center gap-2 select-none"
    >
      {/* Hidden audio element with dual format support for universal browser compatibility */}
      <audio
        ref={audioRef}
        loop
        preload="metadata"
        data-testid="bgm-audio-element"
      >
        <source src="/assets/audio/inh-la-oi.mp3" type="audio/mpeg" />
        <source src="/assets/audio/inh-la-oi.m4a" type="audio/mp4" />
      </audio>

      {/* Volume slider popover */}
      {showVolumeSlider && (
        <div
          data-testid="bgm-volume-popover"
          className="flex items-center gap-2 bg-white/95 backdrop-blur-md px-3 py-2 rounded-2xl border border-[var(--border-paper)] shadow-lg animate-in fade-in"
        >
          <span className="text-xs text-[var(--ink-muted)]">Âm lượng</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
            className="w-20 accent-[var(--red-lacquer)] cursor-pointer h-1.5"
            aria-label="Thanh điều chỉnh âm lượng nhạc nền"
          />
          <span className="text-xs font-mono font-medium text-[var(--ink-text)] w-8 text-right">
            {Math.round(volume * 100)}%
          </span>
        </div>
      )}

      {/* Floating Toggle Button */}
      <div className="flex items-center">
        <button
          type="button"
          onClick={togglePlay}
          data-testid="btn-toggle-bgm"
          title={isPlaying ? "Tắt nhạc: Inh Lả Ơi (Dân ca Thái)" : "Bật nhạc: Inh Lả Ơi (Dân ca Thái)"}
          aria-label={isPlaying ? "Tắt nhạc nền (Inh Lả Ơi)" : "Bật nhạc nền (Inh Lả Ơi)"}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-full border shadow-md transition-all cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--red-lacquer)] ${
            isPlaying
              ? "bg-[var(--red-lacquer)] text-white border-[var(--red-lacquer)] shadow-red-900/20"
              : "bg-white/95 backdrop-blur-md text-[var(--ink-text)] border-[var(--border-paper)] hover:border-[var(--red-lacquer)] hover:text-[var(--red-lacquer)]"
          }`}
        >
          {/* Animated sound bars or mute icon */}
          {isPlaying ? (
            <span className="flex items-end gap-0.5 h-3.5 w-3.5" aria-hidden="true">
              <span className="w-1 bg-white rounded-full animate-bounce [animation-delay:-0.3s] h-3" />
              <span className="w-1 bg-white rounded-full animate-bounce [animation-delay:-0.15s] h-2" />
              <span className="w-1 bg-white rounded-full animate-bounce h-3.5" />
            </span>
          ) : (
            <span className="text-sm" aria-hidden="true">
              🎵
            </span>
          )}

          <span className="text-xs font-semibold">
            {isPlaying ? "Nhạc nhẹ: Inh Lả Ơi" : "Nhạc nền"}
          </span>
        </button>

        {/* Volume Settings Toggle */}
        <button
          type="button"
          onClick={() => setShowVolumeSlider((prev) => !prev)}
          data-testid="btn-bgm-volume-toggle"
          aria-label="Mở thanh chỉnh âm lượng nhạc nền"
          className="ml-1 p-2 rounded-full bg-white/90 border border-[var(--border-paper)] text-[var(--ink-muted)] hover:text-[var(--ink-text)] shadow-sm cursor-pointer transition-colors"
        >
          <span className="text-xs" aria-hidden="true">⚙️</span>
        </button>
      </div>
    </aside>
  );
}
