import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowRight, BookOpenText, ExternalLink } from "lucide-react";
import { findTurathSnapshotBook } from "@/lib/islamic/providers/library/catalog-snapshots";
import { getTurathReadingPage } from "@/lib/islamic/providers/library/turath-reader";
import { TurathReadingMarker } from "@/components/library/turath-reading-marker";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ bookId: string }>;
  searchParams: Promise<{ page?: string | string[] }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const id = Number((await params).bookId);
  const book = findTurathSnapshotBook(id);
  return {
    title: book ? `قراءة ${book.title}` : "الكتاب غير موجود",
    description: book ? `صفحات كتاب ${book.title} من مكتبة تراث، مع ذكر مصدر النص وأرقام الصفحات.` : undefined,
  };
}

export default async function TurathBookPage({ params, searchParams }: Props) {
  const [{ bookId }, query] = await Promise.all([params, searchParams]);
  const id = Number(bookId);
  if (!/^[1-9]\d*$/.test(bookId) || !Number.isSafeInteger(id)) notFound();

  const book = findTurathSnapshotBook(id);
  if (!book) notFound();

  const requested = Array.isArray(query.page) ? "" : query.page ?? "1";
  const page = Number(requested);
  if (!/^[1-9]\d*$/.test(requested) || !Number.isSafeInteger(page) || page > 250000) notFound();

  let reading;
  try {
    reading = await getTurathReadingPage(id, page);
  } catch {
    // Never invent missing pages, a false book body or a misleading page number.
    return <main className="mx-auto max-w-4xl">
      <nav className="mb-6">
        <a href="/library?source=turath" className="inline-flex items-center gap-2 text-sm text-muted-foreground"><ArrowRight className="size-4" />عودة إلى كتب تراث</a>
      </nav>
      <header className="page-intro">
        <p className="eyebrow text-accent">مكتبة تراث</p><h1>{book.title}</h1><p>{book.author}</p>
      </header>
      <section className="rounded-2xl border border-border bg-card p-6">
        <BookOpenText className="mb-3 size-6 text-primary" />
        <h2 className="text-xl font-bold">تعذر جلب صفحة الكتاب حاليًا</h2>
        <p className="mt-2 text-sm leading-7 text-muted-foreground">لم يُرجع مصدر تراث نصًا صالحًا لهذه الصفحة. لا نعرض نصًا بديلًا أو صفحة غير موثقة. يمكنك المحاولة مجددًا أو فتحها لدى المصدر.</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <a href={`/library/turath/${id}?page=${page}`} className="primary-link">إعادة المحاولة</a>
          <a href={`${book.sourceUrl}?page=${page}`} rel="noopener noreferrer" target="_blank" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border px-4 text-sm font-semibold"><ExternalLink className="size-4" />قراءة لدى تراث</a>
        </div>
      </section>
    </main>;
  }

  return <main className="mx-auto max-w-4xl">
    <nav className="mb-6">
      <a href="/library?source=turath" className="inline-flex min-h-10 items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowRight className="size-4" />فهرس كتب تراث</a>
    </nav>
    <header className="page-intro">
      <p className="eyebrow text-accent">مكتبة تراث · قارئ داخلي</p>
      <h1>{reading.bookName}</h1>
      <p>{reading.authorName ?? book.author}</p>
      <p className="text-xs text-muted-foreground">مصدر النص: تراث (Nuqayah). قد تختلف الطبعة والترقيم عن مصادر أخرى.</p>
    </header>

    <div className="mb-5 rounded-2xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold">
          صفحة تراث الداخلية {page.toLocaleString("ar-SA")}
          {reading.volume && ` · المجلد ${reading.volume}`}
          {reading.printedPage !== null && ` · الصفحة المطبوعة ${reading.printedPage.toLocaleString("ar-SA")}`}
        </p>
        <a href={reading.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center gap-2 text-xs font-semibold text-primary"><ExternalLink className="size-4" />عرض الصفحة لدى المصدر</a>
      </div>
      <div className="mt-3"><TurathReadingMarker bookId={id} page={page} /></div>
    </div>

    <article lang="ar" dir="rtl" className="ebook-reader rounded-2xl border border-border bg-card px-4 py-6 sm:px-8 sm:py-10">
      {reading.headings.length > 0 && <header className="mb-6 border-b border-border pb-4">
        {reading.headings.slice(-3).map((heading, index) => (
          <h2 key={index} className={index === reading.headings.length - 1 ? "text-lg font-bold leading-9" : "text-sm leading-7 text-muted-foreground"}>{heading}</h2>
        ))}
      </header>}
      <p className="whitespace-pre-wrap break-words text-[1.1rem] leading-[2.15] text-foreground sm:text-[1.2rem]">
        {reading.text}
      </p>
    </article>

    <nav aria-label="التنقل في صفحات الكتاب" className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4">
      {page > 1 ? <a href={`/library/turath/${id}?page=${page - 1}`} className="min-h-11 rounded-xl border border-border px-4 py-3 text-sm font-semibold">الصفحة السابقة</a> : <span />}
      <form action={`/library/turath/${id}`} method="get" className="flex items-center gap-2 text-sm">
        <label htmlFor="turath-page-jump">انتقل إلى صفحة تراث</label>
        <input id="turath-page-jump" type="number" name="page" min={1} max={250000} defaultValue={page} className="min-h-11 w-20 rounded-xl border border-input bg-background px-2 text-center" />
        <button type="submit" className="min-h-11 rounded-xl bg-primary px-3 font-semibold text-primary-foreground">انتقال</button>
      </form>
      <a href={`/library/turath/${id}?page=${page + 1}`} className="min-h-11 rounded-xl border border-border px-4 py-3 text-sm font-semibold">الصفحة التالية</a>
    </nav>

    <p className="mt-6 text-xs leading-7 text-muted-foreground">الصفحات تُجلب عند الطلب من المصدر ولا تُخزن كنسخة كاملة من الكتاب. الرجاء الرجوع إلى النسخة المحققة عند التوثيق العلمي.</p>
  </main>;
}
