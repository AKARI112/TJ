import { ArrowLeft, BookOpenText, Search, LibraryBig } from "lucide-react";
import type { CatalogEntry, LibraryFilter, LibrarySource } from "@/lib/islamic/providers/library/catalog-snapshots";
import { catalogStats } from "@/lib/islamic/providers/library/catalog-snapshots";

const sources: Array<{ value: LibrarySource; label: string }> = [
  { value: "all", label: "جميع المصادر" },
  { value: "islamic-app", label: "Islamic App" },
  { value: "turath", label: "تراث" },
];
const categories: Array<{ value: LibraryFilter; label: string }> = [
  { value: "all", label: "جميع العلوم" },
  { value: "tafsir", label: "التفسير وعلوم القرآن" },
  { value: "aqeedah", label: "العقيدة والفرق" },
  { value: "hadith", label: "الحديث وعلومه" },
  { value: "fiqh", label: "الفقه وأصوله" },
  { value: "seerah", label: "السيرة" },
  { value: "tarikh", label: "التاريخ والتراجم" },
  { value: "lughah", label: "اللغة" },
  { value: "adab", label: "الآداب والرقائق" },
  { value: "general", label: "أخرى" },
];

function pageUrl(values: { q: string; source: LibrarySource; genre: LibraryFilter }, page: number) {
  const params = new URLSearchParams();
  if (values.q) params.set("q", values.q);
  if (values.source !== "all") params.set("source", values.source);
  if (values.genre !== "all") params.set("genre", values.genre);
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `/library?${query}` : "/library";
}

export function LibraryCatalogExplorer({
  books, total, page, pages, query, source, genre,
}: {
  books: CatalogEntry[];
  total: number;
  page: number;
  pages: number;
  query: string;
  source: LibrarySource;
  genre: LibraryFilter;
}) {
  const formValues = { q: query, source, genre };
  return <div className="book-library">
    <div className="grid gap-3 rounded-2xl border border-border bg-card p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-lg font-bold"><LibraryBig className="size-5 text-primary" />استكشف الكتب</h2>
        <p className="text-sm text-muted-foreground">فهرسان مستقلان، مع الإحالة إلى مصدر كل كتاب</p>
      </div>
      <div className="grid gap-3 text-sm sm:grid-cols-2">
        <a href="/library?source=islamic-app" className="flex min-h-12 items-center justify-between rounded-xl border border-border p-3 transition-colors hover:bg-muted">
          <span>مكتبة Islamic App</span><strong>{catalogStats.islamicApp.toLocaleString("ar-SA")} كتابًا</strong>
        </a>
        <a href="/library?source=turath" className="flex min-h-12 items-center justify-between rounded-xl border border-border p-3 transition-colors hover:bg-muted">
          <span>مكتبة تراث</span><strong>{catalogStats.turath.toLocaleString("ar-SA")} سجل كتاب</strong>
        </a>
      </div>
      <form method="get" action="/library" className="grid items-end gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(140px,180px)_minmax(160px,210px)_auto]">
        <label className="flex flex-col gap-1.5"><span className="text-xs text-muted-foreground">اسم الكتاب أو المؤلف</span><input name="q" defaultValue={query} maxLength={120} placeholder="ابحث في عناوين الكتب والمؤلفين" className="min-h-11 w-full min-w-0 rounded-xl border border-input bg-background px-3 outline-none focus-visible:ring-2 focus-visible:ring-ring" /></label>
        <label className="flex flex-col gap-1.5"><span className="text-xs text-muted-foreground">المصدر</span><select name="source" defaultValue={source} className="min-h-11 min-w-0 rounded-xl border border-input bg-background px-2">{sources.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
        <label className="flex flex-col gap-1.5"><span className="text-xs text-muted-foreground">التصنيف</span><select name="genre" defaultValue={genre} className="min-h-11 min-w-0 rounded-xl border border-input bg-background px-2">{categories.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
        <button type="submit" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 font-semibold text-primary-foreground"><Search className="size-4" />بحث</button>
      </form>
    </div>

    <p className="library-count mt-5">تم العثور على {total.toLocaleString("ar-SA")} سجل مطابق · الصفحة {page.toLocaleString("ar-SA")} من {pages.toLocaleString("ar-SA")}</p>

    {books.length ? <section className="book-grid" aria-label="نتائج المكتبة">
      {books.map((book) => <a key={`${book.source}:${book.id}`} href={book.url}  className="book-row">
        <span className="book-row-icon"><BookOpenText /></span>
        <div className="min-w-0 flex-1"><h2>{book.title}</h2><p>{book.author || "المؤلف غير محدد"}</p>
          <div className="book-capabilities"><span>{book.source === "turath" ? "تراث — Nuqayah" : "Islamic App"}</span><span>{book.section}</span>{book.source === "islamic-app" && book.pdf && <span>PDF</span>}</div>
        </div>
        <ArrowLeft className="size-4" />
      </a>)}
    </section> : <div className="compact-empty"><BookOpenText className="size-6" /><h2>لا توجد كتب مطابقة</h2><p>جرّب عبارة أخرى أو تصنيفًا أوسع.</p><a href="/library" className="primary-link">عرض جميع الكتب</a></div>}

    {pages > 1 && <nav className="mt-7 flex flex-wrap items-center justify-center gap-3" aria-label="صفحات نتائج المكتبة">
      {page > 1 && <a href={pageUrl(formValues, page - 1)} className="min-h-11 rounded-xl border border-border px-4 py-3 font-semibold">الصفحة السابقة</a>}
      <span className="text-sm text-muted-foreground">{page.toLocaleString("ar-SA")} / {pages.toLocaleString("ar-SA")}</span>
      {page < pages && <a href={pageUrl(formValues, page + 1)} className="min-h-11 rounded-xl border border-border px-4 py-3 font-semibold">الصفحة التالية</a>}
    </nav>}

    <div className="mt-8 rounded-2xl border border-border bg-card p-5">
      <h2 className="text-lg font-bold">مكتبات ومصادر أخرى</h2>
      <p className="mt-2 text-sm leading-7 text-muted-foreground">هذه روابط مستقلة للتصفح لدى الجهات الناشرة، وليست واجهات برمجية مدمجة في التطبيق.</p>
      <div className="mt-3 flex flex-wrap gap-3 text-sm">
        <a href="https://shamela.ws" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">المكتبة الشاملة</a>
        <a href="https://app.turath.io" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">تراث</a>
        <a href="https://ketabonline.com/ar" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">جامع الكتب الإسلامية</a>
      </div>
    </div>
  </div>;
}
