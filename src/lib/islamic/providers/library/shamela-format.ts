/** Parsing for Quran Gallery's read-only Shamela MCP tool responses. */
export const SHAMELA_SCOPES = [
  { value: "hadith-primary", label: "كتب الحديث الأصلية" },
  { value: "tafsir-canonical", label: "التفاسير المعتمدة" },
  { value: "fiqh-hanafi", label: "الفقه الحنفي" },
  { value: "fiqh-maliki", label: "الفقه المالكي" },
  { value: "fiqh-shafii", label: "الفقه الشافعي" },
  { value: "fiqh-hanbali", label: "الفقه الحنبلي" },
  { value: "fiqh-comparative", label: "الفقه المقارن" },
  { value: "aqeedah", label: "العقيدة" },
  { value: "hadith-sciences", label: "علوم الحديث" },
  { value: "tafsir", label: "التفسير وعلوم القرآن" },
  { value: "seerah", label: "السيرة والتاريخ" },
  { value: "lugha", label: "اللغة العربية" },
] as const;

export type ShamelaScope = (typeof SHAMELA_SCOPES)[number]["value"];
export const DEFAULT_SHAMELA_SCOPE: ShamelaScope = "hadith-primary";

export function isShamelaScope(input: string): input is ShamelaScope {
  return SHAMELA_SCOPES.some((scope) => scope.value === input);
}

type RecordValue = Record<string, unknown>;
function asRecord(value: unknown): RecordValue | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? value as RecordValue
    : null;
}
function firstText(input: RecordValue, ...keys: string[]): string | null {
  for (const key of keys) {
    const value = input[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return null;
}
function optionalNumber(input: RecordValue, key: string): number | null {
  const value = input[key];
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}
function identifier(input: unknown) {
  if (typeof input === "number" && Number.isSafeInteger(input) && input > 0) return input;
  if (typeof input === "string" && /^[1-9]\d*$/.test(input)) {
    const value = Number(input);
    return Number.isSafeInteger(value) ? value : null;
  }
  return null;
}

/** Resolve only provider-owned, validated book/page locators (never arbitrary external URLs). */
function pageLink(input: RecordValue): string | null {
  const existing = safeShamelaUrl(input.sourceUrl ?? input.source_url ?? input.url);
  if (existing) return existing;

  const docId = firstText(input, "docId", "doc_id", "id");
  const matched = docId ? /^([1-9]\d*):([1-9]\d*)$/.exec(docId) : null;
  const bookId = matched ? identifier(matched[1]) : identifier(input.bookId ?? input.book_id);
  const pageId = matched ? identifier(matched[2]) : identifier(input.pageId ?? input.page_id);
  if (!bookId || !pageId) return null;
  return `https://shamela.ws/book/${bookId}/${pageId}`;
}


export type ShamelaHit = {
  book: string;
  author: string | null;
  excerpt: string | null;
  printedPage: string | null;
  sourceUrl: string | null;
  matchedIn: "body" | "footnote" | "both" | "unknown";
  matchQuality: string | null;
  edition: string | null;
  pageId: number | null;
};

export type ShamelaSearch = {
  hits: ShamelaHit[];
  booksSearched: number | null;
  totalMatches: number | null;
  relaxedToTokens: boolean;
  note: string | null;
};

function safeShamelaUrl(input: unknown) {
  if (typeof input !== "string") return null;
  try {
    const url = new URL(input);
    return url.protocol === "https:" &&
      (url.hostname === "shamela.ws" || url.hostname === "www.shamela.ws") &&
      url.pathname.startsWith("/book/") ? url.href : null;
  } catch {
    return null;
  }
}

/** Never manufacture Arabic text or bibliographic references from a loose match. */
export function normalizeShamelaSearch(input: unknown): ShamelaSearch {
  const data = asRecord(input);
  if (!data || !Array.isArray(data.passages)) throw new Error("UNRECOGNIZED_SHAMELA_FORMAT");
  const hits: ShamelaHit[] = [];
  for (const item of data.passages.slice(0, 20)) {
    const row = asRecord(item);
    if (!row) continue;
    const book = firstText(row, "book", "bookName", "book_name", "title");
    if (!book) continue;
    const matched = firstText(row, "matchedIn", "matched_in") ?? "unknown";
    hits.push({
      book,
      author: firstText(row, "author", "authorName", "author_name"),
      excerpt: firstText(row, "excerpt", "text", "passage", "snippet", "quote", "body"),
      printedPage: firstText(row, "printedPage", "printed_page"),
      sourceUrl: pageLink(row),
      matchedIn: matched === "body" || matched === "footnote" || matched === "both" ? matched : "unknown",
      matchQuality: firstText(row, "matchQuality", "match_quality"),
      edition: firstText(row, "edition", "editionName", "edition_name"),
      pageId: identifier(row.pageId ?? row.page_id) ?? identifier(firstText(row, "docId", "doc_id")?.split(":")[1]),
    });
  }
  return {
    hits,
    booksSearched: optionalNumber(data, "booksSearched"),
    totalMatches: optionalNumber(data, "totalMatches"),
    relaxedToTokens: data.relaxedToTokens === true,
    note: typeof data.note === "string" ? data.note.slice(0, 350) : null,
  };
}

function parseJsonSafely(source: string): unknown {
  try { return JSON.parse(source) as unknown; }
  catch { throw new Error("INVALID_MCP_JSON"); }
}

/**
 * Streamable HTTP servers can reply with JSON or SSE frames containing JSON-RPC.
 * Accept only the final well-formed response for the current request.
 */
export function parseMcpResponse(raw: string, contentType: string): unknown {
  let response: unknown;
  if (contentType.includes("text/event-stream")) {
    const frames = raw.split(/\r?\n\r?\n/);
    for (const frame of frames) {
      const data = frame.split(/\r?\n/)
        .filter((line) => line.startsWith("data:"))
        .map((line) => line.slice(5).trimStart()).join("\n");
      if (!data || data === "[DONE]") continue;
      const candidate = parseJsonSafely(data);
      const record = asRecord(candidate);
      if (record && ("result" in record || "error" in record)) response = candidate;
    }
    if (!response) throw new Error("EMPTY_MCP_STREAM");
  } else {
    response = parseJsonSafely(raw);
  }
  const envelope = asRecord(response);
  if (!envelope) throw new Error("INVALID_MCP_RESPONSE");
  if (envelope.error) throw new Error("MCP_RPC_ERROR");
  const result = asRecord(envelope.result);
  if (!result || result.isError === true) throw new Error("MCP_TOOL_ERROR");

  if (asRecord(result.structuredContent)) return result.structuredContent;
  const content = Array.isArray(result.content) ? result.content : [];
  for (const block of content) {
    const item = asRecord(block);
    if (item?.type === "text" && typeof item.text === "string") {
      const decoded = parseJsonSafely(item.text);
      if (asRecord(decoded)) return decoded;
    }
  }
  throw new Error("MCP_MISSING_STRUCTURED_CONTENT");
}
