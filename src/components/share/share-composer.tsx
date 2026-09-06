"use client";

import { Copy, Download, ImageDown, Share2 } from "lucide-react";
import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import { BottomSheet } from "@/components/motion/bottom-sheet";
import { Button } from "@/components/ui/button";

type Aspect = "1:1" | "4:5" | "9:16";
type Template = "mushaf" | "graphite" | "light" | "minimal";

type ShareComposerProps = {
  text: string;
  reference: string;
  title: string;
  quran?: boolean;
  compact?: boolean;
};

export function ShareComposer({ text, reference, title, quran = false, compact = true }: ShareComposerProps) {
  const [open, setOpen] = useState(false);
  const [aspect, setAspect] = useState<Aspect>("4:5");
  const [template, setTemplate] = useState<Template>(quran ? "mushaf" : "graphite");
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState("");
  const preview = useRef<HTMLDivElement>(null);
  const templates: Array<[Template, string]> = quran
    ? [["mushaf", "ورقي قرآني"], ["graphite", "جرافيت"], ["light", "فاتح"], ["minimal", "هادئ"]]
    : [["graphite", "جرافيت"], ["light", "فاتح"], ["minimal", "هادئ"]];

  async function render() {
    if (!preview.current) throw new Error("المعاينة غير جاهزة");
    setBusy(true);
    await document.fonts.ready;
    const lightTemplate = template === "light" || template === "mushaf";
    const dataUrl = await toPng(preview.current, {
      pixelRatio: 2,
      cacheBust: true,
      backgroundColor: lightTemplate ? "#fffdf6" : "#101113",
    });
    setBusy(false);
    return dataUrl;
  }

  async function download() {
    try {
      const dataUrl = await render();
      const link = document.createElement("a");
      link.download = `dhu-al-jalal-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
      setFeedback("حُفظت الصورة");
    } catch {
      setBusy(false);
      setFeedback("تعذر إنشاء الصورة على هذا المتصفح");
    }
  }

  async function share() {
    try {
      const dataUrl = await render();
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], "dhu-al-jalal.png", { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ title, files: [file] });
      } else {
        const link = document.createElement("a");
        link.download = file.name;
        link.href = dataUrl;
        link.click();
        setFeedback("حُفظت الصورة لأن مشاركة الملفات غير مدعومة");
      }
    } catch {
      setBusy(false);
      setFeedback("تعذرت المشاركة");
    }
  }

  return <>
    <button type="button" onClick={() => setOpen(true)} aria-label="حفظ كصورة" className={compact ? undefined : "primary-link"}>
      <ImageDown />{!compact && "حفظ كصورة"}
    </button>
    <BottomSheet open={open} onOpenChange={setOpen} snapPoints={[0.82, 0.96]} title="بطاقة مشاركة" description="البطاقة منفصلة عن صفحة المصحف وتُنشأ محليًا على جهازك">
      <div className="share-composer">
        <div className="share-options">
          <fieldset>
            <legend>النسبة</legend>
            {(["1:1", "4:5", "9:16"] as Aspect[]).map((value) => <button type="button" key={value} aria-pressed={aspect === value} onClick={() => setAspect(value)}>{value}</button>)}
          </fieldset>
          <fieldset>
            <legend>القالب</legend>
            {templates.map(([value, label]) => <button type="button" key={value} aria-pressed={template === value} onClick={() => setTemplate(value)}>{label}</button>)}
          </fieldset>
        </div>

        <div className="share-preview-frame">
          <div ref={preview} className={`share-preview share-${aspect.replace(":", "-")} share-${template}`}>
            <header><span>ذُو الجَلاَلْ</span><i /></header>
            <div><p className={quran ? "share-quran" : ""} lang="ar" dir="rtl">{text}</p><small>{reference}</small></div>
            <footer>{quran && template === "mushaf" ? "بطاقة مشاركة · ذُو الجَلاَلْ" : "ذُو الجَلاَلْ · محتوى بمصدره"}</footer>
          </div>
        </div>

        <div className="share-actions">
          <Button onClick={() => void download()} disabled={busy}><Download />{busy ? "جارٍ الإنشاء…" : "حفظ الصورة"}</Button>
          <Button variant="outline" onClick={() => void share()} disabled={busy}><Share2 />مشاركة</Button>
          <Button variant="outline" onClick={() => void navigator.clipboard.writeText(`${text}\n\n${reference}`).then(() => setFeedback("تم نسخ النص"))}><Copy />نسخ النص</Button>
        </div>
        <p className="sr-status" aria-live="polite">{feedback}</p>
      </div>
    </BottomSheet>
  </>;
}
