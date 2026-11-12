"use client";
import { localizeClientString } from "@/i18n/clientString";
import { LocalizedText as I18nText, LocalizedElement as I18nElement } from "@/i18n/LocalizedText";

import { useState, type CSSProperties } from "react";
import { Share2 } from "@/components/icons/NothoIcons";
import { duoCardCopy } from "@/lib/duoShareCard";
import { beginTextShare, openWhatsAppNow, startDuoShare } from "@/lib/shareHandoff";
import { generateShareText } from "@/app/pageViews.types";

export type ShareCardData =
  | { type: "lesson"; lessonTitle: string; xpEarned: number; isPerfect: boolean; courseName: string }
  | { type: "calculator"; headline: string; sub: string }
  | { type: "streak"; streakDays: number };

const W = 1080;
const H = 1920;
const INK = "#1C2430";
const TEAL = "#0E7C85";
const GOLD = "#E0A020";
const MUTED = "#8B95A1";
const PAPER = "#FFFEFB";

function polyfillRoundRect(ctx: CanvasRenderingContext2D) {
  if (typeof ctx.roundRect === "function") return;
  ctx.roundRect = function (x: number, y: number, w: number, h: number, r: number) {
    const radius = Math.min(r, w / 2, h / 2);
    this.moveTo(x + radius, y);
    this.lineTo(x + w - radius, y);
    this.quadraticCurveTo(x + w, y, x + w, y + radius);
    this.lineTo(x + w, y + h - radius);
    this.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
    this.lineTo(x + radius, y + h);
    this.quadraticCurveTo(x, y + h, x, y + h - radius);
    this.lineTo(x, y + radius);
    this.quadraticCurveTo(x, y, x + radius, y);
    this.closePath();
  };
}

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, maxLines = 3): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines.slice(0, maxLines);
}

function drawFlame(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.fillStyle = GOLD;
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.55);
  ctx.bezierCurveTo(size * 0.42, -size * 0.15, size * 0.38, size * 0.22, 0, size * 0.48);
  ctx.bezierCurveTo(-size * 0.38, size * 0.22, -size * 0.42, -size * 0.15, 0, -size * 0.55);
  ctx.fill();
  ctx.fillStyle = "#FFF4D2";
  ctx.beginPath();
  ctx.ellipse(0, size * 0.08, size * 0.16, size * 0.22, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawWordmark(ctx: CanvasRenderingContext2D, mark: HTMLImageElement | null) {
  const y = H - 150;
  if (mark) {
    ctx.drawImage(mark, W / 2 - 118, y - 22, 44, 44);
  }
  ctx.fillStyle = MUTED;
  ctx.font = "500 36px -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("notho", W / 2 - 64, y + 10);
}

export function shareCaption(data: ShareCardData): string {
  if (data.type === "streak") return generateShareText("streak", { streakDays: data.streakDays });
  if (data.type === "calculator") {
    return `${localizeClientString(data.headline)}\n\n${localizeClientString(data.sub)}\n\n${localizeClientString("Free South African money lessons. notho.co.za")}`;
  }
  return generateShareText("lesson", { lessonTitle: data.lessonTitle, xp: data.xpEarned });
}

function renderShareCanvas(data: ShareCardData): Promise<HTMLCanvasElement> {
  return (async () => {
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas unavailable");
    polyfillRoundRect(ctx);

    ctx.fillStyle = PAPER;
    ctx.fillRect(0, 0, W, H);

    const copy = duoCardCopy({
      type: data.type,
      lessonTitle: data.type === "lesson" ? data.lessonTitle : undefined,
      xpEarned: data.type === "lesson" ? data.xpEarned : undefined,
      isPerfect: data.type === "lesson" ? data.isPerfect : undefined,
      streakDays: data.type === "streak" ? data.streakDays : undefined,
      headline: data.type === "calculator" ? data.headline : undefined,
    });
    for (const key of ["eyebrow", "number", "title", "footnote"] as const) copy[key] = localizeClientString(copy[key]);
    const accent = data.type === "lesson" && data.isPerfect ? GOLD : data.type === "streak" ? GOLD : TEAL;
    const glow = ctx.createRadialGradient(W / 2, 620, 40, W / 2, 620, 460);
    glow.addColorStop(0, data.type === "streak" || (data.type === "lesson" && data.isPerfect) ? "rgba(224,160,32,0.28)" : "rgba(255,236,190,0.85)");
    glow.addColorStop(1, "rgba(255,254,251,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);

    const mark = await loadImage("/notho-icon-192.png");
    if (data.type === "streak") {
      drawFlame(ctx, W / 2, 620, 220);
    } else if (mark) {
      ctx.drawImage(mark, W / 2 - 120, 480, 240, 240);
    } else {
      ctx.fillStyle = TEAL;
      ctx.font = "bold 160px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("N", W / 2, 680);
    }

    ctx.textAlign = "center";
    if (copy.eyebrow) {
      ctx.fillStyle = accent;
      ctx.font = "600 34px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.fillText(copy.eyebrow, W / 2, 860, W - 160);
    }

    if (data.type === "streak") {
      ctx.fillStyle = GOLD;
      ctx.font = "300 180px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.fillText(copy.number, W / 2, 1040);
      ctx.font = "400 42px -apple-system, BlinkMacSystemFont, sans-serif";
      wrapLines(ctx, copy.footnote, W - 160).forEach((line, i) => ctx.fillText(line, W / 2, 1120 + i * 54));
    } else {
      ctx.fillStyle = INK;
      ctx.font = "700 72px -apple-system, BlinkMacSystemFont, sans-serif";
      const lines = wrapLines(ctx, copy.title, W - 160);
      lines.forEach((line, i) => ctx.fillText(line, W / 2, 980 + i * 86));
      if (copy.number) {
        ctx.fillStyle = GOLD;
        ctx.font = "500 56px -apple-system, BlinkMacSystemFont, sans-serif";
        ctx.fillText(copy.number, W / 2, 980 + lines.length * 86 + 36);
      }
      if (copy.footnote) {
        ctx.fillStyle = MUTED;
        ctx.font = "400 34px -apple-system, BlinkMacSystemFont, sans-serif";
        wrapLines(ctx, copy.footnote, W - 160).forEach((line, i) => ctx.fillText(line, W / 2, 980 + lines.length * 86 + 92 + i * 48));
      }
    }

    drawWordmark(ctx, mark);
    return canvas;
  })();
}

function canvasToPngBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    if (typeof canvas.toBlob !== "function") {
      reject(new Error("Canvas unavailable"));
      return;
    }
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Canvas unavailable"));
    }, "image/png");
  });
}

