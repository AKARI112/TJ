import { describe, expect, it } from "vitest";
import {
  DEFAULT_SHAMELA_SCOPE, isShamelaScope, normalizeShamelaSearch, parseMcpResponse,
} from "./shamela-format";

const sample = {
  passages: [{
    book: "صحيح البخاري - ط السلطانية",
    author: "محمد بن إسماعيل البخاري",
    text: "نص من المصدر",
    printedPage: "1/ 6",
    matchedIn: "body",
    matchQuality: "exact_phrase",
    sourceUrl: "https://shamela.ws/book/1681/10",
    pageId: 10,
  }],
  booksSearched: 8,
  totalMatches: 1,
  relaxedToTokens: false,
};

describe("Quran Gallery MCP response normalization", () => {
  it("parses structured JSON-RPC tool responses", () => {
    const rpc = JSON.stringify({ jsonrpc: "2.0", id: 1, result: { structuredContent: sample } });
    const result = normalizeShamelaSearch(parseMcpResponse(rpc, "application/json"));
    expect(result.hits).toHaveLength(1);
    expect(result.hits[0]?.sourceUrl).toBe("https://shamela.ws/book/1681/10");
    expect(result.hits[0]?.printedPage).toBe("1/ 6");
    expect(result.hits[0]?.excerpt).toBe("نص من المصدر");
  });

  it("accepts SSE frames with a JSON-RPC response", () => {
    const frame = "event: message\ndata: " +
      JSON.stringify({ jsonrpc: "2.0", id: 1, result: { structuredContent: sample } }) + "\n\n";
    expect(normalizeShamelaSearch(parseMcpResponse(frame, "text/event-stream")).hits).toHaveLength(1);
  });

  it("accepts official text-block JSON fallback", () => {
    const rpc = JSON.stringify({
      jsonrpc: "2.0", id: 1,
      result: { content: [{ type: "text", text: JSON.stringify(sample) }] },
    });
    expect(normalizeShamelaSearch(parseMcpResponse(rpc, "application/json")).booksSearched).toBe(8);
  });

  it("does not treat errors or malformed tool data as verified texts", () => {
    const rpc = JSON.stringify({ jsonrpc: "2.0", id: 1, result: { isError: true, content: [] } });
    expect(() => parseMcpResponse(rpc, "application/json")).toThrow("MCP_TOOL_ERROR");
    expect(() => normalizeShamelaSearch({ results: [] })).toThrow("UNRECOGNIZED_SHAMELA_FORMAT");
  });

  it("prevents third-party links and preserves footnote provenance", () => {
    const result = normalizeShamelaSearch({
      passages: [{
        book: "مصدر", matchedIn: "footnote", printedPage: null,
        sourceUrl: "https://example.org/unsafe", text: "تعليق",
      }],
    });
    expect(result.hits[0]?.sourceUrl).toBeNull();
    expect(result.hits[0]?.matchedIn).toBe("footnote");
    expect(result.hits[0]?.printedPage).toBeNull();
  });


  it("uses structured book/page identifiers for verified in-app reading", () => {
    const result = normalizeShamelaSearch({
      passages: [{
        book: "صحيح البخاري - طبعة تجريبية",
        author: "البخاري",
        docId: "1681:10",
        body: "نص من صفحة المصدر",
        printedPage: "1/ 6",
      }],
    });
    expect(result.hits[0]?.sourceUrl).toBe("https://shamela.ws/book/1681/10");
    expect(result.hits[0]?.pageId).toBe(10);
    expect(result.hits[0]?.excerpt).toBe("نص من صفحة المصدر");
  });

  it("never constructs source URLs from unvalidated identifiers", () => {
    const result = normalizeShamelaSearch({
      passages: [{ book: "اسم تجريبي", docId: "abc:10", url: "https://evil.example/book/12/5" }],
    });
    expect(result.hits[0]?.sourceUrl).toBeNull();
  });

  it("limits scopes to the documented library categories", () => {
    expect(isShamelaScope(DEFAULT_SHAMELA_SCOPE)).toBe(true);
    expect(isShamelaScope("unscoped")).toBe(false);
  });
});
