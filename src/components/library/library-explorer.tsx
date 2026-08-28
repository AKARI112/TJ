"use client";

import Link from "next/link";
import { ArrowLeft, BookOpenText, FileText, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Input } from "@/components/motion/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/motion/tabs";
import type { LibraryBook, LibraryGenre } from "@/domain/library";
import { normalizeArabicSearch } from "@/lib/islamic/search";

const genres: Array<{ value: "all" | LibraryGenre; label: string }> = [{ value: "all", label: "الكل" }, { value: "tafsir", label: "التفسير" }, { value: "aqeedah", label: "العقيدة" }, { value: "fiqh", label: "الفقه" }, { value: "usul-fiqh", label: "أصول الفقه" }, { value: "seerah", label: "السيرة" }, { value: "tarikh", label: "التاريخ" }, { value: "lughah", label: "اللغة" }, { value: "general", label: "عام" }];

export function LibraryExplorer({ books, total }: { books: LibraryBook[]; total: number }) {
  const [genre, setGenre] = useState<"all" | LibraryGenre>("all");
  const [query, setQuery] = useState("");
  const visible = useMemo(() => { const needle = normalizeArabicSearch(query); return books.filter((book) => (genre === "all" || book.genre === genre) && (!needle || normalizeArabicSearch(`${book.titleArabic} ${book.titleEnglish ?? ""} ${book.authorArabic} ${book.authorEnglish ?? ""}`).includes(needle))); }, [books, genre, query]);
  return <div className="book-library"><div className="library-toolbar"><Tabs value={genre} onValueChange={(value) => setGenre(value as "all" | LibraryGenre)}><TabsList>{genres.map((item) => <TabsTrigger key={item.value} value={item.value}>{item.label}</TabsTrigger>)}</TabsList></Tabs><Input value={query} onChange={setQuery} placeholder="ابحث باسم الكتاب أو المؤلف" leftIcon={<Search />} className="w-full sm:max-w-sm" /></div><p className="library-count">يعرض {books.length.toLocaleString("ar-SA")} من أصل {total.toLocaleString("ar-SA")} كتابًا متاحًا</p><section className="book-grid" aria-label="مكتبة الكتب">{visible.map((book) => <Link href={`/library/${encodeURIComponent(book.slug)}`} key={book.slug} className="book-row"><span className="book-row-icon"><BookOpenText /></span><div><h2>{book.titleArabic}</h2><p>{book.authorArabic}{book.authorDiedHijri ? ` · ت ${book.authorDiedHijri}هـ` : ""}</p><div className="book-capabilities">{book.hasPdf && <span><FileText />PDF</span>}{book.hasText && <span>نص قابل للبحث</span>}</div></div><ArrowLeft /></Link>)}</section>{!visible.length && <div className="compact-empty">لا توجد كتب مطابقة ضمن الصفحة المحمّلة.</div>}</div>;
}
