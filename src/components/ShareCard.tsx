"use client";

import { useEffect, useState } from "react";
import { Share2 } from "@/components/icons/NothoIcons";
import { analytics } from "@/lib/analytics";
import { markSharedToday } from "@/lib/dailyChallengeFlags";
import { duoCardCopy } from "@/lib/duoShareCard";
import { isIosNative } from "@/lib/capacitorPlatform";
import { isShareCancel, shareNativeFile } from "@/lib/nativeShare";
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

function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
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
  return lines.slice(0, 3);
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
    return `${data.headline}\n\n${data.sub}\n\nFree South African money lessons. notho.co.za`;
  }
  return generateShareText("lesson", { lessonTitle: data.lessonTitle, xp: data.xpEarned });
}

export function generateShareCard(data: ShareCardData): Promise<string> {
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
      ctx.fillText(copy.eyebrow, W / 2, 860);
    }

    if (data.type === "streak") {
      ctx.fillStyle = GOLD;
      ctx.font = "300 180px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.fillText(copy.number, W / 2, 1040);
      ctx.font = "400 42px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.fillText(copy.footnote, W / 2, 1120);
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
        ctx.fillText(copy.footnote, W / 2, 980 + lines.length * 86 + 92);
      }
    }

    drawWordmark(ctx, mark);
    return canvas.toDataURL("image/png");
  })();
}

async function blobFromCard(data: ShareCardData): Promise<Blob> {
  const dataUrl = await generateShareCard(data);
  return (await fetch(dataUrl)).blob();
}

async function shareTextFallback(data: ShareCardData, text: string): Promise<"shared" | "cancelled" | "failed"> {
  const shareType = data.type === "calculator" ? "badge" : data.type;
  if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
    try {
      await navigator.share({ title: "Notho", text, url: "https://www.notho.co.za" });
      analytics.shareTriggered(shareType, "native");
      markSharedToday();
      return "shared";
    } catch (err) {
      if (isShareCancel(err)) return "cancelled";
    }
  }
  if (typeof window !== "undefined") {
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
    analytics.shareTriggered(shareType, "whatsapp");
    markSharedToday();
    return "shared";
  }
  return "failed";
}

export async function shareDuoCard(data: ShareCardData): Promise<"shared" | "cancelled" | "downloaded" | "failed"> {
  const text = shareCaption(data);
  const shareType = data.type === "calculator" ? "badge" : data.type;
  try {
    // Image sheet is iPhone-only. Android, Huawei, web, and desktop keep text share.
    if (await isIosNative()) {
      const blob = await blobFromCard(data);
      const fileName = data.type === "streak" ? "notho-streak.png" : "notho-lesson.png";
      const native = await shareNativeFile({
        blob,
        fileName,
        title: "Notho",
        text,
        dialogTitle: "Share",
      });
      if (native === "shared") {
        analytics.shareTriggered(shareType, "native");
        markSharedToday();
        return "shared";
      }
      if (native === "cancelled") return "cancelled";
    }
    return shareTextFallback(data, text);
  } catch {
    return "failed";
  }
}

export function ShareResultButton({ data, label = "Share" }: { data: ShareCardData; label?: string }) {
  const [sharing, setSharing] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "done" | "error">("idle");

  const cardKey = JSON.stringify(data);
  useEffect(() => {
    let cancelled = false;
    generateShareCard(data).then((url) => {
      if (!cancelled) setPreview(url);
    }).catch(() => {});
    return () => { cancelled = true; };
    // cardKey is the stable snapshot of data
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cardKey]);

  const handleShare = async () => {
    setSharing(true);
    setStatus("idle");
    const result = await shareDuoCard(data);
    setSharing(false);
    if (result === "cancelled") return;
    setStatus(result === "failed" ? "error" : "done");
    window.setTimeout(() => setStatus("idle"), 2500);
  };

  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
      {preview ? (
        <img
          src={preview}
          alt=""
          style={{ width: 132, height: 234, objectFit: "cover", borderRadius: 16, boxShadow: "0 8px 24px rgba(28,36,48,0.08)" }}
        />
      ) : null}
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
        {sharing ? "Preparing…" : status === "done" ? "Shared" : status === "error" ? "Try again" : label}
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
  const handleShare = async () => {
    const method =
      typeof navigator !== "undefined" && typeof navigator.share === "function"
        ? "native"
        : "whatsapp";
    if (shareType) analytics.shareTriggered(shareType, method);
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({ text });
        markSharedToday();
        return;
      } catch {
        /* dismissed or unavailable */
      }
    }
    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${encoded}`, "_blank", "noopener,noreferrer");
    markSharedToday();
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      className="flex w-full items-center justify-center gap-2 rounded-xl border border-green-200 bg-green-50 py-3 text-sm font-semibold text-green-700 transition-colors hover:bg-green-100 dark:border-green-700 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/40"
    >
      <Share2 size={16} className="shrink-0" aria-hidden />
      <span>{label}</span>
    </button>
  );
}

export { generateShareText };
