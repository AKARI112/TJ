import type { Metadata } from "next";
import { BookOpenText, RefreshCw, ExternalLink } from "lucide-react";
import { LibraryExplorer } from "@/components/library/library-explorer";
import { getLibraryBooks } from "@/lib/islamic/providers/library/islamic-app";

export const metadata: Metadata = {
  title: "المكتبة الإسلامية",
  description: "مكتبة كتب إسلامية كلاسيكية مع القراءة النصية وبث PDF عبر Islamic App.",
};

// Do not cache the *error screen* as a valid 200 page when the provider is temporarily down.
// The underlying successful provider responses retain their own 5-minute fetch cache.
export const dynamic = "force-dynamic";

export default async function LibraryPage() {
  try {
    const result = await getLibraryBooks({ limit: 100 });
    return <main>
      <header className="page-intro">
        <p className="eyebrow text-accent">المكتبة</p>
        <h1>كتب العلماء، بنصّها ومصدرها</h1>
        <p>كتالوج Islamic App للكتب الإسلامية المنشورة، مع النص المحقق أو بث PDF بحسب المتاح لكل كتاب.</p>
      </header>
      <LibraryExplorer books={result.books} total={result.total} />
      <footer className="content-attribution">
        <span>المصدر الرئيسي: Islamic App Classical Library</span>
        <a href="https://docs.islamic.app/api-reference/library-overview" target="_blank" rel="noreferrer">عن المكتبة ومصادرها</a>
      </footer>
    </main>;
  } catch (error) {
    console.error("[library] catalog unavailable after source failover", {
      message: error instanceof Error ? error.message : "unknown",
    });
    return <main>
      <div className="provider-error">
        <BookOpenText className="size-7" aria-hidden="true" />
        <h1>تعذر تحميل المكتبة حاليًا</h1>
        <p>لم نتمكن من جلب كتالوج الكتب من المصدر أو التحقق من بياناته. لم نفقد أي محفوظات لديك، ويمكنك إعادة المحاولة أو فتح المكتبة لدى مزوّدها مباشرة.</p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <a href="/library" className="primary-link"><RefreshCw className="size-4" />إعادة المحاولة</a>
          <a href="https://islamic.app/library" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border bg-card px-4 font-semibold text-foreground"><ExternalLink className="size-4" />فتح المكتبة الأصلية</a>
        </div>
      </div>
    </main>;
  }
}
