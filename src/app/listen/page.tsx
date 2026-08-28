import type { Metadata } from "next";
import { Headphones } from "lucide-react";
import { ReciterBrowser } from "@/components/audio/reciter-browser";
import { getReciters } from "@/lib/islamic/providers/audio/mp3quran";
import { getChapters } from "@/lib/islamic/providers/quran";
export const metadata: Metadata = { title: "استمع إلى القرآن" }; export const dynamic = "force-dynamic";
export default async function ListenPage() { try { const [reciters, chapters] = await Promise.all([getReciters(), getChapters()]); return <main><header className="page-intro"><p className="eyebrow text-primary">استمع</p><h1>اختر القارئ والسورة</h1><p>يشغل المشغل العالمي التلاوة خلال تنقلك في التطبيق، مع الرواية والمصدر.</p></header><ReciterBrowser reciters={reciters} chapters={chapters.data} /></main>; } catch { return <div className="compact-empty"><Headphones className="size-7" /><h1>تعذر تحميل مكتبة التلاوات</h1><p>أعد المحاولة عند عودة الاتصال.</p><a href="/listen" className="primary-link">إعادة المحاولة</a></div>; } }
