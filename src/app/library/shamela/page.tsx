import type { Metadata } from "next";
import { ArrowRight, BookOpenText, ExternalLink, Search, ShieldCheck } from "lucide-react";
import { searchShamelaText, ShamelaSourceError } from "@/lib/islamic/providers/library/quran-gallery";
import {
  DEFAULT_SHAMELA_SCOPE, isShamelaScope, SHAMELA_SCOPES,
  type ShamelaScope, type ShamelaSearch,
} from "@/lib/islamic/providers/library/shamela-format";

export const metadata: Metadata = {
  title: "البحث في المكتبة الشاملة",
  description: "بحث عربي موثق في كتب المكتبة الشاملة، مع الطبعات والصفحات وروابط المصادر عبر Quran Gallery.",
  robots: { index: false, follow: true },
};
export const dynamic = "force-dynamic";

type SearchValues = { q?: string | string[]; scope?: string | string[] };
const parameter = (value: string | string[] | undefined) => typeof value === "string" ? value : "";
const matchedInLabel = {
  body: "متن الكتاب", footnote: "حاشية أو تعليق المحقق",
  both: "المتن والحاشية", unknown: "موضع المطابقة غير محدد",
} as const;

function Form({ query, scope }: { query: string; scope: ShamelaScope }) {
  return <form action="/library/shamela" method="get" className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(190px,240px)_auto] sm:items-end">
    <label className="flex min-w-0 flex-col gap-1.5">
      <span className="text-xs font-semibold text-muted-foreground">العبارة التي تريد البحث عنها</span>
      <input name="q" type="search" dir="rtl" minLength={2} maxLength={100} required defaultValue={query}
        placeholder="مثل: إنما الأعمال بالنيات"
        className="min-h-11 w-full min-w-0 rounded-xl border border-input bg-background px-3 outline-none focus-visible:ring-2 focus-visible:ring-ring" />
    </label>
    <label className="flex min-w-0 flex-col gap-1.5">
      <span className="text-xs font-semibold text-muted-foreground">مجال البحث</span>
      <select name="scope" defaultValue={scope}
        className="min-h-11 w-full rounded-xl border border-input bg-background px-3 outline-none focus-visible:ring-2 focus-visible:ring-ring">
        {SHAMELA_SCOPES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
      </select>
    </label>
    <button type="submit" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 font-semibold text-primary-foreground">
      <Search className="size-4" />بحث في النصوص
    </button>
  </form>;
}

