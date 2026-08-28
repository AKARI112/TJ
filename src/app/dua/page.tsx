import { DuaLibrary } from "@/components/devotional/dua-library";
import { getDevotionalCategories } from "@/lib/islamic/providers/adhkar/local-hisn";

export const metadata = { title: "الأدعية" };
export default function DuaPage() { const categories = getDevotionalCategories("dua"); return <main><header className="page-intro"><p className="eyebrow text-accent">الأدعية</p><h1>دعاء بمصدرٍ ظاهر</h1><p>ابحث في الأدعية اليومية والمختارة، واحفظ ما تحتاجه للعودة إليه.</p></header><DuaLibrary categories={categories} /></main>; }
