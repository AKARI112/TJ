/**
 * Civil clock calculations for the prayer location, not the browser's timezone.
 * Intl is used rather than fixed UTC offsets so DST zones are supported.
 */
function parts(date: Date, timeZone: string) {
  const fields = new Intl.DateTimeFormat("en-GB", {
    timeZone, year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).formatToParts(date);
  const value = (type: string) => Number(fields.find((field) => field.type === type)?.value ?? 0);
  return { year: value("year"), month: value("month"), day: value("day"), hour: value("hour"), minute: value("minute") };
}

export function zonedIsoDate(date: Date, timeZone: string) {
  const { year, month, day } = parts(date, timeZone);
  return [year, String(month).padStart(2, "0"), String(day).padStart(2, "0")].join("-");
}

export function zonedClockMinutes(date: Date, timeZone: string) {
  const { hour, minute } = parts(date, timeZone);
  return hour * 60 + minute;
}

export function addCalendarDays(dateIso: string, days: number) {
  const [year, month, day] = dateIso.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + days));
  return date.toISOString().slice(0, 10);
}

/** Resolve a civil time in an IANA timezone to an absolute instant. */
export function zonedClockToInstant(dateIso: string, clock: string, timeZone: string) {
  const [year, month, day] = dateIso.split("-").map(Number);
  const [hour, minute] = clock.split(":").map(Number);
  const target = Date.UTC(year, month - 1, day, hour, minute);
  let instant = target;
  // Converges for normal times and takes DST offset changes into account.
  for (let attempt = 0; attempt < 3; attempt++) {
    const actual = parts(new Date(instant), timeZone);
    const actualAsUtc = Date.UTC(actual.year, actual.month - 1, actual.day, actual.hour, actual.minute);
    const delta = target - actualAsUtc;
    instant += delta;
    if (delta === 0) break;
  }
  return new Date(instant);
}
