"use client";
import { WifiOff } from "lucide-react";
import { useEffect, useState } from "react";

export function ConnectivityBanner() {
  const [offline, setOffline] = useState(false);
  useEffect(() => {
    const refresh = () => setOffline(!navigator.onLine);
    refresh();
    window.addEventListener("online", refresh);
    window.addEventListener("offline", refresh);
    return () => { window.removeEventListener("online", refresh); window.removeEventListener("offline", refresh); };
  }, []);
  if (!offline) return null;
  return <div role="status" className="flex flex-wrap items-center justify-center gap-2 border-b border-border bg-muted px-4 py-2 text-center text-xs text-foreground">
    <WifiOff className="size-4" />
    أنت دون اتصال. تتوفر الصفحات التي حُفظت مؤقتًا؛ الصوت والكتب الخارجية قد تتطلب الإنترنت.
    <a href="/offline" className="font-semibold underline underline-offset-4">معلومات دون اتصال</a>
  </div>;
}
