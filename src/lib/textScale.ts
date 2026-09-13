/**
 * In-app text size. The UI is mostly hardcoded px, so OS font-size settings
 * and -webkit-text-size-adjust:none both leave Notho looking the same size.
 * We persist a named scale and apply it on <html> before paint.
 */

export const TEXT_SCALE_KEY = "notho-text-scale";

export const TEXT_SCALES = ["sm", "md", "lg", "xl"] as const;
export type TextScale = (typeof TEXT_SCALES)[number];

export const TEXT_SCALE_FACTOR: Record<TextScale, number> = {
  sm: 0.9,
  md: 1,
  lg: 1.15,
  xl: 1.3,
};

export const TEXT_SCALE_LABEL: Record<TextScale, string> = {
  sm: "Small",
  md: "Default",
  lg: "Large",
  xl: "Extra large",
};

export function isTextScale(value: string | null): value is TextScale {
  return value === "sm" || value === "md" || value === "lg" || value === "xl";
}

export function readTextScale(): TextScale {
  if (typeof window === "undefined") return "md";
  try {
    const raw = window.localStorage.getItem(TEXT_SCALE_KEY);
    return isTextScale(raw) ? raw : "md";
  } catch {
    return "md";
  }
}

export function applyTextScale(scale: TextScale): void {
  if (typeof document === "undefined") return;
  const factor = TEXT_SCALE_FACTOR[scale];
  const root = document.documentElement;
  root.dataset.textScale = scale;
  root.style.setProperty("--notho-text-scale", String(factor));
  // Chromium / Android WebView: scales px and rem together.
  (root.style as CSSStyleDeclaration & { zoom?: string }).zoom = String(factor);
  // iOS / WKWebView: percentage text-size-adjust scales text including px.
  root.style.setProperty("-webkit-text-size-adjust", `${Math.round(factor * 100)}%`);
  root.style.setProperty("text-size-adjust", `${Math.round(factor * 100)}%`);
}

export function persistTextScale(scale: TextScale): void {
  try {
    window.localStorage.setItem(TEXT_SCALE_KEY, scale);
  } catch {
    /* private mode */
  }
  applyTextScale(scale);
}

/** Blocking head script so the first paint is already at the saved size. */
export const TEXT_SCALE_BOOT_SCRIPT = `(function(){try{
var k=${JSON.stringify(TEXT_SCALE_KEY)};
var v=window.localStorage.getItem(k);
if(v!=="sm"&&v!=="md"&&v!=="lg"&&v!=="xl")v="md";
var f={sm:0.9,md:1,lg:1.15,xl:1.3}[v];
var r=document.documentElement;
r.setAttribute("data-text-scale",v);
r.style.setProperty("--notho-text-scale",String(f));
r.style.zoom=String(f);
r.style.setProperty("-webkit-text-size-adjust",Math.round(f*100)+"%");
r.style.setProperty("text-size-adjust",Math.round(f*100)+"%");
}catch(e){}})();`;