export default async function ShamelaLibraryPage({ searchParams }: { searchParams: Promise<SearchValues> }) {
  const params = await searchParams;
  const fullQuery = parameter(params.q).trim();
  const query = fullQuery.slice(0, 100);
  const requestedScope = parameter(params.scope);
  const scope = isShamelaScope(requestedScope) ? requestedScope : DEFAULT_SHAMELA_SCOPE;
  let result: ShamelaSearch | null = null;
  let error: "invalid" | "limited" | "unavailable" | null = null;

  if (fullQuery.length > 0) {
    if (fullQuery.length > 100 || query.length < 2 || !/[\u0621-\u064A]/.test(query)) {
      error = "invalid";
    } else {
      try { result = await searchShamelaText(query, scope); }
      catch (reason) {
        error = reason instanceof ShamelaSourceError && reason.status === "limited" ? "limited"
          : reason instanceof ShamelaSourceError && reason.status === "invalid" ? "unavailable"
            : "unavailable";
      }
    }
  }

  const selectedScope = SHAMELA_SCOPES.find((item) => item.value === scope);
  return <main className="mx-auto max-w-5xl">
    <nav aria-label="العودة إلى المكتبة" className="mb-5">
      <a href="/library" className="inline-flex min-h-10 items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowRight className="size-4" />فهرس المكتبة الإسلامية
      </a>
    </nav>

    <header className="page-intro">
      <p className="eyebrow text-accent">المكتبة الشاملة · Quran Gallery</p>
      <h1>ابحث في نصوص الكتب</h1>
      <p>بحث في صفحات الكتب العربية عبر Quran Gallery، وهي خدمة مستقلة عن المكتبة الشاملة الرسمية. النتائج مقتبسة من المصدر، وليست نصوصًا يولدها الذكاء الاصطناعي.</p>
    </header>

    <section className="mb-7 rounded-2xl border border-border bg-card p-4 sm:p-6" aria-label="بحث الشاملة">
      <Form query={query} scope={scope} />
      <div className="mt-4 flex items-start gap-2 text-xs leading-6 text-muted-foreground">
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />
        حدّد المجال الأقرب لبحثك. قد تختلف الطبعات وأرقام الصفحات، وتُعرض الحواشي منفصلة في وصف كل نتيجة.
      </div>
    </section>

    {error === "invalid" && <div role="alert" className="compact-empty">
      <h2>أدخل كلمات عربية للبحث</h2><p>يجب أن تكون العبارة بين حرفين و100 حرف وأن تحتوي على كلمات عربية.</p>
    </div>}
    {error === "limited" && <div role="alert" className="compact-empty">
      <h2>بلغ البحث حدّ الاستخدام المؤقت</h2>
      <p>خدمة Quran Gallery تحدد عدد الطلبات في الدقيقة. جرّب مرة أخرى بعد فترة قصيرة، أو استخدم فهرس الكتب المحلي.</p>
      <a href="/library" className="primary-link">فتح فهرس الكتب</a>
    </div>}
    {error === "unavailable" && <div role="alert" className="compact-empty">
      <h2>تعذر الوصول إلى بحث الشاملة حاليًا</h2>
      <p>لم تُرجع الخدمة نتيجة صالحة. يظل فهرس كتب تراث وIslamic App متاحًا بصورة مستقلة.</p>
      <div className="flex flex-wrap justify-center gap-3">
        <a href={`/library/shamela?q=${encodeURIComponent(query)}&scope=${scope}`} className="primary-link">إعادة المحاولة</a>
        <a href="/library" className="inline-flex min-h-11 items-center rounded-xl border border-border px-4 font-semibold">فهرس الكتب</a>
      </div>
    </div>}

    {!fullQuery && <div className="rounded-2xl border border-border bg-card p-6">
      <h2 className="flex items-center gap-2 text-lg font-bold"><BookOpenText className="size-5" />البحث عن عبارة موثقة</h2>
      <p className="mt-2 text-sm leading-7 text-muted-foreground">اكتب عبارة من الحديث أو الفقه أو التفسير أو علوم اللغة، ثم اختر القسم. يعرض النظام صفحات الكتب التي وردت فيها مع روابطها الأصلية، لا حكمًا شرعيًا أو تصحيحًا للحديث.</p>
      <a href="/library/shamela?q=%D8%A5%D9%86%D9%85%D8%A7%20%D8%A7%D9%84%D8%A3%D8%B9%D9%85%D8%A7%D9%84%20%D8%A8%D8%A7%D9%84%D9%86%D9%8A%D8%A7%D8%AA&scope=hadith-primary" className="mt-4 inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-primary underline underline-offset-4">تجربة بحث: إنما الأعمال بالنيات</a>
    </div>}

    {result && <section aria-live="polite" aria-label="نتائج البحث في الشاملة">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold">النتائج في: {selectedScope?.label}</h2>
        <p className="text-xs text-muted-foreground">
          {result.hits.length.toLocaleString("ar-SA")} نتيجة معروضة
          {result.booksSearched !== null && ` · جرى البحث في ${result.booksSearched.toLocaleString("ar-SA")} كتاب`}
        </p>
      </div>
      {result.relaxedToTokens && <p className="mb-4 rounded-xl border border-border bg-muted p-3 text-sm leading-7">
        لم يُعثر على تطابق كامل للعبارة، لذا قد تتضمن النتائج كلمات مشابهة فقط. لا تُنسب العبارة إلى أي كتاب دون مراجعة صفحته.
      </p>}
      {result.hits.length === 0 ? <div className="compact-empty">
        <BookOpenText className="size-6" />
        <h3>لا نتائج في هذا المجال</h3>
        <p>لا يعني ذلك غياب العبارة عن جميع الكتب. جرّب مجالًا آخر أو صياغة أقصر.</p>
      </div> : <div className="grid gap-3">
        {result.hits.map((hit, index) => <article key={`${hit.sourceUrl ?? hit.book}-${index}`} className="rounded-2xl border border-border bg-card p-4 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h3 className="text-lg font-bold leading-8">{hit.book}</h3>
              {hit.author && <p className="text-sm text-muted-foreground">{hit.author}</p>}
              <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                {hit.edition && <span>الطبعة: {hit.edition}</span>}
                {hit.printedPage && <span>الصفحة المرجعية: {hit.printedPage}</span>}
                <span>{matchedInLabel[hit.matchedIn]}</span>
              </div>
            </div>
            {hit.sourceUrl && <a href={hit.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-xl border border-border px-3 text-sm font-semibold hover:bg-muted">
              <ExternalLink className="size-4" />عرض الصفحة الأصلية
            </a>}
          </div>
          {hit.excerpt && <blockquote lang="ar" dir="rtl" className="mt-4 whitespace-pre-wrap border-s-2 border-primary/50 ps-4 text-base leading-9">{hit.excerpt}</blockquote>}
          {!hit.excerpt && <p className="mt-3 text-sm text-muted-foreground">يوفر المصدر رابط الصفحة؛ افتحها لقراءة النص الكامل.</p>}
          {hit.matchedIn === "footnote" && <p className="mt-3 text-xs leading-6 text-muted-foreground">هذه المطابقة من حاشية محقق أو تعليق، ولا تُنسب تلقائيًا إلى مؤلف الكتاب.</p>}
          {hit.matchQuality === "relaxed" && <p className="mt-2 text-xs text-muted-foreground">مطابقة تقريبية، وليست اقتباسًا مطابقًا للبحث.</p>}
        </article>)}</div>}
    </section>}

    <footer className="mt-8 border-t border-border pt-5 text-xs leading-7 text-muted-foreground">
      مصدر البحث: <a href="https://qurangallery.com/developers" rel="noopener noreferrer" target="_blank" className="underline underline-offset-4">Quran Gallery MCP</a>؛ المكتبة الشاملة هي مصدر النصوص الأصلي. هذا البحث يعرض مقتطفات وصفحات، وليس مكتبة تنزيل كتب كاملة.
    </footer>
  </main>;
}
