import { NextResponse } from "next/server";
import { z } from "zod";
import { getPrayerDay } from "@/lib/islamic/providers/prayer/aladhan";

const querySchema = z.object({ lat: z.coerce.number().min(-90).max(90), lng: z.coerce.number().min(-180).max(180), method: z.coerce.number().int().min(0).max(99).default(4) });

export async function GET(request: Request) {
  const url = new URL(request.url);
  const parsed = querySchema.safeParse(Object.fromEntries(url.searchParams));
  if (!parsed.success) return NextResponse.json({ error: "إحداثيات غير صالحة" }, { status: 400 });
  try { return NextResponse.json(await getPrayerDay(parsed.data.lat, parsed.data.lng, parsed.data.method)); }
  catch { return NextResponse.json({ error: "تعذر تحميل المواقيت حاليًا" }, { status: 502 }); }
}
