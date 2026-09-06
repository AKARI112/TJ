import { NextResponse } from "next/server";
import { z } from "zod";
import { getAlFurqanTafsir } from "@/lib/islamic/providers/quran/alfurqan";

const paramsSchema = z.object({
  surah: z.coerce.number().int().min(1).max(114),
  ayah: z.coerce.number().int().min(1).max(300),
});

export async function GET(_request: Request, { params }: { params: Promise<{ surah: string; ayah: string }> }) {
  const parsed = paramsSchema.safeParse(await params);
  if (!parsed.success) return NextResponse.json({ error: "مرجع الآية غير صالح" }, { status: 400 });

  try {
    const result = await getAlFurqanTafsir(parsed.data.surah, parsed.data.ayah, "muyassar");
    return NextResponse.json(result, {
      headers: { "Cache-Control": "public, s-maxage=2592000, stale-while-revalidate=2592000" },
    });
  } catch (error) {
    return NextResponse.json({
      error: "تعذر تحميل التفسير حاليًا",
      ...(process.env.NODE_ENV === "development" && { detail: error instanceof Error ? error.message : "Unknown error" }),
    }, { status: 502 });
  }
}
