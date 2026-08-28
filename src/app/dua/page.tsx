import { DuaLibrary } from "@/components/devotional/dua-library";
import { getDevotionalCategories } from "@/lib/islamic/providers/adhkar";

export const metadata = { title: "الأدعية" };
export default async function DuaPage() { const categories = await getDevotionalCategories("dua"); return <main><header className="page-intro"><p className="eyebrow text-accent">الأدعية</p><h1>دعاء بمصدرٍ ظاهر</h1><p>أدعية حصن المسلم عبر Islamic App، مصنفة للمسجد والسفر والطعام والكرب والحفظ وغيرها.</p></header><DuaLibrary categories={categories} /></main>; }
