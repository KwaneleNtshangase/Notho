/**
 * Follow the OS text size, but never at the cost of layout.
 *
 * Whole-page zoom + unbounded text-size-adjust:auto made cards, CTAs and
 * the tab bar fall apart (one word per line, clipped buttons). We honour
 * Dynamic Type only up to MAX_SCALE and we never zoom the document.
 */

export const TEXT_SCALE_KEY = "notho-text-scale";

/** Hard cap. Above this, iOS accessibility sizes destroy composed layouts. */
export const MAX_TEXT_SCALE = 1.15;

export const TEXT_SCALES = ["system", "sm", "md", "lg"] as const;
export type TextScale = (typeof TEXT_SCALES)[number];

export const TEXT_SCALE_FACTOR: Record<Exclude<TextScale, "system">, number> = {
  sm: 0.92,
  md: 1,
  lg: MAX_TEXT_SCALE,
};

export const TEXT_SCALE_LABEL: Record<TextScale, string> = {
  system: "System",
  sm: "Small",
  md: "Default",
  lg: "Large",
};

const SYSTEM_BODY_BASE_PX = 17;

export function isTextScale(value: string | null): value is TextScale {
  return value === "system" || value === "sm" || value === "md" || value === "lg";
}

export function readTextScale(): TextScale {
  if (typeof window === "undefined") return "system";
  try {
    const raw = window.localStorage.getItem(TEXT_SCALE_KEY);
    if (!raw || raw === "md" || raw === "xl") return "system";
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
  return Math.min(MAX_TEXT_SCALE, Math.max(0.92, px / SYSTEM_BODY_BASE_PX));
}

function applyAdjust(root: HTMLElement, factor: number): void {
  const pct = `${Math.round(factor * 100)}%`;
  root.style.setProperty("-webkit-text-size-adjust", pct);
  root.style.setProperty("text-size-adjust", pct);
  root.style.setProperty("--notho-text-scale", String(factor));
  const style = root.style as CSSStyleDeclaration & { zoom?: string };
  style.zoom = "";
}

export function applyTextScale(scale: TextScale = readTextScale()): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.dataset.textScale = scale;
  const factor = scale === "system" ? measureSystemScale() : TEXT_SCALE_FACTOR[scale];
  applyAdjust(root, Math.min(MAX_TEXT_SCALE, factor));
}

export function persistTextScale(scale: TextScale): void {
  try {
    window.localStorage.setItem(TEXT_SCALE_KEY, scale);
  } catch {
    /* private mode */
  }
  applyTextScale(scale);
}

export const TEXT_SCALE_BOOT_SCRIPT = `(function(){try{
var r=document.documentElement;
r.style.setProperty("-webkit-text-size-adjust","100%");
r.style.setProperty("text-size-adjust","100%");
r.style.zoom="";
}catch(e){}})();`;
