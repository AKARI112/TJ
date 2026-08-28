"use client";

import { Compass, LocateFixed } from "lucide-react";
import { useState } from "react";

export function QiblaCompass() {
  const [direction, setDirection] = useState<number | null>(null); const [error, setError] = useState(""); const [loading, setLoading] = useState(false);
  const locate = () => { setLoading(true); setError(""); navigator.geolocation.getCurrentPosition(async ({ coords }) => {
    const response = await fetch(`/api/qibla?lat=${coords.latitude}&lng=${coords.longitude}`); const payload = await response.json();
    if (!response.ok) setError(payload.error); else setDirection(payload.direction); setLoading(false);
  }, () => { setError("تعذر الوصول إلى الموقع. فعّل الإذن ثم حاول مرة أخرى."); setLoading(false); }, { maximumAge: 3_600_000, timeout: 12_000 }); };
  return <main><header className="page-intro"><p className="eyebrow text-accent">القبلة</p><h1>اتجاه واضح، دون تعقيد</h1><p>نحسب زاوية القبلة مرة واحدة من موقعك. دوران الهاتف لا يرسل أي طلبات إضافية.</p></header><div className="qibla-stage">{direction === null ? <><Compass className="size-12 text-accent" /><h2>حدّد موقعك لعرض الاتجاه</h2><p>ستحصل على زاوية ثابتة يمكن استخدامها حتى إن لم تتوفر حساسات البوصلة.</p><button onClick={locate} disabled={loading} className="primary-link"><LocateFixed className="size-4" />{loading ? "جارٍ الحساب…" : "تحديد اتجاه القبلة"}</button></> : <><div className="compass-face"><div className="compass-arrow" style={{ transform: `rotate(${direction}deg)` }}><span>الكعبة</span></div><div className="compass-center" /></div><h2>{direction.toFixed(1)}° من الشمال</h2><p>ضع الهاتف أفقيًا وعاير البوصلة إن كانت القراءة غير مستقرة.</p><button onClick={locate} className="text-action">إعادة الحساب</button><p className="source-line">المصدر: AlAdhan / Islamic Network</p></>}{error && <p role="alert" className="error-text">{error}</p>}</div></main>;
}
