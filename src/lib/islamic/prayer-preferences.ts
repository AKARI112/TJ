"use client";

/** One canonical set of prayer preferences for the dashboard, home and settings. */
export const PRAYER_PREFERENCES_KEY = "dhu-al-jalal:prayer-preferences";
export const PRAYER_PREFERENCES_EVENT = "dhu-al-jalal:prayer-preferences-changed";
export type PrayerLocation = { kind: "coords"; lat: number; lng: number } | { kind: "address"; address: string };
export type PrayerPreferences = {
  method: string;
  school: string;
  hour12: boolean;
  location?: PrayerLocation;
};
const defaults: PrayerPreferences = { method: "4", school: "0", hour12: false };

export function readPrayerPreferences(): PrayerPreferences {
  if (typeof window === "undefined") return { ...defaults };
  try {
    const saved = JSON.parse(localStorage.getItem(PRAYER_PREFERENCES_KEY) ?? "null");
    if (!saved || typeof saved !== "object") return { ...defaults };
    const location = saved.location;
    const validLocation = location?.kind === "address" && typeof location.address === "string"
      ? { kind: "address" as const, address: location.address }
      : location?.kind === "coords" && Number.isFinite(location.lat) && Number.isFinite(location.lng)
        ? { kind: "coords" as const, lat: location.lat, lng: location.lng }
        : undefined;
    return {
      method: typeof saved.method === "string" ? saved.method : defaults.method,
      school: typeof saved.school === "string" ? saved.school : defaults.school,
      hour12: Boolean(saved.hour12),
      ...(validLocation ? { location: validLocation } : {}),
    };
  } catch {
    return { ...defaults };
  }
}

export function savePrayerPreferences(patch: Partial<PrayerPreferences>) {
  const value = { ...readPrayerPreferences(), ...patch };
  localStorage.setItem(PRAYER_PREFERENCES_KEY, JSON.stringify(value));
  window.dispatchEvent(new Event(PRAYER_PREFERENCES_EVENT));
  return value;
}
