import type { Metadata } from "next";
import { PrayerDashboard } from "@/components/prayer/prayer-dashboard";
export const metadata: Metadata = { title: "مواقيت الصلاة" };
export default function PrayerPage() { return <PrayerDashboard />; }
