"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { Bookmark, Search } from "lucide-react";
import type { DevotionalCategory } from "@/domain/devotional";
import { Input } from "@/components/motion/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/motion/tabs";
import { savedRepository } from "@/lib/storage/repositories";
import { normalizeArabicSearch } from "@/lib/islamic/search";

export function DuaLibrary({ categories }: { categories: DevotionalCategory[] }) {
  const [active, setActive] = useState<string>(categories[0]?.slug ?? "daily-dua"); const [query, setQuery] = useState("");
  const category = categories.find((entry) => entry.slug === active) ?? categories[0];
  const items = useMemo(() => { const normalized = normalizeArabicSearch(query.trim()); if (!normalized) return category.items; return category.items.filter((item) => normalizeArabicSearch(`${item.arabic} ${item.source} ${item.title}`).includes(normalized)); }, [category, query]);
  return <div className="dua-library"><div className="library-toolbar"><Tabs value={active} onValueChange={setActive}><TabsList>{categories.map((entry) => <TabsTrigger key={entry.slug} value={entry.slug}>{entry.label}</TabsTrigger>)}</TabsList></Tabs><Input value={query} onChange={setQuery} placeholder="ابحث في نص الدعاء أو المصدر" leftIcon={<Search />} className="w-full sm:max-w-sm" /></div>
    <div className="devotional-list">{items.map((item) => <article key={item.id} className="devotional-row"><div className="devotional-row-head"><span>{category.label} · {item.position}</span><button type="button" aria-label="حفظ الدعاء" onClick={() => void savedRepository.save({ id: `dua:${item.id}`, type: "dua", title: `${category.label} · ${item.position}`, excerpt: item.arabic, href: `/dua/${item.id}?category=${category.slug}`, provider: item.provider, sourceUrl: item.sourceUrl, reference: item.source, createdAt: new Date().toISOString() })}><Bookmark /></button></div><p lang="ar" dir="rtl">{item.arabic}</p><footer><span>{item.source}</span><Link href={`/dua/${item.id}?category=${category.slug}`}>عرض الدعاء</Link></footer></article>)}</div>{!items.length && <p className="compact-empty">لا توجد نتائج مطابقة.</p>}</div>;
}
