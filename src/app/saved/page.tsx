"use client";

import { Bookmark, RotateCcw, Search, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { SavedItem } from "@/domain/personal";
import { Input } from "@/components/motion/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/motion/tabs";
import { normalizeArabicSearch } from "@/lib/islamic/search";
import { savedRepository, STORAGE_CHANGED_EVENT } from "@/lib/storage/repositories";

const filters = [
  { value: "all", label: "الكل" },
  { value: "ayah", label: "الآيات" },
  { value: "hadith", label: "الحديث" },
  { value: "dua", label: "الدعاء والذكر" },
];

export default function SavedPage() {
  const [items, setItems] = useState<SavedItem[]>([]);
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [removed, setRemoved] = useState<SavedItem | null>(null);
  const load = useCallback(() => { void savedRepository.list().then(setItems); }, []);

  useEffect(() => {
    load();
    const onChange = () => load();
    window.addEventListener(STORAGE_CHANGED_EVENT, onChange);
    return () => window.removeEventListener(STORAGE_CHANGED_EVENT, onChange);
  }, [load]);

  const visible = useMemo(() => items.filter((item) => {
    const matchesFilter = filter === "all" || item.type === filter || (filter === "dua" && item.type === "dhikr");
    const haystack = normalizeArabicSearch(`${item.title} ${item.excerpt ?? ""} ${item.reference ?? ""}`);
    return matchesFilter && haystack.includes(normalizeArabicSearch(query));
  }), [filter, items, query]);

  const remove = async (item: SavedItem) => { await savedRepository.remove(item.id); setRemoved(item); };
  const undo = async () => { if (!removed) return; await savedRepository.save(removed); setRemoved(null); };

  return (
    <main>
      <header className="page-intro"><p className="eyebrow text-primary">المحفوظات</p><h1>ما أردت الرجوع إليه</h1><p>محفوظات الضيف خاصة بهذا الجهاز، ومنظمة لتصل إليها سريعًا.</p></header>
      <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={filter} onValueChange={setFilter} variant="underline"><TabsList className="max-w-full overflow-x-auto bg-transparent">{filters.map((item) => <TabsTrigger key={item.value} value={item.value}>{item.label}</TabsTrigger>)}</TabsList></Tabs>
        <Input value={query} onChange={setQuery} placeholder="ابحث في المحفوظات" leftIcon={<Search />} className="w-full sm:max-w-xs" />
      </div>
      {visible.length ? <div className="saved-list mt-5">{visible.map((item) => <article key={item.id} className="saved-row"><a href={item.href} className="min-w-0 flex-1"><p className="font-semibold">{item.title}</p>{item.excerpt && <p className="mt-1 line-clamp-2 text-sm leading-7 text-muted-foreground">{item.excerpt}</p>}<small className="mt-2 block text-muted-foreground">{item.provider}</small></a><button type="button" onClick={() => void remove(item)} aria-label={`حذف ${item.title}`} className="icon-action text-destructive"><Trash2 /></button></article>)}</div> : <div className="compact-empty mt-8"><Bookmark className="size-6" /><h2>لا توجد نتائج محفوظة</h2><p>{query ? "جرّب عبارة بحث أخرى." : "احفظ آية أو حديثًا أو دعاءً لتجده هنا."}</p></div>}
      {removed && <button type="button" onClick={() => void undo()} className="undo-bar"><RotateCcw className="size-4" />تراجع عن الحذف</button>}
      {items.length > 0 && <button type="button" onClick={() => void savedRepository.clear()} className="text-action mt-5 text-destructive"><Trash2 className="size-4" />مسح جميع المحفوظات</button>}
    </main>
  );
}
