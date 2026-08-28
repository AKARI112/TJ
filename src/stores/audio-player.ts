"use client";

import { create } from "zustand";
import type { AudioRepeatMode, AudioTrack } from "@/domain/audio";

interface AudioPlayerState {
  track: AudioTrack | null;
  queue: AudioTrack[];
  currentIndex: number;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  speed: number;
  volume: number;
  repeatMode: AudioRepeatMode;
  repeatCount: number;
  sleepTimerEnd: number | null;
  play: (track: AudioTrack, queue?: AudioTrack[]) => void;
  toggle: () => void;
  pause: () => void;
  clear: () => void;
  next: () => void;
  previous: () => void;
  setCurrentTime: (value: number) => void;
  setDuration: (value: number) => void;
  setSpeed: (value: number) => void;
  setVolume: (value: number) => void;
  setRepeatMode: (value: AudioRepeatMode) => void;
  setSleepTimer: (minutes: number | null) => void;
}

export const useAudioPlayer = create<AudioPlayerState>((set) => ({
  track: null, queue: [], currentIndex: -1, isPlaying: false, currentTime: 0, duration: 0, speed: 1, volume: 1, repeatMode: "off", repeatCount: 0, sleepTimerEnd: null,
  play: (track, queue = [track]) => set({ track, queue, currentIndex: Math.max(0, queue.findIndex((item) => item.id === track.id)), isPlaying: true, currentTime: 0, duration: 0 }),
  toggle: () => set((state) => ({ isPlaying: Boolean(state.track) && !state.isPlaying })),
  pause: () => set({ isPlaying: false }),
  clear: () => set({ track: null, queue: [], currentIndex: -1, isPlaying: false, currentTime: 0, duration: 0 }),
  next: () => set((state) => { const nextIndex = state.currentIndex + 1; if (nextIndex < state.queue.length) return { currentIndex: nextIndex, track: state.queue[nextIndex], currentTime: 0, duration: 0, isPlaying: true }; if (state.repeatMode === "queue" && state.queue.length) return { currentIndex: 0, track: state.queue[0], currentTime: 0, duration: 0, isPlaying: true }; return { isPlaying: false }; }),
  previous: () => set((state) => { const previousIndex = state.currentIndex - 1; if (previousIndex >= 0) return { currentIndex: previousIndex, track: state.queue[previousIndex], currentTime: 0, duration: 0, isPlaying: true }; return { currentTime: 0 }; }),
  setCurrentTime: (currentTime) => set({ currentTime }), setDuration: (duration) => set({ duration }), setSpeed: (speed) => set({ speed }), setVolume: (volume) => set({ volume }), setRepeatMode: (repeatMode) => set({ repeatMode }),
  setSleepTimer: (minutes) => set({ sleepTimerEnd: minutes ? Date.now() + minutes * 60_000 : null }),
}));
