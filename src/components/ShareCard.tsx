"use client";

import { useState } from "react";
import { Share2 } from "@/components/icons/NothoIcons";
import { analytics } from "@/lib/analytics";
import { markSharedToday } from "@/lib/dailyChallengeFlags";
import { generateShareText } from "@/app/pageViews.types";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ShareCardData =
  | { type: "lesson"; lessonTitle: string; xpEarned: number; isPerfect: boolean; courseName: string }
  | { type: "calculator"; headline: string; sub: string };

// ─── Canvas share-card generator ─────────────────────────────────────────────

export function generateShareCard(data: ShareCardData): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const W = 1080, H = 1920;
      const canvas = document.createElement("canvas");
      canvas.width = W; canvas.height = H;
      const ctx = canvas.getContext("2d")!;

      // Polyfill ctx.roundRect for browsers that don't support it natively
      if (typeof ctx.roundRect !== "function") {
        ctx.roundRect = function(x: number, y: number, w: number, h: number, r: number) {
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

      // Background gradient
      const bg = ctx.createLinearGradient(0, 0, W, H);
      bg.addColorStop(0, "#06201F");
      bg.addColorStop(0.6, "#082A29");
      bg.addColorStop(1, "#061009");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // Radial glow centre
      const glow = ctx.createRadialGradient(W / 2, H * 0.42, 0, W / 2, H * 0.42, 480);
      glow.addColorStop(0, "rgba(34,197,94,0.22)");
      glow.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, W, H);

      // Subtle grid lines
      ctx.strokeStyle = "rgba(34,197,94,0.06)";
      ctx.lineWidth = 1;
      for (let x = 0; x < W; x += 60) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
      for (let y = 0; y < H; y += 60) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

      // Top brand strip
      ctx.fillStyle = "rgba(0,122,60,0.18)";
      ctx.beginPath(); ctx.roundRect(60, 100, W - 120, 90, 18); ctx.fill();
      ctx.fillStyle = "#22c55e";
      ctx.font = "bold 36px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("NOTHO", W / 2, 156);

      if (data.type === "lesson") {
        // Big trophy icon area
        ctx.fillStyle = "rgba(239,179,67,0.12)";
        ctx.beginPath(); ctx.arc(W / 2, H * 0.35, 140, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#EFB343";
        ctx.font = "140px serif";
        ctx.textAlign = "center";
        ctx.fillText("🏆", W / 2, H * 0.35 + 52);

        ctx.fillStyle = "rgba(255,255,255,0.08)";
        ctx.beginPath(); ctx.roundRect(60, H * 0.52, W - 120, 260, 24); ctx.fill();

        ctx.fillStyle = "#ffffff";
        ctx.font = `bold 58px -apple-system, BlinkMacSystemFont, sans-serif`;
        ctx.textAlign = "center";
        // wrap long titles
        const words = data.lessonTitle.split(" ");
        let line = ""; const lines: string[] = [];
        for (const w of words) {
          const test = line + (line ? " " : "") + w;
          if (ctx.measureText(test).width > W - 160) { lines.push(line); line = w; }
          else line = test;
        }
        lines.push(line);
        lines.forEach((l, i) => ctx.fillText(l, W / 2, H * 0.54 + i * 70));

        ctx.fillStyle = "#22c55e";
        ctx.font = `bold 48px -apple-system, BlinkMacSystemFont, sans-serif`;
        ctx.fillText(`+${data.xpEarned} XP earned`, W / 2, H * 0.54 + lines.length * 70 + 60);

        if (data.isPerfect) {
          ctx.fillStyle = "#EFB343";
          ctx.font = `bold 38px -apple-system, BlinkMacSystemFont, sans-serif`;
          ctx.fillText("⭐ Perfect Score!", W / 2, H * 0.54 + lines.length * 70 + 120);
        }

        ctx.fillStyle = "rgba(255,255,255,0.45)";
        ctx.font = `500 34px -apple-system, BlinkMacSystemFont, sans-serif`;
        ctx.fillText(`${data.courseName} course`, W / 2, H * 0.82);
      } else {
        // Calculator card
        ctx.fillStyle = "rgba(34,197,94,0.1)";
        ctx.beginPath(); ctx.roundRect(60, H * 0.28, W - 120, 500, 28); ctx.fill();
        ctx.strokeStyle = "rgba(34,197,94,0.3)";
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.roundRect(60, H * 0.28, W - 120, 500, 28); ctx.stroke();

        ctx.fillStyle = "#22c55e";
        ctx.font = `bold 42px -apple-system, BlinkMacSystemFont, sans-serif`;
        ctx.textAlign = "center";
        ctx.fillText("I just discovered…", W / 2, H * 0.31);

        ctx.fillStyle = "#ffffff";
        ctx.font = `bold 68px -apple-system, BlinkMacSystemFont, sans-serif`;
        // wrap headline
        const words2 = data.headline.split(" ");
        let line2 = ""; const lines2: string[] = [];
        for (const w of words2) {
          const test = line2 + (line2 ? " " : "") + w;
          if (ctx.measureText(test).width > W - 180) { lines2.push(line2); line2 = w; }
          else line2 = test;
        }
        lines2.push(line2);
        lines2.forEach((l, i) => ctx.fillText(l, W / 2, H * 0.37 + i * 80));

        ctx.fillStyle = "rgba(255,255,255,0.55)";
        ctx.font = `500 38px -apple-system, BlinkMacSystemFont, sans-serif`;
        const subWords = data.sub.split(" ");
        let subLine = ""; const subLines: string[] = [];
        for (const w of subWords) {
          const test = subLine + (subLine ? " " : "") + w;
          if (ctx.measureText(test).width > W - 200) { subLines.push(subLine); subLine = w; }
          else subLine = test;
        }
        subLines.push(subLine);
        subLines.forEach((l, i) => ctx.fillText(l, W / 2, H * 0.37 + lines2.length * 80 + 60 + i * 52));
      }

      // Bottom CTA
      ctx.fillStyle = "#22c55e";
      ctx.beginPath(); ctx.roundRect(120, H - 220, W - 240, 80, 40); ctx.fill();
      ctx.fillStyle = "#000000";
      ctx.font = `bold 34px -apple-system, BlinkMacSystemFont, sans-serif`;
      ctx.fillText("Try it FREE → notho.co.za", W / 2, H - 170);

      ctx.fillStyle = "rgba(255,255,255,0.25)";
      ctx.font = `500 28px -apple-system, BlinkMacSystemFont, sans-serif`;
      ctx.fillText("Real money skills. Start free at notho.co.za", W / 2, H - 110);

      resolve(canvas.toDataURL("image/png"));
    } catch (err) { reject(err); }
  });
}

