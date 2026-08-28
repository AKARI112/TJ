import type { PrayerTiming } from "@/domain/prayer";

export function minutesFromTime(value: string) { const [hours, minutes] = value.split(":").map(Number); return hours * 60 + minutes; }
export function getPrayerState(timings: PrayerTiming[], now: Date) {
  const minute = now.getHours() * 60 + now.getMinutes();
  const obligatory = timings.filter((item) => item.obligatory);
  const next = obligatory.find((item) => minutesFromTime(item.time) > minute) ?? obligatory[0];
  const nextIndex = obligatory.findIndex((item) => item.key === next.key);
  const current = minute < minutesFromTime(obligatory[0].time) ? obligatory.at(-1)! : obligatory[Math.max(0, nextIndex - 1)] ?? obligatory.at(-1)!;
  const nextDate = new Date(now); const [hours, minutes] = next.time.split(":").map(Number); nextDate.setHours(hours, minutes, 0, 0); if (nextDate <= now) nextDate.setDate(nextDate.getDate() + 1);
  return { current, next, millisecondsUntilNext: nextDate.getTime() - now.getTime() };
}
export function formatCountdown(milliseconds: number) { const total = Math.max(0, Math.floor(milliseconds / 1000)); const hours = Math.floor(total / 3600); const minutes = Math.floor((total % 3600) / 60); const seconds = total % 60; return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`; }
export function formatPrayerTime(value: string, hour12: boolean) { if (!hour12) return value; const [hour, minute] = value.split(":").map(Number); const period = hour >= 12 ? "م" : "ص"; return `${hour % 12 || 12}:${String(minute).padStart(2, "0")} ${period}`; }
