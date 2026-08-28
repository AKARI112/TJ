import type { Metadata } from "next";
import { BookOpenText, ChevronLeft } from "lucide-react";
import { getChapters } from "@/lib/islamic/providers/quran/alquran-cloud";

export const metadata: Metadata = { title: "القرآن الكريم", description: "اقرأ سور القرآن الكريم بنص عثماني موثّق مع حفظ موضع القراءة." };
export const dynamic = "force-dynamic";

export default async function QuranPage() {
  try {
    const result = await getChapters();
    return (
      <main>
        <header className="page-intro"><p className="eyebrow text-accent">القرآن الكريم</p><h1>اقرأ بتدبّر وطمأنينة</h1><p>اختر سورة، وسيُحفظ آخر موضع تقرؤه على جهازك.</p></header>
        <div className="chapter-list">
          {result.data.map((chapter) => (
            <a key={chapter.id} href={`/quran/${chapter.id}`} className="chapter-row">
              <span className="chapter-number">{chapter.id.toLocaleString("ar-SA")}</span>
              <span className="min-w-0 flex-1"><strong>{chapter.nameArabic}</strong><small>{chapter.versesCount.toLocaleString("ar-SA")} آية · {chapter.revelationPlace === "makkah" ? "مكية" : "مدنية"}</small></span>
              <ChevronLeft className="size-4 text-muted-foreground" />
            </a>
          ))}
        </div>
        <p className="source-line">المصدر: <a href={result.sourceUrl} target="_blank" rel="noreferrer">{result.provider}</a></p>
      </main>
    );
  } catch {
    return <ProviderError title="تعذر تحميل سور القرآن حاليًا" />;
  }
}

function ProviderError({ title }: { title: string }) {
  return <div className="provider-error"><BookOpenText className="size-7" /><h1>{title}</h1><p>تحقق من اتصالك ثم أعد المحاولة. لا نعرض نصًا بديلًا غير موثّق.</p><a href="/quran" className="primary-link">إعادة المحاولة</a></div>;
}
