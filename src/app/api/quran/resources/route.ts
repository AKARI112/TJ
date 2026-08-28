import { NextResponse } from "next/server";
import { getIslamicAppResources } from "@/lib/islamic/providers/quran/islamic-app";
export async function GET() {
  try {
    return NextResponse.json(await getIslamicAppResources(), { headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800" } });
  } catch (error) {
    return NextResponse.json({
      error: "تعذر تحميل موارد Islamic App",
      ...(process.env.NODE_ENV === "development" && { detail: error instanceof Error ? error.message : "Unknown error" }),
    }, { status: 502 });
  }
}
