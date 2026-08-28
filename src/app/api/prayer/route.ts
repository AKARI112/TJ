import { NextResponse } from "next/server";
import { z } from "zod";
import { getPrayerDay, getPrayerDayByAddress } from "@/lib/islamic/providers/prayer/aladhan";

const querySchema = z.object({ lat: z.coerce.number().min(-90).max(90).optional(), lng: z.coerce.number().min(-180).max(180).optional(), address: z.string().trim().min(2).max(120).optional(), method: z.coerce.number().int().min(0).max(99).default(4), school: z.coerce.number().int().min(0).max(1).default(0) }).refine((value) => Boolean(value.address) || (value.lat !== undefined && value.lng !== undefined), "يلزم الموقع أو العنوان");

export async function GET(request: Request) {
  const url = new URL(request.url);
  const parsed = querySchema.safeParse(Object.fromEntries(url.searchParams));
  if (!parsed.success) return NextResponse.json({ error: "موقع أو إعدادات غير صالحة" }, { status: 400 });
  try { const { lat, lng, address, method, school } = parsed.data; return NextResponse.json(address ? await getPrayerDayByAddress(address, method, school) : await getPrayerDay(lat!, lng!, method, school)); }
  catch { return NextResponse.json({ error: "تعذر تحميل المواقيت حاليًا" }, { status: 502 }); }
}
