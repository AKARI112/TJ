import "server-only";
import { z } from "zod";

/**
 * Read a single page through the public Turath API as documented in Nusus.
 * We never mirror entire books or attempt to bypass upstream restrictions.
 */
const pageSchema = z.object({ meta: z.string(), text: z.string() });
const metadataSchema = z.object({
  book_name: z.string().min(1),
  author_name: z.string().optional(),
  page_id: z.coerce.number().int().positive().optional(),
  page: z.coerce.number().int().nonnegative().optional(),
  vol: z.union([z.string(), z.number()]).optional(),
  headings: z.array(z.string()).optional(),
}).passthrough();

export type TurathReadingPage = {
  bookName: string;
  authorName: string | null;
  internalPage: number;
  printedPage: number | null;
  volume: string | null;
  headings: string[];
  text: string;
  sourceUrl: string;
};

function toPlainText(source: string) {
  // The upstream page text can contain presentational tags. Treat it only as
  // text, never as trusted HTML to be injected into the application.
  return source.replace(/<br\s*\/?\s*>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/gi, " ").replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">").replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'").replace(/&amp;/gi, "&")
    .trim();
}

export function parseTurathReadingPage(
  value: unknown,
  bookId: number,
  requestedPage: number,
): TurathReadingPage {
  const payload = pageSchema.parse(value);
  const metadata = metadataSchema.parse(JSON.parse(payload.meta));
  if (metadata.page_id !== undefined && metadata.page_id !== requestedPage) {
    throw new Error("TURATH_PAGE_ID_MISMATCH");
  }
  const text = toPlainText(payload.text);
  if (!text) throw new Error("TURATH_EMPTY_PAGE");
  return {
    bookName: metadata.book_name,
    authorName: metadata.author_name ?? null,
    internalPage: requestedPage,
    printedPage: metadata.page ?? null,
    volume: metadata.vol === undefined ? null : String(metadata.vol),
    headings: metadata.headings ?? [],
    text,
    sourceUrl: `https://app.turath.io/book/${bookId}/${requestedPage}`,
  };
}

export async function getTurathReadingPage(bookId: number, page: number) {
  if (!Number.isSafeInteger(bookId) || bookId < 1 ||
      !Number.isSafeInteger(page) || page < 1 || page > 250000) {
    throw new Error("INVALID_TURATH_LOCATION");
  }

  const url = new URL("https://api.turath.io/page");
  url.searchParams.set("book_id", String(bookId));
  url.searchParams.set("pg", String(page));
  url.searchParams.set("ver", "3");

  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    next: { revalidate: 60 * 60 * 6 },
    signal: AbortSignal.timeout(9_000),
  });

  if (!response.ok) throw new Error(`TURATH_HTTP_${response.status}`);
  const declaredBytes = Number(response.headers.get("content-length") ?? 0);
  if (declaredBytes > 1_000_000) throw new Error("TURATH_PAGE_TOO_LARGE");
  const body = await response.text();
  if (body.length > 1_000_000) throw new Error("TURATH_PAGE_TOO_LARGE");
  return parseTurathReadingPage(JSON.parse(body) as unknown, bookId, page);
}
