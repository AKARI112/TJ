"use client";

import { BookOpenText, CalendarDays, Check, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { deleteRecord, getRecord, putRecord } from "@/lib/storage/indexed-db";
import { progressRepository } from "@/lib/storage/repositories";
import { khatmaPace, localIsoDate, type KhatmaPlan } from "@/lib/khatma";

const durations = [30, 60, 90, 120];

export function KhatmaPlanner() {
  const [plan, setPlan] = useState<KhatmaPlan | null>(null);
  const [startPage, setStartPage] = useState(1);
  const [days, setDays] = useState(30);
  const [today, setToday] = useState<Date | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setToday(new Date());
    void Promise.all([getRecord<KhatmaPlan>("goals", "khatma-plan"), progressRepository.current()])
      .then(([stored, progress]) => {
        if (stored?.id === "khatma-plan" && stored.startPage >= 1 && stored.startPage <= 604 && stored.days > 0) setPlan(stored);
        if (progress) setStartPage(Math.max(1, Math.min(604, progress.pageNumber)));
      }).catch(() => { /* The Quran remains available when local storage is blocked. */ });
  }, []);

  async function start() {
    setBusy(true);
    try {
      const next: KhatmaPlan = { id: "khatma-plan", startedAt: localIsoDate(new Date()), startPage, days };
      await putRecord("goals", next);
      setPlan(next);
      setToday(new Date());
    } finally { setBusy(false); }
  }

  async function remove() {
    setBusy(true);
    try { await deleteRecord("goals", "khatma-plan"); setPlan(null); }
    finally { setBusy(false); }
  }

  const target = plan && today ? khatmaPace(plan, today) : null;
  return <section className="mb-7 rounded-2xl border border-border bg-card p-5 sm:p-6" aria-label="خطة ختمة اختيارية">
    <div className="mb-3 flex items-center gap-2"><CalendarDays className="size-5 text-primary" /><h2 className="text-lg font-bold">خطة قراءة اختيارية</h2></div>
    {plan && target ? <>
      <p className="text-sm leading-7 text-muted-foreground">صفحتك المقترحة لهذا اليوم: <strong className="text-foreground">{target.targetPage.toLocaleString("ar-SA")}</strong> · متوسط {target.pagesPerDay.toLocaleString("ar-SA")} صفحة يوميًا. هذه أهداف اختيارية وليست تسجيلًا للصفحات المقروءة.</p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <a href={`/quran/page/${Math.min(604, plan.startPage)}`} className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground"><BookOpenText className="size-4" />افتح المصحف</a>
        <button type="button" onClick={() => void remove()} disabled={busy} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-border px-3 text-sm"><Trash2 className="size-4" />إزالة الخطة</button>
      </div>
    </> : <>
      <p className="mb-4 text-sm leading-7 text-muted-foreground">اختر مدة مرنة لختم المصحف. ستبقى الخطة على جهازك ولن تؤثر على موضع القراءة المحفوظ.</p>
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-sm"><span>عدد الأيام</span><select value={days} onChange={(event) => setDays(Number(event.target.value))} className="min-h-10 rounded-xl border border-border bg-background px-3">{durations.map((value) => <option key={value} value={value}>{value} يومًا</option>)}</select></label>
        <label className="flex flex-col gap-1 text-sm"><span>صفحة البداية</span><input type="number" min="1" max="604" value={startPage} onChange={(event) => setStartPage(Math.max(1, Math.min(604, Number(event.target.value) || 1)))} className="min-h-10 w-24 rounded-xl border border-border bg-background px-3" /></label>
        <button type="button" onClick={() => void start()} disabled={busy} className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground"><Check className="size-4" />بدء الخطة</button>
      </div>
    </>}
  </section>;
}
