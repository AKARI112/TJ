import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BookOpenText, ExternalLink, FileText } from "lucide-react";
import { getLibraryBook, getLibraryBookText, libraryPdfUrl } from "@/lib/islamic/providers/library/islamic-app";
import { findIslamicSnapshotBook, findMatchingTurathBook } from "@/lib/islamic/providers/library/catalog-snapshots";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ view?: string; section?: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = (await params).slug;
  const local = findIslamicSnapshotBook(slug);
  if (local) return { title: local.titleArabic, description: `كتاب ${local.titleArabic} لـ${local.authorArabic}، من فهرس Islamic App.` };
  try {
    const book = await getLibraryBook(slug);
    return { title: book.titleArabic, description: book.descriptionArabic ?? `كتاب ${book.titleArabic} لـ${book.authorArabic}.` };
  } catch { return { title: "كتاب غير موجود" }; }
}

export default async function LibraryBookPage({ params, searchParams }: Props) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  let book;
  try { book = await getLibraryBook(slug); }
  catch {
    const local = findIslamicSnapshotBook(slug);
    if (!local) notFound();
    const externalUrl = `https://islamic.app/library/${encodeURIComponent(slug)}`;
    const alternative = findMatchingTurathBook(local.titleArabic, local.authorArabic);
    return <main className="book-detail">
      <header className="page-intro">
        <p className="eyebrow text-accent">المكتبة · Islamic App</p>
        <h1>{local.titleArabic}</h1>
        <p>{local.authorArabic}</p>
      </header>
      <section className="rounded-2xl border border-border bg-card p-6">
        <BookOpenText className="mb-3 size-7 text-primary" aria-hidden="true" />
        <h2 className="text-xl font-bold">بيانات الكتاب محفوظة في الفهرس المحلي</h2>
        <p className="mt-3 text-sm leading-7 text-muted-foreground">فهرس Islamic App يوفر بيانات هذا الكتاب، لكن النص الكامل غير متاح لخادمنا حاليًا. إذا توفرت نسخة مطابقة في تراث، يمكنك قراءتها هنا مباشرة مع إظهار مصدرها وطبعتها. وقد تختلف النسختان في الصفحات والتحقيق.</p>
        <div className="mt-5 flex flex-wrap gap-3">
          {alternative && <a href={`/library/turath/${alternative.id}`} className="primary-link"><BookOpenText className="size-4" />قراءة مباشرة داخل ذُو الجلال · نسخة تراث</a>}
          <a href={externalUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border px-4 font-semibold"><ExternalLink className="size-4" />فتح نسخة Islamic App الأصلية</a>
          {!alternative && <a href={`/library?source=turath&q=${encodeURIComponent(local.titleArabic)}`} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border px-4 font-semibold"><BookOpenText className="size-4" />البحث عن نسخة في تراث</a>}
          <a href="/library" className="inline-flex min-h-11 items-center rounded-xl border border-border px-4 font-semibold">العودة إلى المكتبة</a>
        </div>
      </section>
    </main>;
  }
  const view = query.view === "text" && book.hasText ? "text" : book.hasPdf ? "pdf" : "text";
  let text = null; if (view === "text" && book.hasText) { try { text = await getLibraryBookText(slug); } catch { text = null; } }
  const sectionPage = Math.max(1, Number(query.section) || 1); const pageSize = 12; const chapters = text?.chapters.slice((sectionPage - 1) * pageSize, sectionPage * pageSize) ?? []; const totalPages = text ? Math.ceil(text.chapters.length / pageSize) : 0;
  return <main className="book-detail"><header className="page-intro"><p className="eyebrow text-accent">{book.genre}</p><h1>{book.titleArabic}</h1><p>{book.authorArabic}{book.authorDiedHijri ? ` · توفي ${book.authorDiedHijri}هـ` : ""}</p>{book.descriptionArabic && <p>{book.descriptionArabic}</p>}</header><div className="book-view-switch">{book.hasPdf && <a href={`/library/${encodeURIComponent(slug)}?view=pdf`} aria-current={view === "pdf" ? "page" : undefined}><FileText />نسخة PDF</a>}{book.hasText && <a href={`/library/${encodeURIComponent(slug)}?view=text`} aria-current={view === "text" ? "page" : undefined}><BookOpenText />النص المقروء</a>}</div>{view === "pdf" && book.hasPdf ? <section className="pdf-reader"><iframe src={libraryPdfUrl(slug)} title={`${book.titleArabic} — نسخة PDF`} loading="lazy" /><a href={libraryPdfUrl(slug)} target="_blank" rel="noreferrer">فتح PDF في نافذة مستقلة <ExternalLink /></a></section> : text ? <section className="ebook-reader"><div className="ebook-meta"><span>{text.source === "turath" ? "Turath" : "OpenITI"}</span><span>{text.chapterCount.toLocaleString("ar-SA")} فصلًا · {text.pageCount.toLocaleString("ar-SA")} صفحة مصدرية</span></div>{chapters.map((chapter, index) => <article key={`${chapter.page ?? index}-${chapter.title}`}><header><h2>{chapter.title || "نص الكتاب"}</h2><small>{chapter.volume ? `المجلد ${chapter.volume} · ` : ""}{chapter.page ? `ص ${chapter.page}` : ""}</small></header><p>{chapter.text}</p></article>)}<nav className="ebook-pagination" aria-label="صفحات النص">{sectionPage > 1 && <a href={`/library/${encodeURIComponent(slug)}?view=text&section=${sectionPage - 1}`}>السابق</a>}<span>{sectionPage.toLocaleString("ar-SA")} / {totalPages.toLocaleString("ar-SA")}</span>{sectionPage < totalPages && <a href={`/library/${encodeURIComponent(slug)}?view=text&section=${sectionPage + 1}`}>التالي</a>}</nav></section> : <div className="compact-empty"><BookOpenText /><h2>لا توجد نسخة قابلة للقراءة حاليًا</h2><p>يعرض التطبيق فقط الصيغ التي يصرح المصدر بتوفرها.</p></div>}<footer className="content-attribution"><span>المصدر الرئيسي: Islamic App</span><div>{book.sources.map((source) => source.url ? <a key={source.name} href={source.url} target="_blank" rel="noreferrer">{source.name}</a> : <span key={source.name}>{source.name}</span>)}</div></footer></main>;
}
