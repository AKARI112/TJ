import type { Metadata } from "next";
import { Headphones } from "lucide-react";
import { ReciterBrowser } from "@/components/audio/reciter-browser";
import { getReciters } from "@/lib/islamic/providers/audio/mp3quran";
export const metadata: Metadata = { title: "استمع إلى القرآن" }; export const dynamic = "force-dynamic";
export default async function ListenPage() { try { const reciters = await getReciters(); return <main><header className="page-intro"><p className="eyebrow text-accent">استمع</p><h1>أصوات تأخذك إلى السكينة</h1><p>اختر القارئ ثم السورة. التلاوات تأتي مباشرة من MP3Quran.</p></header><ReciterBrowser reciters={reciters.slice(0, 40)} /></main>; } catch { return <div className="provider-error"><Headphones className="size-7" /><h1>تعذر تحميل القرّاء حاليًا</h1><p>أعد المحاولة عند عودة الاتصال.</p><a href="/listen" className="primary-link">إعادة المحاولة</a></div>; } }