export function generateShareCard(data: ShareCardData): Promise<string> {
  return renderShareCanvas(data).then((canvas) => canvas.toDataURL("image/png"));
}

async function blobFromCard(data: ShareCardData): Promise<Blob> {
  return canvasToPngBlob(await renderShareCanvas(data));
}

/** Image sheet for a text-only button on the iPhone app. */
export function plainTextCardBlob(text: string): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return Promise.reject(new Error("Canvas unavailable"));
  polyfillRoundRect(ctx);
  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = INK;
  ctx.font = "600 54px -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.textAlign = "center";
  const lines = wrapLines(ctx, text.replace(/\s+/g, " ").trim(), W - 160, 8);
  lines.forEach((line, i) => ctx.fillText(line, W / 2, 820 + i * 72));
  ctx.fillStyle = MUTED;
  ctx.font = "500 36px -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.fillText("notho", W / 2, H - 140);
  return canvasToPngBlob(canvas);
}

/**
 * Not async on purpose. On Android, Huawei, web, and desktop the text sheet
 * or WhatsApp window has to open inside this call, before the first await.
 * The image card stays iPhone-app only.
 */
export function shareDuoCard(data: ShareCardData): Promise<"shared" | "cancelled" | "downloaded" | "failed" | "needs-whatsapp"> {
  const text = shareCaption(data);
  const shareType = data.type === "calculator" ? "badge" : data.type;
  return startDuoShare({
    text,
    shareType,
    fileName: data.type === "streak" ? "notho-streak.png" : "notho-lesson.png",
    createBlob: () => blobFromCard(data),
  });
}

function shareKind(data: ShareCardData): "lesson" | "badge" | "streak" {
  if (data.type === "calculator") return "badge";
  return data.type;
}

