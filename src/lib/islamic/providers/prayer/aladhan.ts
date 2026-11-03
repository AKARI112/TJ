import "server-only";
import { z } from "zod";
import type { PrayerDay, PrayerName, PrayerTiming } from "@/domain/prayer";
import { addCalendarDays, zonedIsoDate } from "@/lib/islamic/prayer-timezone";

const BASE = "https://api.aladhan.com/v1";
const timingKeys: { key: PrayerName; label: string; obligatory: boolean }[] = [
  { key: "Fajr", label: "الفجر", obligatory: true },
  { key: "Sunrise", label: "الشروق", obligatory: false },
  { key: "Dhuhr", label: "الظهر", obligatory: true },
  { key: "Asr", label: "العصر", obligatory: true },
  { key: "Maghrib", label: "المغرب", obligatory: true },
  { key: "Isha", label: "العشاء", obligatory: true },
];
const schema = z.object({ data: z.object({
  timings: z.record(z.string(), z.string()),
  date: z.object({
    readable: z.string(),
    gregorian: z.object({ date: z.string() }),
    hijri: z.object({ date: z.string(), month: z.object({ ar: z.string() }), year: z.string(), day: z.string() }),
  }),
  meta: z.object({ timezone: z.string(), method: z.object({ name: z.string() }) }),
}) });
type ResponseData = z.infer<typeof schema>["data"];
const cleanTime = (value: string) => value.match(/^\d{1,2}:\d{2}/)?.[0] ?? value;
const toIsoDate = (date: string) => date.split("-").reverse().join("-");
const toApiDate = (iso: string) => iso.split("-").reverse().join("-");

function timingsFrom(data: ResponseData): PrayerTiming[] {
  return timingKeys.map((item) => ({ ...item, time: cleanTime(data.timings[item.key]) }));
}

async function request(kind: "timings" | "timingsByAddress", params: URLSearchParams, dateIso?: string) {
  const path = dateIso ? `${kind}/${toApiDate(dateIso)}` : kind;
  const response = await fetch(`${BASE}/${path}?${params}`, { next: { revalidate: 900 } });
  if (!response.ok) throw new Error(`AlAdhan ${kind}: ${response.status}`);
  return schema.parse(await response.json()).data;
}

async function getDay(kind: "timings" | "timingsByAddress", params: URLSearchParams, location: Pick<PrayerDay, "latitude" | "longitude" | "locationLabel">) {
  // The default endpoint may return the date for the provider's timezone.
  // Resolve the actual civil date for the requested location and correct it.
  const initial = await request(kind, params);
  const localDate = zonedIsoDate(new Date(), initial.meta.timezone);
  const today = toIsoDate(initial.date.gregorian.date) === localDate
    ? initial
    : await request(kind, params, localDate);
  const tomorrowDate = addCalendarDays(localDate, 1);
  // Do not withhold today's verified timings if tomorrow's endpoint is down.
  const nextDay = await request(kind, params, tomorrowDate).catch(() => null);
  const extendedKeys = [
    { key: "Midnight" as const, label: "منتصف الليل" },
    { key: "Firstthird" as const, label: "الثلث الأول" },
    { key: "Lastthird" as const, label: "الثلث الأخير" },
  ];
  return {
    dateGregorian: today.date.readable,
    dateHijri: `${today.date.hijri.day} ${today.date.hijri.month.ar} ${today.date.hijri.year} هـ`,
    dateIso: toIsoDate(today.date.gregorian.date),
    method: today.meta.method.name,
    timezone: today.meta.timezone,
    ...location,
    timings: timingsFrom(today),
    ...(nextDay ? { nextDayTimings: timingsFrom(nextDay) } : {}),
    extended: extendedKeys.filter((item) => today.timings[item.key]).map((item) => ({ ...item, time: cleanTime(today.timings[item.key]) })),
    provider: "AlAdhan / Islamic Network",
    sourceUrl: "https://aladhan.com/prayer-times-api",
  } satisfies PrayerDay;
}

export async function getPrayerDay(latitude: number, longitude: number, method = 4, school = 0): Promise<PrayerDay> {
  const params = new URLSearchParams({ latitude: String(latitude), longitude: String(longitude), method: String(method), school: String(school) });
  return getDay("timings", params, { latitude, longitude });
}

export async function getPrayerDayByAddress(address: string, method = 4, school = 0): Promise<PrayerDay> {
  const params = new URLSearchParams({ address, method: String(method), school: String(school) });
  return getDay("timingsByAddress", params, { locationLabel: address });
}
