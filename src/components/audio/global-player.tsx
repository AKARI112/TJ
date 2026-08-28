"use client";

import { Pause, Play, Repeat2, SkipBack, SkipForward, Volume2, X } from "lucide-react";
import { useEffect, useRef } from "react";
import { useAudioPlayer } from "@/stores/audio-player";

function formatTime(value: number) { if (!Number.isFinite(value)) return "0:00"; const minutes = Math.floor(value / 60); const seconds = Math.floor(value % 60); return `${minutes}:${String(seconds).padStart(2, "0")}`; }

export function GlobalAudioPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const state = useAudioPlayer();
  const { track, isPlaying, speed, volume, sleepTimerEnd, pause, toggle, next, previous } = state;

  useEffect(() => {
    const audio = audioRef.current; if (!audio || !track) return;
    if (audio.src !== track.url) audio.src = track.url;
    audio.playbackRate = speed; audio.volume = volume;
    if (isPlaying) void audio.play().catch(pause); else audio.pause();
  }, [isPlaying, pause, speed, track, volume]);

  useEffect(() => {
    if (!track || !("mediaSession" in navigator)) return;
    navigator.mediaSession.metadata = new MediaMetadata({ title: track.title, artist: track.reciter, album: track.riwayah, artwork: track.artwork ? [{ src: track.artwork }] : undefined });
    navigator.mediaSession.setActionHandler("play", toggle); navigator.mediaSession.setActionHandler("pause", toggle); navigator.mediaSession.setActionHandler("nexttrack", next); navigator.mediaSession.setActionHandler("previoustrack", previous);
    return () => { navigator.mediaSession.setActionHandler("play", null); navigator.mediaSession.setActionHandler("pause", null); navigator.mediaSession.setActionHandler("nexttrack", null); navigator.mediaSession.setActionHandler("previoustrack", null); };
  }, [next, previous, toggle, track]);

  useEffect(() => { if (!sleepTimerEnd) return; const timeout = window.setTimeout(pause, Math.max(0, sleepTimerEnd - Date.now())); return () => window.clearTimeout(timeout); }, [sleepTimerEnd, pause]);
  if (!track) return null;

  const ended = () => { if (state.repeatMode === "track" && audioRef.current) { audioRef.current.currentTime = 0; void audioRef.current.play(); } else state.next(); };
  return <aside className="global-player" aria-label="مشغل التلاوة"><audio ref={audioRef} onTimeUpdate={(event) => state.setCurrentTime(event.currentTarget.currentTime)} onDurationChange={(event) => state.setDuration(event.currentTarget.duration)} onEnded={ended} /><div className="player-track"><span className="player-art">{track.reciter.slice(0, 1)}</span><div className="min-w-0"><strong>{track.title}</strong><small>{track.reciter} · {track.riwayah}</small></div></div><div className="player-controls"><button type="button" onClick={state.previous} aria-label="السابق"><SkipForward /></button><button type="button" onClick={state.toggle} className="player-play" aria-label={isPlaying ? "إيقاف مؤقت" : "تشغيل"}>{isPlaying ? <Pause /> : <Play />}</button><button type="button" onClick={state.next} aria-label="التالي"><SkipBack /></button></div><div className="player-progress"><span>{formatTime(state.currentTime)}</span><input type="range" min={0} max={state.duration || 1} value={Math.min(state.currentTime, state.duration || 1)} onChange={(event) => { const value = Number(event.target.value); if (audioRef.current) audioRef.current.currentTime = value; state.setCurrentTime(value); }} aria-label="موضع التشغيل" /><span>{formatTime(state.duration)}</span></div><div className="player-secondary"><button type="button" onClick={() => state.setRepeatMode(state.repeatMode === "off" ? "track" : state.repeatMode === "track" ? "queue" : "off")} aria-label="وضع التكرار" data-active={state.repeatMode !== "off"}><Repeat2 /></button><Volume2 /><input type="range" min={0} max={1} step={0.05} value={state.volume} onChange={(event) => state.setVolume(Number(event.target.value))} aria-label="مستوى الصوت" /><button type="button" onClick={state.pause} aria-label="إغلاق المشغل"><X /></button></div></aside>;
}
