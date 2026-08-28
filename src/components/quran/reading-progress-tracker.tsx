"use client";

import { useEffect } from "react";
import type { QuranVerse } from "@/domain/quran";
import { historyRepository, progressRepository } from "@/lib/storage/repositories";

export function ReadingProgressTracker({ verses, chapterName }: { verses: QuranVerse[]; chapterName: string }) {
  useEffect(() => {
    const observed = new Map<Element, number>();
    let timer = 0;
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) observed.set(entry.target, entry.intersectionRatio);
      const visible = [...observed.entries()].sort((a, b) => b[1] - a[1])[0];
      if (!visible || visible[1] < 0.42) return;
      const verseNumber = Number((visible[0] as HTMLElement).dataset.verse);
      const verse = verses.find((item) => item.verseNumber === verseNumber);
      if (!verse) return;
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        void progressRepository.save({
          id: "quran-current",
          chapterId: verse.chapterId,
          chapterName,
          verseNumber: verse.verseNumber,
          pageNumber: verse.page,
          mushafId: 1,
          readingMode: "reading",
          timestamp: new Date().toISOString(),
        });
      }, 900);
    }, { threshold: [0.42, 0.7] });

    for (const verse of verses) {
      const element = document.getElementById(`ayah-${verse.verseNumber}`);
      if (element) observer.observe(element);
    }
    void historyRepository.record({ id: `quran-${verses[0]?.chapterId ?? 0}`, type: "quran", title: chapterName, href: `/quran/${verses[0]?.chapterId ?? 1}`, viewedAt: new Date().toISOString() });

    return () => { window.clearTimeout(timer); observer.disconnect(); };
  }, [chapterName, verses]);

  return null;
}
