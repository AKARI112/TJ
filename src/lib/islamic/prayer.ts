import type { PrayerTiming } from "@/domain/prayer";
import { addCalendarDays, zonedClockMinutes, zonedClockToInstant, zonedIsoDate } from "./prayer-timezone";

export function minutesFromTime(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

export function getPrayerState(timings: PrayerTiming[], now: Date, timeZone?: string, nextDayTimings?: PrayerTiming[]) {
  const obligatory = timings.filter((item) => item.obligatory);
  if (!obligatory.length) return null;
  const localMinutes = timeZone ? zonedClockMinutes(now, timeZone) : now.getHours() * 60 + now.getMinutes();
  const remaining = obligatory.find((item) => minutesFromTime(item.time) > localMinutes);
  const next = remaining ?? obligatory[0];
  const tomorrow = !remaining;
  const current = [...obligatory].reverse().find((item) => minutesFromTime(item.time) <= localMinutes) ?? obligatory.at(-1)!;
  const nextTime = tomorrow
    ? (nextDayTimings?.find((item) => item.key === next.key)?.time ?? next.time)
    : next.time;

  let nextDate: Date;
  if (timeZone) {
    const localDay = zonedIsoDate(now, timeZone);
    nextDate = zonedClockToInstant(tomorrow ? addCalendarDays(localDay, 1) : localDay, nextTime, timeZone);
  } else {
    nextDate = new Date(now);
    const [hours, minutes] = nextTime.split(":").map(Number);
    nextDate.setHours(hours, minutes, 0, 0);
    if (tomorrow) nextDate.setDate(nextDate.getDate() + 1);
  }
  return { current, next, millisecondsUntilNext: Math.max(0, nextDate.getTime() - now.getTime()) };
}

export function formatCountdown(milliseconds: number) {
  const total = Math.max(0, Math.floor(milliseconds / 1000));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function formatPrayerTime(value: string, hour12: boolean) {
  if (!hour12) return value;
  const [hour, minute] = value.split(":").map(Number);
  const period = hour >= 12 ? "م" : "ص";
  return `${hour % 12 || 12}:${String(minute).padStart(2, "0")} ${period}`;
}
