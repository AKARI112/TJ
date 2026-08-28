import "server-only";
import { z } from "zod";
import type { PrayerDay, PrayerName } from "@/domain/prayer";

const timingKeys: { key: PrayerName; label: string; obligatory: boolean }[] = [
  { key: "Fajr", label: "الفجر", obligatory: true }, { key: "Sunrise", label: "الشروق", obligatory: false },
  { key: "Dhuhr", label: "الظهر", obligatory: true }, { key: "Asr", label: "العصر", obligatory: true },
  { key: "Maghrib", label: "المغرب", obligatory: true }, { key: "Isha", label: "العشاء", obligatory: true },
];

const schema = z.object({ data: z.object({
  timings: z.record(z.string(), z.string()),
  date: z.object({ readable: z.string(), hijri: z.object({ date: z.string(), month: z.object({ ar: z.string() }), year: z.string(), day: z.string() }) }),
  meta: z.object({ timezone: z.string(), method: z.object({ name: z.string() }) }),
}) });

const cleanTime = (value: string) => value.match(/^\d{1,2}:\d{2}/)?.[0] ?? value;

function normalizePrayerDay(payload: z.infer<typeof schema>, location: { latitude?: number; longitude?: number; locationLabel?: string }): PrayerDay {
  const { data } = payload;
  const extendedKeys = [{ key: "Midnight" as const, label: "منتصف الليل" }, { key: "Firstthird" as const, label: "الثلث الأول" }, { key: "Lastthird" as const, label: "الثلث الأخير" }];
  return { dateGregorian: data.date.readable, dateHijri: `${data.date.hijri.day} ${data.date.hijri.month.ar} ${data.date.hijri.year} هـ`, method: data.meta.method.name, timezone: data.meta.timezone, ...location, timings: timingKeys.map((item) => ({ ...item, time: cleanTime(data.timings[item.key]) })), extended: extendedKeys.filter((item) => data.timings[item.key]).map((item) => ({ ...item, time: cleanTime(data.timings[item.key]) })), provider: "AlAdhan / Islamic Network", sourceUrl: "https://aladhan.com/prayer-times-api" };
}

export async function getPrayerDay(latitude: number, longitude: number, method = 4, school = 0): Promise<PrayerDay> {
  const params = new URLSearchParams({ latitude: String(latitude), longitude: String(longitude), method: String(method), school: String(school) });
  const response = await fetch(`https://api.aladhan.com/v1/timings?${params}`, { next: { revalidate: 900 } });
  if (!response.ok) throw new Error(`AlAdhan timings: ${response.status}`);
  return normalizePrayerDay(schema.parse(await response.json()), { latitude, longitude });
}

export async function getPrayerDayByAddress(address: string, method = 4, school = 0): Promise<PrayerDay> {
  const params = new URLSearchParams({ address, method: String(method), school: String(school) });
  const response = await fetch(`https://api.aladhan.com/v1/timingsByAddress?${params}`, { next: { revalidate: 900 } });
  if (!response.ok) throw new Error(`AlAdhan timingsByAddress: ${response.status}`);
  return normalizePrayerDay(schema.parse(await response.json()), { locationLabel: address });
}
