import { HisnIndex } from "@/components/devotional/hisn-index";
import { getHisnChapters } from "@/lib/islamic/providers/adhkar/hisn";
export const metadata = { title: "حصن المسلم", description: "فهرس حصن المسلم كاملًا: 133 بابًا بالنص العربي والمراجع." };
export default function HisnPage() { const chapters = getHisnChapters(); return <main><header className="page-intro"><p className="eyebrow text-accent">حصن المسلم</p><h1>الكتاب، بابًا بعد باب</h1><p>133 بابًا عربيًا مورّدًا محليًا، مع مراجع النصوص والصوت عندما يتيحه المصدر.</p></header><HisnIndex chapters={chapters} /><footer className="content-attribution"><span>حصن المسلم — سعيد بن علي بن وهف القحطاني</span><a href="https://github.com/asellam/HisnElMuslim" target="_blank" rel="noreferrer">المصدر والترخيص</a></footer></main>; }
