# ذُو الجَلاَلْ

تطبيق إسلامي عربي أولًا، مبني كرفيق يومي هادئ للقرآن والصلاة والقبلة والحديث والتلاوات. يحافظ التطبيق على نسبة كل محتوى ديني إلى مصدره، ولا يولّد نصوصًا أو درجات دينية.

## التقنية

- Next.js App Router 16، React 19، TypeScript الصارم، Tailwind CSS 4
- beUI v2 من سجل `starc007/ui-components` لمكوّنات الحركة والتنقل والبحث والسمة
- Fustat لكل واجهة التطبيق، وAmiri Quran للنص العثماني
- Zod للتحقق من استجابات المزوّدين، وVitest لاختبارات المنطق
- PWA بملف manifest وخدمة offline shell محدودة

## التشغيل

```bash
npm install
npm run dev
```

التحقق الكامل:

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

## مزوّدو البيانات

- AlQuran Cloud: السور والنص العثماني؛ لا يحتاج مفتاحًا.
- AlAdhan / Islamic Network: مواقيت الصلاة والقبلة؛ لا يحتاج مفتاحًا.
- MP3Quran API v3: دليل القرّاء والتلاوات؛ لا يحتاج مفتاحًا.
- HadeethEnc: الأحاديث ودرجاتها وشروحها ومراجعها؛ لا يحتاج مفتاحًا.
- Quran Foundation: بنية المتغيرات موجودة في `.env.example`، ويحتاج `QF_CLIENT_ID` و`QF_CLIENT_SECRET` للوصول الكامل.
- IslamHouse: اختياري ويحتاج `ISLAMHOUSE_API_KEY`.

كل مفاتيح السر تبقى على الخادم. لا تضع قيمًا حقيقية في ملفات المصدر.

## beUI

المكوّنات منسوخة المصدر عبر سجل shadcn (`@beui/...`) وليست حزمة runtime. راجع `src/components/motion` عند تعديلها، واحترم `prefers-reduced-motion` وRTL.

## PWA والتنبيهات

التطبيق قابل للتثبيت ويخزن shell أساسيًا للاستخدام دون اتصال. لا تُخزّن مكتبات الصوت تلقائيًا. التذكيرات المحلية المتاحة هنا لا تدّعي العمل بعد إغلاق المتصفح؛ Web Push الموثوق يحتاج مفاتيح VAPID وجدولة خادمية.

## النشر

اربط مستودع GitHub بمشروع جديد في Vercel؛ سيكتشف Vercel إطار Next.js ويشغّل `npm run build` تلقائيًا. لا يحتاج التطبيق أي متغير سري لتشغيل القرآن والصلاة والقبلة والحديث والتلاوات العامة.

للمزايا الاختيارية، أضف الأسرار من **Project Settings → Environment Variables** ولا تضعها في GitHub. يمكن ترك `NEXT_PUBLIC_APP_URL` فارغًا على Vercel لأن التطبيق يستخدم `VERCEL_PROJECT_PRODUCTION_URL` تلقائيًا؛ عيّنه فقط إذا كان لديك نطاق مخصص وتريد تثبيت الروابط القانونية عليه.

المتغيرات التي تحتاجها Quran Foundation عند تفعيلها:

- `QF_CLIENT_ID`
- `QF_CLIENT_SECRET`
- `QF_ENV=production`

أوامر البناء القياسية هي `npm run build` و`npm run start`.
