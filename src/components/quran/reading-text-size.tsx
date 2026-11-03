"use client";

import { Minus, Plus, Type } from "lucide-react";
import { useEffect, useState } from "react";

const sizes = [90, 100, 115, 130] as const;
const KEY = "dhu-al-jalal:preferences";

export function ReadingTextSize() {
  const [size, setSize] = useState<number>(100);
  useEffect(() => {
    try {
      const parsed = JSON.parse(localStorage.getItem(KEY) ?? "{}");
      const saved = Number(parsed.quranSize);
      if (sizes.some((item) => item === saved)) setSize(saved);
    } catch { /* Use the default when preferences are unreadable. */ }
  }, []);
  useEffect(() => {
    document.documentElement.style.setProperty("--quran-reading-scale", String(size / 100));
    return () => { document.documentElement.style.removeProperty("--quran-reading-scale"); };
  }, [size]);

  function update(nextSize: number) {
    if (!sizes.some((item) => item === nextSize)) return;
    setSize(nextSize);
    try {
      const stored = JSON.parse(localStorage.getItem(KEY) ?? "{}");
      localStorage.setItem(KEY, JSON.stringify({ ...stored, quranSize: String(nextSize) }));
    } catch {
      localStorage.setItem(KEY, JSON.stringify({ quranSize: String(nextSize) }));
    }
  }

  const index = sizes.findIndex((value) => value === size);
  return <div className="inline-flex items-center gap-1 rounded-xl border border-border bg-card p-1" aria-label="حجم نص بطاقات الآيات">
    <Type className="mx-1 size-4 text-muted-foreground" aria-hidden="true" />
    <button type="button" aria-label="تصغير حجم نص الآيات" className="grid size-9 place-items-center rounded-lg hover:bg-muted disabled:opacity-40" disabled={index <= 0} onClick={() => update(sizes[Math.max(0, index - 1)])}><Minus className="size-4" /></button>
    <output aria-live="polite" className="min-w-10 text-center text-xs tabular-nums">{size}%</output>
    <button type="button" aria-label="تكبير حجم نص الآيات" className="grid size-9 place-items-center rounded-lg hover:bg-muted disabled:opacity-40" disabled={index >= sizes.length - 1} onClick={() => update(sizes[Math.min(sizes.length - 1, index + 1)])}><Plus className="size-4" /></button>
  </div>;
}
