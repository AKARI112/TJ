"use client";

import { LocateFixed, MapPin, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { PrayerDay } from "@/domain/prayer";
import { Input } from "@/components/motion/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/motion/select";
import { Switch } from "@/components/motion/switch";
import { formatCountdown, formatPrayerTime, getPrayerState } from "@/lib/islamic/prayer";

const methods = [{ value: "4", label: "أم القرى — مكة" }, { value: "3", label: "رابطة العالم الإسلامي" }, { value: "2", label: "ISNA" }, { value: "5", label: "الهيئة المصرية" }, { value: "8", label: "منطقة الخليج" }, { value: "13", label: "تركيا" }];
type LocationPreference = { kind: "coords"; lat: number; lng: number } | { kind: "address"; address: string };
const PREFERENCES_KEY = "dhu-al-jalal:prayer-preferences";

export function PrayerDashboard() {
  const [data, setData] = useState<PrayerDay | null>(null); const [error, setError] = useState(""); const [loading, setLoading] = useState(false); const [now, setNow] = useState(() => new Date());
  const [method, setMethod] = useState("4"); const [school, setSchool] = useState("0"); const [hour12, setHour12] = useState(false); const [address, setAddress] = useState(""); const [location, setLocation] = useState<LocationPreference | null>(null);

  const load = useCallback(async (place: LocationPreference, methodValue: string, schoolValue: string, hour12Value: boolean) => {
    setLoading(true); setError(""); const params = new URLSearchParams({ method: methodValue, school: schoolValue });
    if (place.kind === "coords") { params.set("lat", String(place.lat)); params.set("lng", String(place.lng)); } else params.set("address", place.address);
    try { const response = await fetch(`/api/prayer?${params}`); const payload = await response.json(); if (!response.ok) throw new Error(payload.error); setData(payload); setLocation(place); localStorage.setItem(PREFERENCES_KEY, JSON.stringify({ method: methodValue, school: schoolValue, hour12: hour12Value, location: place })); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "تعذر تحميل المواقيت"); } finally { setLoading(false); }
  }, []);

  useEffect(() => { const timer = window.setInterval(() => setNow(new Date()), 1000); return () => window.clearInterval(timer); }, []);
  useEffect(() => { try { const saved = JSON.parse(localStorage.getItem(PREFERENCES_KEY) ?? "null") as { method?: string; school?: string; hour12?: boolean; location?: LocationPreference } | null; if (!saved) return; const savedMethod = saved.method ?? "4"; const savedSchool = saved.school ?? "0"; const savedHour12 = Boolean(saved.hour12); setMethod(savedMethod); setSchool(savedSchool); setHour12(savedHour12); if (saved.location) void load(saved.location, savedMethod, savedSchool, savedHour12); } catch { localStorage.removeItem(PREFERENCES_KEY); } }, [load]);
  const prayerState = useMemo(() => data ? getPrayerState(data.timings, now) : null, [data, now]);
  function locate() { setLoading(true); setError(""); navigator.geolocation.getCurrentPosition(({ coords }) => void load({ kind: "coords", lat: coords.latitude, lng: coords.longitude }, method, school, hour12), () => { setError("لم نتمكن من الوصول إلى موقعك. استخدم المدينة أو فعّل إذن الموقع."); setLoading(false); }, { enableHighAccuracy: false, maximumAge: 3_600_000, timeout: 12_000 }); }
  function submitAddress(event: React.FormEvent) { event.preventDefault(); const clean = address.trim().slice(0, 120); if (clean.length >= 2) void load({ kind: "address", address: clean }, method, school, hour12); }
  function updateSettings(nextMethod = method, nextSchool = school, nextHour12 = hour12) { setMethod(nextMethod); setSchool(nextSchool); setHour12(nextHour12); if (location) { localStorage.setItem(PREFERENCES_KEY, JSON.stringify({ method: nextMethod, school: nextSchool, hour12: nextHour12, location })); void load(location, nextMethod, nextSchool, nextHour12); } }

  return <main><header className="page-intro"><p className="eyebrow text-accent">الصلاة</p><h1>مواقيتك، وفق اختيارك</h1><p>الموقع وطريقة الحساب والمذهب تبقى تحت تحكمك. العدّ التنازلي يحدث على جهازك دون طلب متكرر.</p></header>
    <section className="prayer-settings" aria-label="إعدادات المواقيت"><Select value={method} onValueChange={(value) => updateSettings(value, school, hour12)}><SelectTrigger><SelectValue placeholder="طريقة الحساب" /></SelectTrigger><SelectContent>{methods.map((entry) => <SelectItem key={entry.value} value={entry.value}>{entry.label}</SelectItem>)}</SelectContent></Select><Select value={school} onValueChange={(value) => updateSettings(method, value, hour12)}><SelectTrigger><SelectValue placeholder="حساب العصر" /></SelectTrigger><SelectContent><SelectItem value="0">الشافعي / المالكي / الحنبلي</SelectItem><SelectItem value="1">الحنفي</SelectItem></SelectContent></Select><label className="hour-switch"><span>نظام 12 ساعة</span><Switch checked={hour12} onCheckedChange={(checked) => updateSettings(method, school, checked)} /></label></section>
    {data ? <><section className="next-prayer-banner"><div><p>الصلاة القادمة</p><h2>{prayerState?.next.label}</h2><span>{data.locationLabel ?? "الموقع الحالي"} · {data.method}</span></div><div><strong dir="ltr">{prayerState ? formatCountdown(prayerState.millisecondsUntilNext) : "--:--:--"}</strong><span>حتى الأذان</span></div></section><div className="prayer-strip">{data.timings.map((item) => <div key={item.key} className={`prayer-time ${prayerState?.current.key === item.key ? "is-current" : ""} ${prayerState?.next.key === item.key ? "is-next" : ""}`}><span>{item.label}</span><strong dir="ltr">{formatPrayerTime(item.time, hour12)}</strong>{!item.obligatory && <small>ليست صلاة مفروضة</small>}{prayerState?.next.key === item.key && <small>القادمة</small>}</div>)}</div>{data.extended.length > 0 && <div className="night-times">{data.extended.map((entry) => <div key={entry.key}><span>{entry.label}</span><strong dir="ltr">{formatPrayerTime(entry.time, hour12)}</strong></div>)}</div>}<div className="source-panel"><div><strong>{data.dateHijri}</strong><p>{data.dateGregorian} · {data.timezone}</p></div><button onClick={() => location && void load(location, method, school, hour12)}><RefreshCw className="size-4" />تحديث</button></div><p className="source-line">المصدر: <a href={data.sourceUrl} target="_blank" rel="noreferrer">{data.provider}</a></p></> : <div className="location-prompt"><LocateFixed className="size-7 text-accent" /><h2>اختر طريقة تحديد المكان</h2><p>يمكنك استخدام الموقع الدقيق أو كتابة المدينة والدولة. لا يرتبط الاختيار بحساب مستخدم.</p><button onClick={locate} disabled={loading} className="primary-link"><LocateFixed className="size-4" />{loading ? "جارٍ التحديد…" : "تحديد موقعي"}</button><form className="manual-location" onSubmit={submitAddress}><Input value={address} onChange={setAddress} placeholder="مثال: الرياض، السعودية" leftIcon={<MapPin />} /><button type="submit" disabled={loading || address.trim().length < 2}>استخدام المدينة</button></form>{error && <p role="alert" className="error-text">{error}</p>}</div>}
  </main>;
}
