"use client";

import { Bookmark, Check, Copy, Share2 } from "lucide-react";
import { useState } from "react";
import type { QuranVerse } from "@/domain/quran";

export function VerseTools({ verse, chapterName }: { verse: QuranVerse; chapterName: string }) {
  const [copied, setCopied] = useState(false); const [saved, setSaved] = useState(false);
  const label = `${verse.textUthmani} — ${chapterName}، الآية ${verse.verseNumber}`;
  const copy = async () => { await navigator.clipboard.writeText(label); setCopied(true); window.setTimeout(() => setCopied(false), 1600); };
  const save = () => {
    const key = "dhu-al-jalal:saved"; const list = JSON.parse(localStorage.getItem(key) ?? "[]") as unknown[];
    localStorage.setItem(key, JSON.stringify([...list, { id: `ayah-${verse.chapterId}-${verse.verseNumber}`, type: "ayah", title: label, provider: verse.provider, createdAt: new Date().toISOString() }])); setSaved(true);
  };
  const share = async () => { if (navigator.share) await navigator.share({ title: `${chapterName} ${verse.verseNumber}`, text: label, url: location.href }); else await copy(); };
  return <div className="verse-tools"><button onClick={copy} aria-label="نسخ الآية">{copied ? <Check /> : <Copy />}</button><button onClick={save} aria-label="حفظ الآية" aria-pressed={saved}>{saved ? <Check /> : <Bookmark />}</button><button onClick={share} aria-label="مشاركة الآية"><Share2 /></button></div>;
}
