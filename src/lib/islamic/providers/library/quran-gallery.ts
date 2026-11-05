import "server-only";
import { normalizeShamelaSearch, parseMcpResponse, type ShamelaScope, type ShamelaSearch } from "./shamela-format";
import { parseShamelaReadingPage, type ShamelaReadingPage } from "./shamela-page";

const SHAMELA_MCP_ENDPOINT = "https://qurangallery.com/mcp/shamela";
const MAX_RESPONSE_BYTES = 1_500_000;

export class ShamelaSourceError extends Error {
  constructor(public readonly status: "unavailable" | "limited" | "invalid", cause?: unknown) {
    super("SHAMELA_" + status.toUpperCase(), { cause });
    this.name = "ShamelaSourceError";
  }
}

/** This function is server-only: credentials never reach HTML, client bundles or JSON responses. */
export async function searchShamelaText(query: string, scope: ShamelaScope): Promise<ShamelaSearch> {
  const text = query.trim();
  if (text.length < 2 || text.length > 100 || !/[\u0621-\u064A]/.test(text)) {
    throw new ShamelaSourceError("invalid");
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json, text/event-stream",
  };
  const key = process.env.QURAN_GALLERY_API_KEY?.trim();
  if (key) headers.Authorization = `Bearer ${key}`;

  let response: Response;
  try {
    response = await fetch(SHAMELA_MCP_ENDPOINT, {
      method: "POST",
      headers,
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "tools/call",
        params: {
          name: "shamela_search_library",
          arguments: { query: text, scope, limit: 8 },
        },
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(13_000),
    });
  } catch (error) {
    console.warn("[shamela] external MCP connection unavailable");
    throw new ShamelaSourceError("unavailable", error);
  }

  if (!response.ok) {
    // Do not log authentication headers, key values, request content or response bodies.
    console.warn("[shamela] external MCP returned HTTP status", response.status);
    throw new ShamelaSourceError(response.status === 429 ? "limited" : "unavailable");
  }

  const size = Number(response.headers.get("content-length") ?? 0);
  if (size > MAX_RESPONSE_BYTES) throw new ShamelaSourceError("invalid");
  const raw = await response.text();
  if (raw.length > MAX_RESPONSE_BYTES) throw new ShamelaSourceError("invalid");

  try {
    const payload = parseMcpResponse(raw, response.headers.get("content-type") ?? "application/json");
    return normalizeShamelaSearch(payload);
  } catch (error) {
    console.warn("[shamela] external MCP response format unsupported");
    throw new ShamelaSourceError("invalid", error);
  }
}

/** Read one full Shamela page when the catalogue returned a verified book/page ID. */
export async function readShamelaPage(bookId: number, pageId: number): Promise<ShamelaReadingPage> {
  if (!Number.isSafeInteger(bookId) || bookId < 1 || bookId > 10_000_000 ||
      !Number.isSafeInteger(pageId) || pageId < 1 || pageId > 1_000_000) {
    throw new ShamelaSourceError("invalid");
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json, text/event-stream",
  };
  const key = process.env.QURAN_GALLERY_API_KEY?.trim();
  if (key) headers.Authorization = `Bearer ${key}`;

  let response: Response;
  try {
    response = await fetch(SHAMELA_MCP_ENDPOINT, {
      method: "POST",
      headers,
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "tools/call",
        params: {
          name: "shamela_read",
          arguments: { unit: "page", book_id: bookId, page_id: pageId },
        },
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(13_000),
    });
  } catch (cause) {
    console.warn("[shamela] page reader connection unavailable");
    throw new ShamelaSourceError("unavailable", cause);
  }

  if (!response.ok) {
    console.warn("[shamela] page reader upstream status", response.status);
    throw new ShamelaSourceError(response.status === 429 ? "limited" : "unavailable");
  }
  if (Number(response.headers.get("content-length") ?? 0) > MAX_RESPONSE_BYTES) {
    throw new ShamelaSourceError("invalid");
  }

  const raw = await response.text();
  if (raw.length > MAX_RESPONSE_BYTES) throw new ShamelaSourceError("invalid");
  try {
    const payload = parseMcpResponse(raw, response.headers.get("content-type") ?? "application/json");
    return parseShamelaReadingPage(payload, bookId, pageId);
  } catch (cause) {
    console.warn("[shamela] page data could not be verified");
    throw new ShamelaSourceError("invalid", cause);
  }
}
