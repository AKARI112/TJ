import type { Metadata } from "next";
import { BookOpenText } from "lucide-react";
import { IslamicAppMushafPage } from "@/components/quran/islamic-app-mushaf-page";
import { getIslamicAppMushafPage } from "@/lib/islamic/providers/quran/islamic-app";

export const dynamic = "force-dynamic";

type MushafRouteProps = { params: Promise<{ page: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ params }: MushafRouteProps): Promise<Metadata> {
  const { page } = await params;
  return { title: `صفحة المصحف ${page}`, description: `صفحة ${page} من المصحف الشريف عبر Islamic App.` };
}

export default async function MushafPageRoute({ params, searchParams }: MushafRouteProps) {
  const { page: value } = await params;
  const query = await searchParams;
  const pageNumber = Number(value);
  const mode = query.mode === "tajweed" ? "tajweed" : "mushaf";
  if (!Number.isInteger(pageNumber) || pageNumber < 1 || pageNumber > 604) return <div className="compact-empty"><h1>رقم الصفحة غير صالح</h1><a href="/quran/page/1" className="primary-link">الصفحة الأولى</a></div>;
  try { const result = await getIslamicAppMushafPage(pageNumber, mode); return <IslamicAppMushafPage page={result.data} />; }
  catch { return <div className="compact-empty"><BookOpenText className="size-7" /><h1>تعذر تحميل صفحة المصحف</h1><p>تعذر الوصول إلى Islamic App الآن. جرّب مجددًا أو استخدم وضع القراءة الاحتياطي.</p><a href={`/quran/page/${pageNumber}${mode === "tajweed" ? "?mode=tajweed" : ""}`} className="primary-link">إعادة المحاولة</a></div>; }
}
