import { CloudOff } from "lucide-react";
export const metadata = { title: "دون اتصال", robots: { index: false, follow: false } };
export default function OfflinePage() { return <main><div className="compact-empty"><CloudOff className="size-8 text-primary" /><h1>أنت الآن دون اتصال</h1><p>تبقى المحفوظات والتقدم والإعدادات محفوظة على هذا الجهاز. تتوفر بعض صفحات التطبيق التي سبق تخزينها مؤقتًا، لكن التلاوات والكتب الخارجية والخطوط التي لم تُحمّل سابقًا تحتاج إلى اتصال. لا يُفترض أن جميع صفحات القرآن تعمل دون إنترنت.</p><a href="/" className="primary-link">العودة للرئيسية</a></div></main>; }
