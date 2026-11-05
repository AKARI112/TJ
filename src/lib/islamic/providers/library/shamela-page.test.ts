import { describe, expect, it } from "vitest";
import { parseShamelaReadingPage, shamelaReaderLink } from "./shamela-page";

describe("full Shamela page reader", () => {
  it("preserves author text and editorial notes as distinct sections", () => {
    const result = parseShamelaReadingPage({
      book_name: "اسم كتاب تجريبي",
      edition: "طبعة محققة",
      printed_page: "1/ 6",
      body: "متن الكتاب هنا",
      foot: "تنبيه المحقق هنا",
      comment: "",
      prev_page_id: 9,
      next_page_id: 11,
    }, 1681, 10);
    expect(result.body).toBe("متن الكتاب هنا");
    expect(result.foot).toBe("تنبيه المحقق هنا");
    expect(result.printedPage).toBe("1/ 6");
    expect(result.nextPageId).toBe(11);
    expect(result.sourceUrl).toBe("https://shamela.ws/book/1681/10");
  });

  it("rejects missing body rather than fabricating text", () => {
    expect(() => parseShamelaReadingPage({ book_name: "عنوان" }, 1, 1)).toThrow("SHAMELA_MISSING_BODY");
  });

  it("generates only safely validated first-party reading links", () => {
    expect(shamelaReaderLink("https://shamela.ws/book/1681/10")).toBe("/library/shamela/read/1681/10");
    expect(shamelaReaderLink("https://evil.example/book/1681/10")).toBeNull();
    expect(shamelaReaderLink("javascript:alert(1)")).toBeNull();
    expect(shamelaReaderLink("https://shamela.ws/author/1681")).toBeNull();
  });
});
