import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({ lat: z.coerce.number().min(-90).max(90), lng: z.coerce.number().min(-180).max(180) });
export async function GET(request: Request) {
  const url = new URL(request.url); const parsed = schema.safeParse(Object.fromEntries(url.searchParams));
  if (!parsed.success) return NextResponse.json({ error: "إحداثيات غير صالحة" }, { status: 400 });
  const { lat, lng } = parsed.data;
  try {
    const response = await fetch(`https://api.aladhan.com/v1/qibla/${lat}/${lng}`, { next: { revalidate: 60 * 60 * 24 * 30 } });
    if (!response.ok) throw new Error();
    const payload = z.object({ data: z.object({ direction: z.number() }) }).parse(await response.json());
    return NextResponse.json({ direction: payload.data.direction, provider: "AlAdhan / Islamic Network", sourceUrl: "https://aladhan.com/qibla-api" });
  } catch { return NextResponse.json({ error: "تعذر تحديد القبلة حاليًا" }, { status: 502 }); }
}
