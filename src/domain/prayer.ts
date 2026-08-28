export type PrayerName = "Fajr" | "Sunrise" | "Dhuhr" | "Asr" | "Maghrib" | "Isha";
export interface PrayerTiming { key: PrayerName; label: string; time: string; obligatory: boolean; }
export interface PrayerDay {
  dateGregorian: string; dateHijri: string; method: string; timezone: string;
  latitude: number; longitude: number; timings: PrayerTiming[]; provider: string; sourceUrl: string;
}
