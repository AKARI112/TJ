"use client";

import { Pause, Play, Search } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import type { Reciter } from "@/domain/audio";
import { normalizeArabicSearch } from "@/lib/islamic/search";

export function ReciterBrowser({ reciters }: { reciters: Reciter[] }) {
  const [query, setQuery] = useState(""); const [playing, setPlaying] = useState<string | null>(null); const audio = useRef<HTMLAudioElement>(null);
  const visible = useMemo(() => reciters.filter((r) => normalizeArabicSearch(r.name).includes(normalizeArabicSearch(query))), [query, reciters]);
  const play = async (reciter: Reciter) => { const m = reciter.moshaf[0]; if (!m || !m.availableSurahs.includes(1)) return; const url = `${m.server.replace(/\/$/, "")}/001.mp3`; if (playing === url) { audio.current?.pause(); setPlaying(null); return; } if (audio.current) { audio.current.src = url; await audio.current.play(); setPlaying(url); } };
  return <><label className="search-field"><Search className="size-4" /><span className="sr-only">ابحث عن قارئ</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="ابحث باسم القارئ" /></label><audio ref={audio} onEnded={() => setPlaying(null)} /><div className="reciter-grid">{visible.map((reciter) => { const m = reciter.moshaf[0]; const url = m ? `${m.server.replace(/\/$/, "")}/001.mp3` : ""; return <article className="reciter-card" key={reciter.id}><div className="reciter-avatar">{reciter.name.slice(0, 1)}</div><div className="min-w-0 flex-1"><h2>{reciter.name}</h2><p>{m?.name ?? "لا تتوفر رواية حاليًا"}</p></div><button onClick={() => play(reciter)} disabled={!m?.availableSurahs.includes(1)} aria-label={`تشغيل سورة الفاتحة بصوت ${reciter.name}`}>{playing === url ? <Pause /> : <Play />}</button></article>; })}</div><p className="source-line">المصدر: <a href="https://mp3quran.net/ar/api" target="_blank" rel="noreferrer">MP3Quran API v3</a></p></>;
}
