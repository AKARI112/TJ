import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowRight, BookOpenText, ExternalLink } from "lucide-react";
import { readShamelaPage, ShamelaSourceError } from "@/lib/islamic/providers/library/quran-gallery";

export const metadata: Metadata = {
  title: "قراءة صفحة من المكتبة الشاملة",
  description: "قراءة نص صفحة موثقة من المكتبة الشاملة داخل ذُو الجلال عبر Quran Gallery.",
  robots: { index: false, follow: true },
};
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ bookId: string; pageId: string }> };

export default async function ShamelaFullPageReader({ params }: Props) {
  const { bookId: rawBook, pageId: rawPage } = await params;
  if (!/^[1-9]\d*$/.test(rawBook) || !/^[1-9]\d*$/.test(rawPage)) notFound();
  const bookId = Number(rawBook);
  const pageId = Number(rawPage);
  if (!Number.isSafeInteger(bookId) || bookId > 10_000_000 || !Number.isSafeInteger(pageId) || pageId > 1_000_000) notFound();

  let reading;
  let error: "limited" | "unavailable" | null = null;
  try { reading = await readShamelaPage(bookId, pageId); }
  catch (cause) {
    error = cause instanceof ShamelaSourceError && cause.status === "limited" ? "limited" : "unavailable";
  }

  return <main className="mx-auto max-w-4xl">
    <nav className="mb-5">
      <a href="/library/shamela" className="inline-flex min-h-10 items-center gap-2 text-sm text-muted-foreground"><ArrowRight className="size-4" />البحث في المكتبة الشاملة</a>
    </nav>
    {!reading ? <section className="rounded-2xl border border-border bg-card p-6">
      <BookOpenText className="mb-3 size-7 text-primary" />
      <h1 className="text-xl font-bold">تعذر قراءة هذه الصفحة حاليًا</h1>
      <p className="mt-3 text-sm leading-7 text-muted-foreground">
        {error === "limited" ? "بلغت خدمة Quran Gallery حدّ الاستخدام المؤقت." : "لم تُرجع الخدمة نص الصفحة بصيغة يمكن التحقق منها."}
        {" "}لم تُفقد بيانات الكتاب، ويمكن فتح الصفحة لدى المصدر أو المحاولة مرة أخرى.
      </p>
      <div className="mt-5 flex flex-wrap gap-3">
        <a className="primary-link" href={`/library/shamela/read/${bookId}/${pageId}`}>إعادة المحاولة</a>
        <a className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border px-4 font-semibold" href={`https://shamela.ws/book/${bookId}/${pageId}`} target="_blank" rel="noopener noreferrer"><ExternalLink className="size-4" />الصفحة لدى الشاملة</a>
      </div>
    </section> : <>
      <header className="page-intro">
        <p className="eyebrow text-accent">المكتبة الشاملة · قارئ داخلي</p>
        <h1>{reading.bookName}</h1>
        <p>{reading.edition ? `الطبعة: ${reading.edition}` : "النص من المكتبة الشاملة عبر Quran Gallery"}</p>
      </header>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4">
        <p className="text-sm text-muted-foreground">
          رقم صفحة الخدمة: {pageId.toLocaleString("ar-SA")}
          {reading.printedPage && ` · الصفحة المطبوعة: ${reading.printedPage}`}
        </p>
        <a className="inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-primary" href={reading.sourceUrl} target="_blank" rel="noopener noreferrer"><ExternalLink className="size-4" />الأصل لدى الشاملة</a>
      </div>

      <article lang="ar" dir="rtl" className="rounded-2xl border border-border bg-card px-4 py-7 sm:px-8 sm:py-10">
        <h2 className="mb-5 border-b border-border pb-3 text-base font-bold">متن الكتاب</h2>
        <p className="whitespace-pre-wrap break-words text-[1.1rem] leading-[2.15] sm:text-[1.2rem]">{reading.body}</p>
      </article>

      {reading.foot && <section lang="ar" dir="rtl" className="mt-4 rounded-2xl border border-border bg-card p-5">
        <h2 className="mb-2 font-bold">حواشي المحقق</h2>
        <p className="mb-3 text-xs leading-6 text-muted-foreground">هذه حواشٍ وتعليقات المحقق، وليست نصًا من تأليف صاحب الكتاب.</p>
        <p className="whitespace-pre-wrap break-words text-base leading-9">{reading.foot}</p>
      </section>}
      {reading.comment && <section lang="ar" dir="rtl" className="mt-4 rounded-2xl border border-border bg-card p-5">
        <h2 className="mb-2 font-bold">تعليقات إضافية</h2>
        <p className="whitespace-pre-wrap break-words text-base leading-9">{reading.comment}</p>
      </section>}

      <nav aria-label="الصفحات المجاورة" className="mt-6 flex flex-wrap justify-between gap-3 rounded-xl border border-border bg-card p-4 text-sm font-semibold">
        {reading.previousPageId ? <a href={`/library/shamela/read/${bookId}/${reading.previousPageId}`} className="min-h-11 rounded-xl border border-border px-4 py-3">الصفحة السابقة</a> : <span />}
        {reading.nextPageId ? <a href={`/library/shamela/read/${bookId}/${reading.nextPageId}`} className="min-h-11 rounded-xl border border-border px-4 py-3">الصفحة التالية</a> : <span />}
      </nav>
      <p className="mt-6 text-xs leading-7 text-muted-foreground">قراءة صفحة واحدة عند الطلب، مع توثيق الكتاب والطبعة والصفحة عندما يعيدها المصدر. لا يعرض التطبيق تصديرًا آليًا للكتب الكاملة.</p>
    </>}
  </main>;
}
