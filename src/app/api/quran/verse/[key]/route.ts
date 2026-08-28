import { NextResponse } from "next/server";
import { z } from "zod";
import { getIslamicAppVerseStudy } from "@/lib/islamic/providers/quran/islamic-app";
const schema = z.object({ key: z.string().regex(/^(?:[1-9]\d?|1[01]\d|114):[1-9]\d{0,2}$/), tafsir: z.coerce.number().int().positive().optional(), translation: z.coerce.number().int().positive().optional() });
export async function GET(request: Request, { params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  const url = new URL(request.url);
  const parsed = schema.safeParse({ key, tafsir: url.searchParams.get("tafsir") || undefined, translation: url.searchParams.get("translation") || undefined });
  if (!parsed.success) return NextResponse.json({ error: "طلب غير صالح" }, { status: 400 });
  try {
    return NextResponse.json(await getIslamicAppVerseStudy(parsed.data.key, parsed.data.tafsir, parsed.data.translation), { headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800" } });
  } catch (error) {
    return NextResponse.json({
      error: "تعذر تحميل التفسير أو الترجمة من Islamic App",
      ...(process.env.NODE_ENV === "development" && { detail: error instanceof Error ? error.message : "Unknown error" }),
    }, { status: 502 });
  }
}
