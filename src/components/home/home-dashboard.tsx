"use client";

import { ArrowLeft, Bell, BookOpenText, Compass, Headphones, LocateFixed, MoonStar, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ExpandableTabs } from "@/components/motion/expandable-tabs";

function useToday() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const timer = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, []);
  return now;
}

export function HomeDashboard() {
  const now = useToday();
  const date = useMemo(() => now?.toLocaleDateString("ar-SA", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) ?? "…", [now]);
  const hijri = useMemo(() => now?.toLocaleDateString("ar-SA-u-ca-islamic-umalqura", { day: "numeric", month: "long", year: "numeric" }) ?? "…", [now]);

  const quickActions = [
    { id: "quran", label: "القرآن", icon: <BookOpenText className="size-4" />, content: <QuickPanel href="/quran" title="القرآن الكريم" description="تابع قراءتك أو اختر سورة" /> },
    { id: "adhkar", label: "الأذكار", icon: <Sparkles className="size-4" />, content: <QuickPanel href="/adhkar" title="وردك اليومي" description="أذكار موثقة بعدّاد هادئ" /> },
    { id: "listen", label: "استمع", icon: <Headphones className="size-4" />, content: <QuickPanel href="/listen" title="تلاوات القرآن" description="اختر قارئًا وسورة" /> },
    { id: "qibla", label: "القبلة", icon: <Compass className="size-4" />, content: <QuickPanel href="/qibla" title="اتجاه القبلة" description="اتجاه دقيق من موقعك" /> },
  ];

  return (
    <main>
      <section className="mb-7 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="mb-1 text-sm text-muted-foreground">السلام عليكم، طاب يومك</p>
          <h1 className="text-3xl font-[760] leading-tight text-foreground md:text-[2.35rem]">رفيقك في يومٍ مطمئن</h1>
        </div>
        <div className="text-start text-sm sm:text-end">
          <p className="font-medium text-foreground">{date}</p>
          <p className="mt-1 text-muted-foreground">{hijri}</p>
        </div>
      </section>

      <div className="dashboard-grid">
        <section className="prayer-card" aria-labelledby="next-prayer-title">
          <div className="relative z-10 flex h-full flex-col justify-between">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="eyebrow" id="next-prayer-title">الصلاة التالية</p>
                <h2 className="mt-4 text-[2rem] font-[720] leading-tight">مواقيت دقيقة لموقعك</h2>
                <p className="mt-2 max-w-md text-sm leading-7 text-white/70">نطلب موقعك عند الحاجة فقط، ونحتفظ بالتفضيل على جهازك.</p>
              </div>
              <MoonStar className="size-6 text-[#e8c8a7]" aria-hidden="true" />
            </div>
            <a href="/prayer" className="primary-action mt-8 self-start"><LocateFixed className="size-4" />تفعيل مواقيت الصلاة</a>
          </div>
        </section>

        <section className="surface-panel continue-card" aria-labelledby="continue-title">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="eyebrow text-accent">تابع القراءة</p>
              <h2 id="continue-title" className="mt-3 text-2xl font-[700]">ابدأ رحلتك مع القرآن</h2>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">سيُحفظ موضعك الأخير على هذا الجهاز تلقائيًا.</p>
            </div>
            <div className="progress-orbit" aria-hidden="true"><BookOpenText className="size-5" /></div>
          </div>
          <a href="/quran" className="text-action mt-8">افتح المصحف <ArrowLeft className="size-4" /></a>
        </section>
      </div>

      <section className="mt-8" aria-labelledby="quick-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow text-accent">وصول سريع</p>
            <h2 id="quick-title">ما الذي تحتاجه الآن؟</h2>
          </div>
          <ExpandableTabs items={quickActions} className="hidden sm:block" classNames={{ root: "bg-card/90 shadow-sm", label: "font-fustat" }} />
        </div>
        <div className="quick-list sm:hidden">
          {quickActions.map((item) => (
            <a key={item.id} href={`/${item.id}`} className="quick-row">
              <span className="quick-icon">{item.icon}</span><span className="font-semibold">{item.label}</span><ArrowLeft className="ms-auto size-4 text-muted-foreground" />
            </a>
          ))}
        </div>
      </section>

      <section className="daily-layout mt-8" aria-labelledby="daily-title">
        <article className="surface-panel daily-card">
          <div className="flex items-start justify-between gap-4">
            <div><p className="eyebrow text-accent">نور اليوم</p><h2 id="daily-title" className="mt-3 text-xl font-[700]">محتوى موثّق يتجدد كل يوم</h2></div>
            <span className="source-badge">المصدر ظاهر دائمًا</span>
          </div>
          <div className="mt-8 rounded-2xl border border-dashed border-border p-6 text-center">
            <p className="text-sm leading-7 text-muted-foreground">سيظهر هنا نص قرآني أو حديث أو دعاء بعد تحميله مباشرة من المزوّد الموثوق، دون توليد أو تعديل.</p>
          </div>
        </article>

        <aside className="surface-panel reminder-card" aria-labelledby="reminder-title">
          <Bell className="size-5 text-accent" /><p className="eyebrow mt-6 text-accent">تذكيرك التالي</p>
          <h2 id="reminder-title" className="mt-3 text-xl font-[700]">اجعل وردك قريبًا</h2>
          <p className="mt-2 text-sm leading-7 text-muted-foreground">أضف تذكيرًا مرنًا للقراءة أو الأذكار في الوقت المناسب لك.</p>
          <a href="/reminders" className="text-action mt-6">إضافة تذكير <ArrowLeft className="size-4" /></a>
        </aside>
      </section>
    </main>
  );
}

function QuickPanel({ href, title, description }: { href: string; title: string; description: string }) {
  return <div className="w-72 p-4 text-start"><p className="font-semibold">{title}</p><p className="mt-1 text-xs text-muted-foreground">{description}</p><a href={href} className="text-action mt-3 text-xs">افتح الآن <ArrowLeft className="size-3.5" /></a></div>;
}
