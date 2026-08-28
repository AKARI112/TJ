import Link from "next/link";
import { ArrowLeft, BookMarked } from "lucide-react";
import { getDevotionalCategories } from "@/lib/islamic/providers/adhkar";

export const metadata = { title: "الأذكار" };
export default async function AdhkarPage() {
  const categories = await getDevotionalCategories("dhikr");
  const provider = categories[0]?.items[0]?.provider ?? "Islamic App";
  const sourceUrl = categories[0]?.items[0]?.sourceUrl ?? "https://docs.islamic.app/api-reference/dhikr";
  return <main><header className="page-intro"><p className="eyebrow text-primary">الأذكار</p><h1>وردٌ واضح، وعدّاد هادئ</h1><p>Islamic App هو المصدر الرئيسي، مع نسخة محلية موثّقة كاحتياط عند انقطاع الاتصال.</p></header><section className="category-rows" aria-label="أقسام الأذكار">{categories.map((category) => <Link key={category.slug} href={`/adhkar/${category.slug}/${category.items[0].id}`} className="category-row"><div><span className="category-icon"><BookMarked /></span><h2>{category.label}</h2><p>{category.description}</p></div><div className="category-row-end"><span>{category.items.length} ذكرًا</span><ArrowLeft /></div></Link>)}</section><footer className="content-attribution"><span>المصدر المستخدم: {provider}</span><a href={sourceUrl} target="_blank" rel="noreferrer">عرض المصدر</a></footer></main>;
}
