import type { Metadata } from "next";
import { LibraryCatalogExplorer } from "@/components/library/library-catalog-explorer";
import { browseLibraryCatalog, catalogStats, type LibrarySource, type LibraryFilter } from "@/lib/islamic/providers/library/catalog-snapshots";

export const metadata: Metadata = {
  title: "المكتبة الإسلامية",
  description: "تصفح فهارس آلاف الكتب الإسلامية والمصادر الموثقة من مكتبة تراث وIslamic App.",
};
export const dynamic = "force-dynamic";

type Params = Record<string, string | string[] | undefined>;
const sources: LibrarySource[] = ["all", "turath", "islamic-app"];
const genres: LibraryFilter[] = ["all", "tafsir", "aqeedah", "hadith", "fiqh", "seerah", "tarikh", "lughah", "adab", "general"];

function stringValue(input: string | string[] | undefined) {
  return typeof input === "string" ? input : "";
}

export default async function LibraryPage({ searchParams }: { searchParams: Promise<Params> }) {
  const params = await searchParams;
  const sourceValue = stringValue(params.source);
  const genreValue = stringValue(params.genre);
  const source = sources.find((item) => item === sourceValue) ?? "all";
  const genre = genres.find((item) => item === genreValue) ?? "all";
  const query = stringValue(params.q).trim().slice(0, 120);
  const rawPage = Number(stringValue(params.page));
  const page = Number.isSafeInteger(rawPage) && rawPage > 0 ? rawPage : 1;
  const result = browseLibraryCatalog({ q: query, source, genre, page });

  return <main>
    <header className="page-intro">
      <p className="eyebrow text-accent">المكتبة الإسلامية</p>
      <h1>كتب العلماء، بمصادرها الموثقة</h1>
      <p>ابحث في فهرسَي Islamic App وتراث، وانتقل إلى الكتاب لدى مصدره. تبقى عناوين الكتب والمؤلفين متاحة حتى لو تعطل اتصال الخادم بمزود خارجي.</p>
    </header>

    <section aria-label="البحث في نصوص المكتبة الشاملة" className="mb-6 rounded-2xl border border-border bg-card p-4 sm:p-5">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold">بحث في نصوص المكتبة الشاملة</h2>
          <p className="mt-1 text-sm leading-7 text-muted-foreground">ابحث داخل متن الكتب العربية عبر Quran Gallery، مع توثيق مصدر كل نتيجة وطبعتها ورقم صفحتها عند توفره.</p>
        </div>
        <a href="/library/shamela" className="inline-flex min-h-10 items-center rounded-xl border border-border px-3 text-sm font-semibold hover:bg-muted">استكشف البحث المتقدم</a>
      </div>
      <form action="/library/shamela" method="get" className="flex flex-col gap-2 sm:flex-row">
        <input type="search" name="q" minLength={2} maxLength={100} required lang="ar" dir="rtl" placeholder="اكتب عبارة عربية للبحث داخل الكتب"
          className="min-h-11 min-w-0 flex-1 rounded-xl border border-input bg-background px-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
        <input type="hidden" name="scope" value="hadith-primary" />
        <button type="submit" className="min-h-11 rounded-xl bg-primary px-5 font-semibold text-primary-foreground">بحث موثق</button>
      </form>
      <p className="mt-2 text-xs leading-6 text-muted-foreground">البحث يبدأ في كتب الحديث الأصلية؛ يمكنك تغيير المجال إلى التفسير أو الفقه أو السيرة أو اللغة في الصفحة المتقدمة.</p>
    </section>

    <LibraryCatalogExplorer books={result.books} total={result.total} page={result.page} pages={result.pages} query={query} source={source} genre={genre} />

    <footer className="content-attribution mt-8">
      <span>الفهارس ليست نصوص الكتب: {catalogStats.islamicApp.toLocaleString("ar-SA")} سجلًا من Islamic App، و{catalogStats.turath.toLocaleString("ar-SA")} سجلًا من تراث عبر Nusus. قد تتكرر الكتب بين المصدرين.</span>
      <span>نسخة تراث المفهرسة: {catalogStats.turathScannedAt} · قائمة Islamic App: {catalogStats.islamicCapturedAt.slice(0, 10)}</span>
      <a href="https://github.com/mwijanarko1/nusus" rel="noopener noreferrer" target="_blank">مصدر فهرس تراث وتوثيقه</a>
    </footer>
  </main>;
}
