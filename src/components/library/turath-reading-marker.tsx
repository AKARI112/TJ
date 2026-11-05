"use client";

import { Bookmark } from "lucide-react";
import { useEffect, useState } from "react";

export function TurathReadingMarker({ bookId, page }: { bookId: number; page: number }) {
  const [previous, setPrevious] = useState<number | null>(null);

  useEffect(() => {
    try {
      const key = `dhu-al-jalal:turath-progress:${bookId}`;
      const last = Number(localStorage.getItem(key));
      if (Number.isSafeInteger(last) && last > 1 && last !== page) setPrevious(last);
      localStorage.setItem(key, String(page));
    } catch {
      // Local storage permissions do not prevent reading the book.
    }
  }, [bookId, page]);

  return <div className="flex flex-wrap items-center gap-2 text-xs leading-6 text-muted-foreground">
    <Bookmark className="size-4" aria-hidden="true" />
    <span>يُحفظ موضع قراءتك محليًا على هذا الجهاز.</span>
    {previous && <a className="font-semibold text-primary underline underline-offset-4" href={`/library/turath/${bookId}?page=${previous}`}>متابعة من صفحة {previous.toLocaleString("ar-SA")}</a>}
  </div>;
}
