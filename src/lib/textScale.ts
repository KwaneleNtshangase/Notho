/**
 * Text size follows the OS (iOS Dynamic Type / per-app text size, Android
 * font scale) the same way dark mode follows the OS.
 *
 * Why this was broken:
 * Tailwind preflight sets -webkit-text-size-adjust: 100%, which tells iOS
 * to ignore Settings → Display & Text Size and Per-App Settings. Most of
 * the UI is also hardcoded px, so rem-only tricks do nothing.
 *
 * Fix: force text-size-adjust: auto, size the root from -apple-system-body
 * (that token tracks Dynamic Type), then apply the measured scale as zoom
 * so px copy scales too. Manual Small/Default/Large remains an override.
 */

export const TEXT_SCALE_KEY = "notho-text-scale";

export const TEXT_SCALES = ["system", "sm", "md", "lg", "xl"] as const;
export type TextScale = (typeof TEXT_SCALES)[number];

export const TEXT_SCALE_FACTOR: Record<Exclude<TextScale, "system">, number> = {
  sm: 0.9,
  md: 1,
  lg: 1.15,
  xl: 1.3,
};

export const TEXT_SCALE_LABEL: Record<TextScale, string> = {
  system: "System",
  sm: "Small",
  md: "Default",
  lg: "Large",
  xl: "Extra large",
};

/** iOS default ("Large" in Settings) for -apple-system-body. */
const SYSTEM_BODY_BASE_PX = 17;

export function isTextScale(value: string | null): value is TextScale {
  return value === "system" || value === "sm" || value === "md" || value === "lg" || value === "xl";
}

export function readTextScale(): TextScale {
  if (typeof window === "undefined") return "system";
  try {
    const raw = window.localStorage.getItem(TEXT_SCALE_KEY);
    // Previous build defaulted to "md" and wrote that on first visit.
    // Treat missing / that first-run default as follow-system.
    if (!raw || raw === "md") return "system";
    return isTextScale(raw) ? raw : "system";
  } catch {
    return "system";
  }
}

function measureSystemScale(): number {
  if (typeof document === "undefined") return 1;
  const probe = document.createElement("div");
  probe.setAttribute("aria-hidden", "true");
  probe.style.cssText =
    "position:absolute;left:-9999px;top:0;visibility:hidden;pointer-events:none;font:-apple-system-body;";
  document.documentElement.appendChild(probe);
  const px = parseFloat(window.getComputedStyle(probe).fontSize || "");
  probe.remove();
  if (!Number.isFinite(px) || px <= 0) return 1;
  const scale = px / SYSTEM_BODY_BASE_PX;
  return Math.min(2.2, Math.max(0.75, scale));
}

function setAdjustAuto(root: HTMLElement): void {
  root.style.setProperty("-webkit-text-size-adjust", "auto");
  root.style.setProperty("text-size-adjust", "auto");
}

function setZoom(root: HTMLElement, factor: number): void {
  const style = root.style as CSSStyleDeclaration & { zoom?: string };
  if (Math.abs(factor - 1) < 0.03) {
    style.zoom = "";
    root.style.removeProperty("--notho-text-scale");
    return;
  }
  style.zoom = String(factor);
  root.style.setProperty("--notho-text-scale", String(factor));
}

export function applyTextScale(scale: TextScale = readTextScale()): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.dataset.textScale = scale;
  setAdjustAuto(root);

  if (scale === "system") {
    setZoom(root, measureSystemScale());
    return;
  }
  setZoom(root, TEXT_SCALE_FACTOR[scale]);
}

export function persistTextScale(scale: TextScale): void {
  try {
    window.localStorage.setItem(TEXT_SCALE_KEY, scale);
  } catch {
    /* private mode */
  }
  applyTextScale(scale);
}

/** Before paint: unlock OS text size. Zoom is applied after DOM exists. */
export const TEXT_SCALE_BOOT_SCRIPT = `(function(){try{
var r=document.documentElement;
r.style.setProperty("-webkit-text-size-adjust","auto");
r.style.setProperty("text-size-adjust","auto");
r.setAttribute("data-text-scale","system");
}catch(e){}})();`;
