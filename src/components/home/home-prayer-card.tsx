"use client";

import { ArrowLeft, LocateFixed, MoonStar } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { PrayerDay } from "@/domain/prayer";
import { formatCountdown, formatPrayerTime, getPrayerState } from "@/lib/islamic/prayer";
import { readPrayerPreferences, PRAYER_PREFERENCES_EVENT, type PrayerPreferences } from "@/lib/islamic/prayer-preferences";
import { zonedIsoDate } from "@/lib/islamic/prayer-timezone";

export function HomePrayerCard() {
  const [data, setData] = useState<PrayerDay | null>(null);
  const [now, setNow] = useState(() => new Date());
  const [saved, setSaved] = useState<PrayerPreferences | null>(null);

  const load = useCallback(async () => {
    const preferences = readPrayerPreferences();
    setSaved(preferences);
    if (!preferences.location) { setData(null); return; }
    const params = new URLSearchParams({ method: preferences.method, school: preferences.school });
    if (preferences.location.kind === "coords") {
      params.set("lat", String(preferences.location.lat));
      params.set("lng", String(preferences.location.lng));
    } else params.set("address", preferences.location.address);
    try {
      const response = await fetch(`/api/prayer?${params}`);
      if (response.ok) setData(await response.json() as PrayerDay);
    } catch { /* Leave the last available timings visible. */ }
  }, []);

  useEffect(() => {
    void load();
    const tick = window.setInterval(() => setNow(new Date()), 1000);
    const onSettings = () => void load();
    window.addEventListener(PRAYER_PREFERENCES_EVENT, onSettings);
    window.addEventListener("storage", onSettings);
    return () => { window.clearInterval(tick); window.removeEventListener(PRAYER_PREFERENCES_EVENT, onSettings); window.removeEventListener("storage", onSettings); };
  }, [load]);

  useEffect(() => {
    if (!data) return;
    const refresh = () => {
      try { if (data.dateIso !== zonedIsoDate(new Date(), data.timezone)) void load(); }
      catch { /* Invalid browser timezone, keep the last valid data. */ }
    };
    const interval = window.setInterval(refresh, 60_000);
    const visible = () => { if (document.visibilityState === "visible") refresh(); };
    document.addEventListener("visibilitychange", visible);
    return () => { window.clearInterval(interval); document.removeEventListener("visibilitychange", visible); };
  }, [data, load]);

  const state = useMemo(() => data ? getPrayerState(data.timings, now, data.timezone, data.nextDayTimings) : null, [data, now]);
  return <section className="prayer-card" aria-labelledby="next-prayer-title">
    <div className="relative z-10 flex h-full flex-col justify-between">
      <div className="flex items-start justify-between gap-4">
        <div><p className="eyebrow" id="next-prayer-title">الصلاة التالية</p>
          <h2 className="mt-4 text-[2rem] font-[720] leading-tight">{state ? state.next.label : "مواقيت دقيقة لموقعك"}</h2>
          <p className="mt-2 max-w-md text-sm leading-7 text-white/70">
            {state && data ? `${formatPrayerTime(state.next.time, Boolean(saved?.hour12))} · ${data.locationLabel ?? "الموقع الحالي"} · ${data.method}` : "حدد موقعك أو مدينتك مرة واحدة لتظهر المواقيت هنا."}
          </p>
        </div>
        <MoonStar className="size-6 text-[#e8c8a7]" aria-hidden="true" />
      </div>
      {state ? <div><strong className="home-countdown" dir="ltr">{formatCountdown(state.millisecondsUntilNext)}</strong>
        <a href="/prayer" className="primary-action mt-3 self-start">كل المواقيت <ArrowLeft className="size-4" /></a>
      </div> : <a href="/prayer" className="primary-action mt-8 self-start"><LocateFixed className="size-4" />تفعيل مواقيت الصلاة</a>}
    </div>
  </section>;
}