export function ShareResultButton({ data, label = "Share" }: { data: ShareCardData; label?: string }) {
  const [sharing, setSharing] = useState(false);
  const [status, setStatus] = useState<"idle" | "done" | "error">("idle");
  const [whatsapp, setWhatsapp] = useState(false);

  const handleShare = () => {
    if (whatsapp) {
      void openWhatsAppNow(shareCaption(data), shareKind(data)).then((ok) => {
        setWhatsapp(false);
        setStatus(ok ? "done" : "error");
        if (ok) window.setTimeout(() => setStatus("idle"), 2500);
      });
      return;
    }
    setSharing(true);
    setStatus("idle");
    void shareDuoCard(data).then((result) => {
      setSharing(false);
      if (result === "cancelled") return;
      if (result === "needs-whatsapp") {
        setWhatsapp(true);
        return;
      }
      setStatus(result === "failed" ? "error" : "done");
      window.setTimeout(() => setStatus("idle"), 2500);
    });
  };

  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
      <button
        type="button"
        onClick={handleShare}
        disabled={sharing}
        style={{
          display: "flex", alignItems: "center", gap: 8, justifyContent: "center",
          padding: "12px 20px", borderRadius: 12, cursor: sharing ? "default" : "pointer",
          border: `1.5px solid ${status === "error" ? "rgba(224,60,49,0.45)" : TEAL}`,
          background: "transparent",
          color: status === "error" ? "#E03C31" : TEAL,
          fontWeight: 700, fontSize: 15, width: "100%",
        }}
      >
        <Share2 size={16} />
        <I18nText>{sharing ? "Preparing…" : whatsapp ? "WhatsApp" : status === "done" ? "Shared" : status === "error" ? "Try again" : label}</I18nText>
      </button>
    </div>
  );
}

export function ShareButton({
  text,
  label = "Share",
  shareType,
}: {
  text: string;
  label?: string;
  shareType?: "lesson" | "badge" | "streak";
}) {
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<"idle" | "done" | "error">("idle");
  const [whatsapp, setWhatsapp] = useState(false);

  const handleShare = () => {
    if (busy) return;
    if (whatsapp) {
      void openWhatsAppNow(text, shareType).then((ok) => {
        setWhatsapp(false);
        setStatus(ok ? "done" : "error");
        if (ok) window.setTimeout(() => setStatus("idle"), 2500);
      });
      return;
    }
    setBusy(true);
    setStatus("idle");
    void beginTextShare({
      text,
      shareType,
      fileName: "notho-share.png",
      createBlob: () => plainTextCardBlob(text),
    }).then((result) => {
      setBusy(false);
      if (result === "cancelled") return;
      if (result === "needs-whatsapp") {
        setWhatsapp(true);
        return;
      }
      setStatus(result === "failed" ? "error" : "done");
      window.setTimeout(() => setStatus("idle"), 2500);
    });
  };

  const shown = whatsapp ? "WhatsApp" : status === "done" ? "Shared" : status === "error" ? "Try again" : label;

  return (
    <button
      type="button"
      onClick={handleShare}
      disabled={busy}
      aria-live="polite"
      className="flex w-full items-center justify-center gap-2 rounded-xl border border-green-200 bg-green-50 py-3 text-sm font-semibold text-green-700 transition-colors hover:bg-green-100 disabled:cursor-default dark:border-green-700 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/40"
      style={status === "error" ? { borderColor: "rgba(224,60,49,0.45)", color: "#E03C31" } : undefined}
    >
      <Share2 size={16} className="shrink-0" aria-hidden />
      <span><I18nText>{shown}</I18nText></span>
    </button>
  );
}

export function StreakShareButton({
  streakDays,
  className,
  style,
}: {
  streakDays: number;
  className?: string;
  style?: CSSProperties;
}) {
  const [failed, setFailed] = useState(false);
  const [whatsapp, setWhatsapp] = useState(false);

  return (
    <I18nElement
      as="button"
      type="button"
      onClick={() => {
        if (whatsapp) {
          void openWhatsAppNow(shareCaption({ type: "streak", streakDays }), "streak").then((ok) => {
            setWhatsapp(false);
            if (ok) return;
            setFailed(true);
            window.setTimeout(() => setFailed(false), 2500);
          });
          return;
        }
        setFailed(false);
        void shareDuoCard({ type: "streak", streakDays }).then((result) => {
          if (result === "needs-whatsapp") {
            setWhatsapp(true);
            return;
          }
          if (result !== "failed") return;
          setFailed(true);
          window.setTimeout(() => setFailed(false), 2500);
        });
      }}
      className={className}
      style={failed ? { ...style, color: "#E03C31" } : style}
      title={whatsapp ? "Share on WhatsApp" : failed ? "Couldn't share. Try again." : "Share your streak"}
      aria-label={whatsapp ? "Share on WhatsApp" : failed ? "Couldn't share. Try again." : "Share your streak"}
    >
      <Share2 size={18} aria-hidden />
      {whatsapp ? <span style={{ fontSize: 11, fontWeight: 700, marginLeft: 4 }}><I18nText>WhatsApp</I18nText></span> : null}
      {failed ? <span style={{ fontSize: 11, fontWeight: 700, marginLeft: 4 }}><I18nText>Try again</I18nText></span> : null}
    </I18nElement>
  );
}

export { generateShareText };
