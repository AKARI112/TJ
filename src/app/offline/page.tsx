import { CloudOff } from "lucide-react";
export const metadata = { title: "دون اتصال", robots: { index: false, follow: false } };
export default function OfflinePage() { return <main><div className="compact-empty"><CloudOff className="size-8 text-primary" /><h1>أنت الآن دون اتصال</h1><p>تبقى المحفوظات والتقدم والإعدادات وبيانات الأذكار وحصن المسلم على هذا الجهاز. افتح صفحة زرتها سابقًا أو عُد عند توفر الشبكة.</p><a href="/" className="primary-link">العودة للرئيسية</a></div></main>; }