// ─── ShareResultButton ────────────────────────────────────────────────────────

export function ShareResultButton({ data, label = "Share" }: { data: ShareCardData; label?: string }) {
  const [sharing, setSharing] = useState(false);
  const [status, setStatus] = useState<"idle" | "done" | "error">("idle");

  const handleShare = async () => {
    setSharing(true);
    setStatus("idle");
    try {
      const dataUrl = await generateShareCard(data);
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], "notho-result.png", { type: "image/png" });

      const text = data.type === "calculator"
        ? `${data.headline} - calculated on Notho 📊 Try it free at notho.co.za`
        : `I just completed "${data.lessonTitle}" (+${data.xpEarned} XP) on Notho 🎓 notho.co.za`;

      let shared = false;
      // Try native share with file
      if (!shared && navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({ files: [file], title: "Notho", text });
          analytics.shareTriggered(data.type === "lesson" ? "lesson" : "badge", "native");
          shared = true;
        } catch { /* cancelled or blocked */ }
      }
      // Try native share without file
      if (!shared && navigator.share) {
        try {
          await navigator.share({ title: "Notho", text, url: "https://notho.co.za" });
          shared = true;
        } catch { /* cancelled */ }
      }
      // Fallback: download the image
      if (!shared) {
        const a = document.createElement("a");
        a.href = dataUrl;
        a.download = "notho-result.png";
        a.click();
        shared = true;
      }
      setStatus("done");
      markSharedToday();
    } catch {
      setStatus("error");
    }
    setSharing(false);
    if (status !== "error") setTimeout(() => setStatus("idle"), 3000);
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      disabled={sharing}
      style={{
        display: "flex", alignItems: "center", gap: 8, justifyContent: "center",
        padding: "12px 20px", borderRadius: 12, cursor: sharing ? "default" : "pointer",
        border: `1.5px solid ${status === "error" ? "rgba(239,68,68,0.4)" : "rgba(34,197,94,0.4)"}`,
        background: status === "error" ? "rgba(239,68,68,0.08)" : "rgba(34,197,94,0.08)",
        color: status === "error" ? "#ef4444" : "#22c55e", fontWeight: 700, fontSize: 14, width: "100%",
      }}
    >
      <Share2 size={16} />
      {sharing ? "Generating…" : status === "done" ? "Saved / Shared ✓" : status === "error" ? "Try again" : label}
    </button>
  );
}

// ─── ShareButton ──────────────────────────────────────────────────────────────

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

// Re-export generateShareText so callers that used to get it from pageViews can
// optionally import it from here instead.
export { generateShareText };
