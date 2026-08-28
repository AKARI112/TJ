"use client";

import { useEffect, useMemo, useState } from "react";
import { Bookmark, Check, ChevronLeft, ChevronRight, Copy, RotateCcw, Share2 } from "lucide-react";
import type { DevotionalCategory } from "@/domain/devotional";
import { adhkarSessionRepository, historyRepository, savedRepository } from "@/lib/storage/repositories";
import { Button } from "@/components/ui/button";
import { ShareComposer } from "@/components/share/share-composer";

export function DhikrSession({ category }: { category: DevotionalCategory }) {
  const [index, setIndex] = useState(0);
  const [count, setCount] = useState(0);
  const [completed, setCompleted] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);
  const [feedback, setFeedback] = useState("");
  const item = category.items[index];
  const targetCount = item.repeatCount;

  useEffect(() => {
    void adhkarSessionRepository.get(category.slug).then((session) => {
      if (!session) return;
      setIndex(Math.min(session.itemIndex, category.items.length - 1));
      setCount(session.count);
      setCompleted(session.completedItemIds);
    });
    void historyRepository.record({ id: `adhkar:${category.slug}`, type: "adhkar", title: category.label, href: `/adhkar/${category.slug}/${category.items[0]?.id ?? ""}`, viewedAt: new Date().toISOString() });
  }, [category.items, category.items.length, category.label, category.slug]);

  useEffect(() => { void savedRepository.get(`dhikr:${item.id}`).then((record) => setSaved(Boolean(record))); }, [item.id]);

  const progress = useMemo(() => Math.round((completed.length / category.items.length) * 100), [category.items.length, completed.length]);
  const persist = (nextIndex: number, nextCount: number, nextCompleted: string[]) => adhkarSessionRepository.save({ id: `adhkar:${category.slug}`, category: category.slug, itemId: category.items[nextIndex].id, itemIndex: nextIndex, count: nextCount, completedItemIds: nextCompleted, updatedAt: new Date().toISOString() });

  function select(nextIndex: number) { const safe = Math.max(0, Math.min(category.items.length - 1, nextIndex)); setIndex(safe); setCount(0); setFeedback(""); void persist(safe, 0, completed); }
  function increment() {
    if (count >= targetCount) return;
    const nextCount = count + 1;
    const nextCompleted = nextCount >= targetCount && !completed.includes(item.id) ? [...completed, item.id] : completed;
    setCount(nextCount); setCompleted(nextCompleted);
    if (nextCount >= targetCount && navigator.vibrate) navigator.vibrate(24);
    void persist(index, nextCount, nextCompleted);
  }
  async function toggleSave() {
    const id = `dhikr:${item.id}`;
    if (saved) await savedRepository.remove(id); else await savedRepository.save({ id, type: category.kind === "dua" ? "dua" : "dhikr", title: `${category.label} · ${item.position}`, excerpt: item.arabic, href: category.kind === "dua" ? `/dua/${item.id}?category=${category.slug}` : `/adhkar/${category.slug}/${item.id}`, provider: item.provider, sourceUrl: item.sourceUrl, reference: item.source, createdAt: new Date().toISOString() });
    setSaved(!saved); setFeedback(saved ? "أُزيل من المحفوظات" : "حُفظ");
  }
  async function share() { const text = `${item.arabic}\n\n${item.source}\nذُو الجَلاَلْ`; if (navigator.share) await navigator.share({ title: category.label, text }); else { await navigator.clipboard.writeText(text); setFeedback("نُسخ النص للمشاركة"); } }

  return <section className="dhikr-session" aria-labelledby="dhikr-current-title">
    <div className="dhikr-progress" aria-label={`أنجزت ${completed.length} من ${category.items.length}`}><span style={{ inlineSize: `${progress}%` }} /><small>{completed.length} / {category.items.length}</small></div>
    <header className="dhikr-meta"><div><p className="eyebrow">{category.label}</p><h2 id="dhikr-current-title">الذكر {item.position} من {category.items.length}</h2></div><span className="source-chip">{item.source}</span></header>
    <p className={`dhikr-arabic ${item.isQuran ? "quran-devotional" : ""}`} lang="ar" dir="rtl" translate={item.isQuran ? "no" : undefined}>{item.arabic}</p>
    <div className="dhikr-counter-wrap"><button type="button" className={`dhikr-counter ${count >= targetCount ? "is-complete" : ""}`} onClick={increment} aria-label={item.repeatCountSourced ? `العدّاد: ${count} من ${targetCount}` : `متابعة قراءة الذكر: ${count}`}><strong>{count}</strong><span>{item.repeatCountSourced ? `من ${targetCount}` : "قراءة للمتابعة"}</span>{count >= targetCount && <Check aria-hidden="true" />}</button><Button variant="ghost" size="icon" onClick={() => { const nextCompleted = completed.filter((id) => id !== item.id); setCount(0); setCompleted(nextCompleted); void persist(index, 0, nextCompleted); }} aria-label="تصفير عداد الذكر"><RotateCcw /></Button></div>
    <div className="dhikr-actions"><Button variant="outline" onClick={() => void toggleSave()}><Bookmark className={saved ? "fill-current" : ""} />{saved ? "محفوظ" : "حفظ"}</Button><Button variant="outline" onClick={() => void navigator.clipboard.writeText(item.arabic).then(() => setFeedback("تم النسخ"))}><Copy />نسخ</Button><Button variant="outline" onClick={() => void share()}><Share2 />مشاركة</Button></div>
    <div className="dhikr-image-action"><ShareComposer text={item.arabic} reference={item.source} title={`${category.label} · ${item.position}`} quran={item.isQuran} compact={false} /></div>
    <nav className="dhikr-nav" aria-label="التنقل بين الأذكار"><Button variant="ghost" disabled={index === 0} onClick={() => select(index - 1)}><ChevronRight />السابق</Button><div className="dhikr-dots" aria-hidden="true">{category.items.map((entry, entryIndex) => <span key={entry.id} className={entryIndex === index ? "is-current" : completed.includes(entry.id) ? "is-done" : ""} />)}</div><Button variant="ghost" disabled={index === category.items.length - 1} onClick={() => select(index + 1)}>التالي<ChevronLeft /></Button></nav>
    <p className="sr-status" aria-live="polite">{feedback}</p><footer className="content-attribution"><span>المصدر: {item.source} · {item.provider}</span><a href={item.sourceUrl} target="_blank" rel="noreferrer">عرض مجموعة البيانات</a></footer>
  </section>;
}
