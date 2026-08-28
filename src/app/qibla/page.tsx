import type { Metadata } from "next";
import { QiblaCompass } from "@/components/qibla/qibla-compass";
export const metadata: Metadata = { title: "اتجاه القبلة" };
export default function QiblaPage() { return <QiblaCompass />; }
