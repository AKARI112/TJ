"use client";

import { LocateFixed, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import type { PrayerDay } from "@/domain/prayer";

export function PrayerDashboard() {
  const [data, setData] = useState<PrayerDay | null>(null); const [error, setError] = useState(""); const [loading, setLoading] = useState(false);
  const locate = () => {
    setLoading(true); setError("");
    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      localStorage.setItem("dhu-al-jalal:location", JSON.stringify({ lat: coords.latitude, lng: coords.longitude }));
      const response = await fetch(`/api/prayer?lat=${coords.latitude}&lng=${coords.longitude}&method=4`); const payload = await response.json();
      if (!response.ok) setError(payload.error); else setData(payload); setLoading(false);
    }, () => { setError("لم نتمكن من الوصول إلى موقعك. يمكنك المحاولة مجددًا من إعدادات المتصفح."); setLoading(false); }, { enableHighAccuracy: false, maximumAge: 3_600_000, timeout: 12_000 });
  };
  useEffect(() => { const raw = localStorage.getItem("dhu-al-jalal:location"); if (raw) { const saved = JSON.parse(raw) as { lat: number; lng: number }; fetch(`/api/prayer?lat=${saved.lat}&lng=${saved.lng}&method=4`).then((r) => r.json()).then(setData).catch(() => undefined); } }, []);
  return <main><header className="page-intro"><p className="eyebrow text-accent">الصلاة</p><h1>مواقيتك، حيث أنت</h1><p>تُحسب المواقيت من AlAdhan وفق موقعك وطريقة أم القرى، ويمكن تغيير الطريقة لاحقًا.</p></header>{data ? <><div className="prayer-strip">{data.timings.map((item) => <div key={item.key} className="prayer-time"><span>{item.label}</span><strong>{item.time}</strong>{!item.obligatory && <small>ليست صلاة مفروضة</small>}</div>)}</div><div className="source-panel"><div><strong>{data.dateHijri}</strong><p>{data.method} · {data.timezone}</p></div><button onClick={locate}><RefreshCw className="size-4" />تحديث الموقع</button></div><p className="source-line">المصدر: <a href={data.sourceUrl} target="_blank" rel="noreferrer">{data.provider}</a></p></> : <div className="location-prompt"><LocateFixed className="size-7 text-accent" /><h2>اسمح بالموقع لحساب المواقيت</h2><p>لا نرسل إحداثياتك إلى حساب مستخدم، ويُحفظ التفضيل على هذا الجهاز فقط.</p><button onClick={locate} disabled={loading} className="primary-link">{loading ? "جارٍ التحديد…" : "تحديد موقعي"}</button>{error && <p role="alert" className="error-text">{error}</p>}</div>}</main>;
}
