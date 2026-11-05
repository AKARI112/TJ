/** Pure, source-preserving parsing for Quran Gallery's full Shamela page tool. */
type RecordValue = Record<string, unknown>;
const record = (item: unknown): RecordValue | null =>
  typeof item === "object" && item !== null && !Array.isArray(item) ? item as RecordValue : null;

function text(item: unknown): string | null {
  if (typeof item === "string") return item.trim() || null;
  if (Array.isArray(item) && item.every((piece) => typeof piece === "string")) {
    return item.join("\n").trim() || null;
  }
  return null;
}
function int(item: unknown) {
  const value = typeof item === "string" && /^\d+$/.test(item) ? Number(item) : item;
  return typeof value === "number" && Number.isSafeInteger(value) && value > 0 ? value : null;
}

export type ShamelaReadingPage = {
  bookName: string;
  printedPage: string | null;
  edition: string | null;
  body: string;
  foot: string | null;
  comment: string | null;
  previousPageId: number | null;
  nextPageId: number | null;
  sourceUrl: string;
};

export function parseShamelaReadingPage(value: unknown, bookId: number, pageId: number): ShamelaReadingPage {
  const outer = record(value);
  const page = record(outer?.page) ?? outer;
  if (!page) throw new Error("SHAMELA_INVALID_PAGE");
  const body = text(page.body);
  if (!body) throw new Error("SHAMELA_MISSING_BODY");
  return {
    bookName: text(page.book_name) ?? text(page.bookName) ?? "صفحة من المكتبة الشاملة",
    printedPage: text(page.printed_page) ?? text(page.printedPage),
    edition: text(page.edition),
    body,
    foot: text(page.foot),
    comment: text(page.comment),
    previousPageId: int(page.prev_page_id ?? page.prevPageId),
    nextPageId: int(page.next_page_id ?? page.nextPageId),
    sourceUrl: `https://shamela.ws/book/${bookId}/${pageId}`,
  };
}

/** Only URLs already verified as official Shamela page links can open a reader. */
export function shamelaReaderLink(sourceUrl: string | null): string | null {
  if (!sourceUrl) return null;
  let url: URL;
  try { url = new URL(sourceUrl); } catch { return null; }
  if (url.protocol !== "https:" || !["shamela.ws", "www.shamela.ws"].includes(url.hostname)) return null;
  const match = /^\/book\/([1-9]\d*)\/([1-9]\d*)\/?$/.exec(url.pathname);
  if (!match) return null;
  const bookId = Number(match[1]);
  const pageId = Number(match[2]);
  if (!Number.isSafeInteger(bookId) || !Number.isSafeInteger(pageId)) return null;
  return `/library/shamela/read/${bookId}/${pageId}`;
}
