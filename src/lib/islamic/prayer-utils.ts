import type { PrayerTiming } from "@/domain/prayer";
export function nextPrayer(timings: PrayerTiming[], now: Date) { const minutes = now.getHours() * 60 + now.getMinutes(); return timings.find((prayer) => { const [hour, minute] = prayer.time.split(":").map(Number); return hour * 60 + minute > minutes; }) ?? timings[0]; }
