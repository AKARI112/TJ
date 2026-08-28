import Link from "next/link";
import { ArrowLeft, BookMarked } from "lucide-react";
import { getDevotionalCategories } from "@/lib/islamic/providers/adhkar/local-hisn";

export const metadata = { title: "الأذكار" };
export default function AdhkarPage() {
  const categories = getDevotionalCategories("dhikr");
  return <main><header className="page-intro"><p className="eyebrow text-primary">الأذكار</p><h1>وردٌ واضح، وعدّاد هادئ</h1><p>بيانات مورّدة محليًا للعمل دون اتصال، مع المصدر وعدد التكرار كما وردا في مجموعة البيانات.</p></header><section className="category-rows" aria-label="أقسام الأذكار">{categories.map((category) => <Link key={category.slug} href={`/adhkar/${category.slug}/${category.items[0].id}`} className="category-row"><div><span className="category-icon"><BookMarked /></span><h2>{category.label}</h2><p>{category.description}</p></div><div className="category-row-end"><span>{category.items.length} ذكرًا</span><ArrowLeft /></div></Link>)}</section><footer className="content-attribution"><span>المصدر: Fitrahive Dua-Dhikr — نسخة محلية</span><a href="https://github.com/fitrahive/dua-dhikr" target="_blank" rel="noreferrer">عرض المصدر والترخيص</a></footer></main>;
}
