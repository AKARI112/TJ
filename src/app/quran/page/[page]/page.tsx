import type { Metadata } from "next";
import { BookOpenText } from "lucide-react";
import { QcfMushafPage } from "@/components/quran/qcf-mushaf-page";
import { getQuranFoundationPage, isQuranFoundationConfigured } from "@/lib/islamic/providers/quran/quran-foundation";

export const dynamic = "force-dynamic";

type MushafRouteProps = { params: Promise<{ page: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ params }: MushafRouteProps): Promise<Metadata> {
  const { page } = await params;
  return { title: `صفحة المصحف ${page}`, description: `صفحة ${page} من المصحف الشريف بخط Quran Foundation QCF.` };
}

export default async function MushafPageRoute({ params, searchParams }: MushafRouteProps) {
  const { page: value } = await params;
  const query = await searchParams;
  const pageNumber = Number(value);
  const mode = query.mode === "tajweed" ? "tajweed" : "mushaf";
  if (!Number.isInteger(pageNumber) || pageNumber < 1 || pageNumber > 604) return <div className="compact-empty"><h1>رقم الصفحة غير صالح</h1><a href="/quran/page/1" className="primary-link">الصفحة الأولى</a></div>;
  if (!isQuranFoundationConfigured()) return <main><header className="page-intro"><p className="eyebrow text-primary">المصحف</p><h1>خط QCF يحتاج اعتماد Quran Foundation</h1><p>أضف QF_CLIENT_ID وQF_CLIENT_SECRET في Vercel لعرض صفحات المصحف الموثقة. وضع القراءة المفتوح يبقى متاحًا الآن.</p></header><div className="compact-empty"><BookOpenText className="size-7" /><h2>لم نعرض بديلًا تقريبيًا للمصحف</h2><p>هذا يمنع تركيب صفحة غير مطابقة حين تكون بيانات QCF غير متاحة.</p><a href="/quran/1" className="primary-link">افتح وضع القراءة</a></div></main>;
  try { const result = await getQuranFoundationPage(pageNumber, mode); return <QcfMushafPage page={result.data} />; }
  catch { return <div className="compact-empty"><BookOpenText className="size-7" /><h1>تعذر تحميل صفحة المصحف</h1><p>لم نعرض رموز QCF بخط غير مطابق. جرّب مجددًا أو استخدم وضع القراءة.</p><a href={`/quran/page/${pageNumber}${mode === "tajweed" ? "?mode=tajweed" : ""}`} className="primary-link">إعادة المحاولة</a></div>; }
}
