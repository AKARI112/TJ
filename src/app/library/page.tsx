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

    <LibraryCatalogExplorer books={result.books} total={result.total} page={result.page} pages={result.pages} query={query} source={source} genre={genre} />

    <footer className="content-attribution mt-8">
      <span>الفهارس ليست نصوص الكتب: {catalogStats.islamicApp.toLocaleString("ar-SA")} سجلًا من Islamic App، و{catalogStats.turath.toLocaleString("ar-SA")} سجلًا من تراث عبر Nusus. قد تتكرر الكتب بين المصدرين.</span>
      <span>نسخة تراث المفهرسة: {catalogStats.turathScannedAt} · قائمة Islamic App: {catalogStats.islamicCapturedAt.slice(0, 10)}</span>
      <a href="https://github.com/mwijanarko1/nusus" rel="noopener noreferrer" target="_blank">مصدر فهرس تراث وتوثيقه</a>
    </footer>
  </main>;
}
