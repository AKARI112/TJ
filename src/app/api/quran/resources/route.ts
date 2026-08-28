import { NextResponse } from "next/server";
import { getQuranFoundationResources, isQuranFoundationConfigured } from "@/lib/islamic/providers/quran/quran-foundation";
export async function GET() { if (!isQuranFoundationConfigured()) return NextResponse.json({ error: "Quran Foundation غير مهيأ" }, { status: 503 }); try { return NextResponse.json(await getQuranFoundationResources(), { headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800" } }); } catch { return NextResponse.json({ error: "تعذر تحميل موارد التفسير والترجمة" }, { status: 502 }); } }
