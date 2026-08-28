import "server-only";
import { z } from "zod";
import type { Reciter } from "@/domain/audio";

const schema = z.object({ reciters: z.array(z.object({ id: z.number(), name: z.string(), moshaf: z.array(z.object({ id: z.number(), name: z.string(), server: z.string().url(), surah_list: z.string() })) })) });
export async function getReciters(): Promise<Reciter[]> {
  const response = await fetch("https://mp3quran.net/api/v3/reciters?language=ar", { next: { revalidate: 60 * 60 * 12 } });
  if (!response.ok) throw new Error(`MP3Quran: ${response.status}`); const payload = schema.parse(await response.json());
  return payload.reciters.map((item) => ({ id: item.id, name: item.name, provider: "MP3Quran", sourceUrl: "https://mp3quran.net/ar/api", moshaf: item.moshaf.map((m) => ({ id: m.id, name: m.name, server: m.server, availableSurahs: m.surah_list.split(",").map(Number).filter(Boolean) })) }));
}
