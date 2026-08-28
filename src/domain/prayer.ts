export type PrayerName = "Fajr" | "Sunrise" | "Dhuhr" | "Asr" | "Maghrib" | "Isha";
export interface PrayerTiming { key: PrayerName; label: string; time: string; obligatory: boolean; }
export interface PrayerDay {
  dateGregorian: string; dateHijri: string; method: string; timezone: string;
  latitude?: number; longitude?: number; locationLabel?: string; timings: PrayerTiming[];
  extended: Array<{ key: "Midnight" | "Firstthird" | "Lastthird"; label: string; time: string }>;
  provider: string; sourceUrl: string;
}
