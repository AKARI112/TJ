import type { Metadata } from "next";
import { LibraryExplorer } from "@/components/library/library-explorer";
import { getLibraryBooks } from "@/lib/islamic/providers/library/islamic-app";

export const metadata: Metadata = { title: "المكتبة الإسلامية", description: "مكتبة كتب إسلامية كلاسيكية مع القراءة النصية وبث PDF عبر Islamic App." };
export const revalidate = 300;

export default async function LibraryPage() {
  try { const result = await getLibraryBooks({ limit: 100 }); return <main><header className="page-intro"><p className="eyebrow text-accent">المكتبة</p><h1>كتب العلماء، بنصّها ومصدرها</h1><p>كتالوج Islamic App للكتب الإسلامية المنشورة، مع النص المحقق أو بث PDF بحسب المتاح لكل كتاب.</p></header><LibraryExplorer books={result.books} total={result.total} /><footer className="content-attribution"><span>المصدر الرئيسي: Islamic App Classical Library</span><a href="https://docs.islamic.app/api-reference/library-overview" target="_blank" rel="noreferrer">عن المكتبة ومصادرها</a></footer></main>; }
  catch { return <main><div className="provider-error"><h1>تعذر تحميل المكتبة</h1><p>تحقق من الاتصال ثم أعد المحاولة.</p><a href="/library" className="primary-link">إعادة المحاولة</a></div></main>; }
}
