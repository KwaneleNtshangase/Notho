import { analytics } from "@/lib/analytics";
import { isIosNativeSync, nativePlatformSync } from "@/lib/capacitorPlatform";
import { markSharedToday } from "@/lib/dailyChallengeFlags";
import { isShareCancel, shareNativeFile, shareNativeText } from "@/lib/nativeShare";

export type ShareHandoffResult = "shared" | "cancelled" | "failed";

export type TextShareTarget = {
  text: string;
  shareType?: "lesson" | "badge" | "streak";
  /** Duo cards include the site URL. Plain lesson buttons share text only. */
  url?: string;
  title?: string;
};

type ShareKind = "lesson" | "badge" | "streak";

function record(shareType: ShareKind | undefined, method: "native" | "whatsapp") {
  try {
    if (shareType) analytics.shareTriggered(shareType, method);
    markSharedToday();
  } catch {
    /* The handoff already happened. A tracking failure must not look like a failed share. */
  }
}

/**
 * Open WhatsApp in this turn. A null return means the browser blocked the
 * window. `noopener` is applied on the opened window so a blocked popup
 * (which returns null) is not confused with a successful one (browsers
 * return null whenever `noopener` is passed in the feature string).
 */
function openWhatsApp(text: string, shareType: ShareKind | undefined): ShareHandoffResult {
  if (typeof window === "undefined" || typeof window.open !== "function") return "failed";
  let opened: Window | null = null;
  try {
    opened = window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  } catch {
    return "failed";
  }
  if (!opened || opened.closed) return "failed";
  try {
    opened.opener = null;
  } catch {
    /* The page opened. Losing the opener reference is best-effort. */
  }
  record(shareType, "whatsapp");
  return "shared";
}

/**
 * Web Share, or WhatsApp when the browser has no share sheet.
 * Call this directly from the click handler. Do not await anything first:
 * Safari, Huawei Browser, and Android WebViews drop the gesture and then
 * both calls no-op.
 */
export function shareTextNow(target: TextShareTarget): Promise<ShareHandoffResult> {
  const nav = typeof navigator !== "undefined" ? navigator : undefined;
  if (nav && typeof nav.share === "function") {
    const payload: ShareData = { text: target.text };
    if (target.title) payload.title = target.title;
    if (target.url) payload.url = target.url;
    let pending: Promise<void>;
    try {
      pending = nav.share(payload);
    } catch (err) {
      if (isShareCancel(err)) return Promise.resolve("cancelled");
      return Promise.resolve(openWhatsApp(target.text, target.shareType));
    }
    return pending.then(
      () => {
        record(target.shareType, "native");
        return "shared" as const;
      },
      (err: unknown) => {
        if (isShareCancel(err)) return "cancelled" as const;
        return openWhatsApp(target.text, target.shareType);
      },
    );
  }
  // Android and Huawei shells often have no Web Share API, and window.open
  // inside that WebView does not reliably leave the app. The native text
  // sheet does not need the original click gesture.
  if (nativePlatformSync() === "android") {
    return shareNativeText({
      title: target.title ?? "Notho",
      text: target.text,
      url: target.url,
      dialogTitle: "Share",
    }).then((result) => {
      if (result === "shared") {
        record(target.shareType, "native");
        return "shared" as const;
      }
      if (result === "cancelled") return "cancelled" as const;
      return openWhatsApp(target.text, target.shareType);
    });
  }
  return Promise.resolve(openWhatsApp(target.text, target.shareType));
}

export async function shareIosCard(opts: {
  text: string;
  fileName: string;
  shareType?: ShareKind;
  createBlob: () => Promise<Blob>;
}): Promise<ShareHandoffResult> {
  try {
    const blob = await opts.createBlob();
    const native = await shareNativeFile({
      blob,
      fileName: opts.fileName,
      title: "Notho",
      text: opts.text,
      dialogTitle: "Share",
    });
    if (native === "shared") {
      record(opts.shareType, "native");
      return "shared";
    }
    if (native === "cancelled") return "cancelled";
    const textOnly = await shareNativeText({
      title: "Notho",
      text: opts.text,
      dialogTitle: "Share",
    });
    if (textOnly === "shared") {
      record(opts.shareType, "native");
      return "shared";
    }
    if (textOnly === "cancelled") return "cancelled";
    return "failed";
  } catch {
    return "failed";
  }
}

/**
 * iPhone app: image card, caption stays in the sheet.
 * Android, Huawei, web, and desktop: text share, then WhatsApp.
 * The non-iOS branch must call the sheet or WhatsApp before returning.
 */
export function startDuoShare(opts: {
  text: string;
  fileName: string;
  shareType?: ShareKind;
  createBlob: () => Promise<Blob>;
}): Promise<ShareHandoffResult> {
  if (isIosNativeSync()) return shareIosCard(opts);
  return shareTextNow({
    text: opts.text,
    shareType: opts.shareType,
    title: "Notho",
    url: "https://www.notho.co.za",
  });
}

export type FileShareStart = "unavailable" | Promise<"shared" | "cancelled" | "unavailable">;

/**
 * Share a file that is already in memory.
 * On the web this calls `navigator.share` before returning, or returns the
 * string "unavailable" in that same turn so the caller can start a download
 * while the click is still active. Native shells use the Capacitor sheet
 * and return a promise. Cancellation does not report "unavailable".
 */
export function beginFileShare(opts: {
  blob: Blob;
  fileName: string;
  mimeType: string;
  title: string;
  dialogTitle?: string;
}): FileShareStart {
  if (nativePlatformSync() !== "web") {
    return shareNativeFile({
      blob: opts.blob,
      fileName: opts.fileName,
      title: opts.title,
      dialogTitle: opts.dialogTitle,
    }).then((result) => (result === "shared" || result === "cancelled" ? result : "unavailable"));
  }

  const nav = typeof navigator !== "undefined"
    ? (navigator as Navigator & { canShare?: (data: ShareData) => boolean })
    : undefined;
  if (!nav || typeof nav.share !== "function" || typeof nav.canShare !== "function") return "unavailable";

  let file: File;
  try {
    file = new File([opts.blob], opts.fileName, { type: opts.mimeType });
    if (!nav.canShare({ files: [file] })) return "unavailable";
  } catch {
    return "unavailable";
  }

  try {
    const pending = nav.share({ files: [file], title: opts.title });
    return pending.then(
      () => "shared" as const,
      (err: unknown) => (isShareCancel(err) ? "cancelled" as const : "unavailable" as const),
    );
  } catch (err) {
    return isShareCancel(err) ? Promise.resolve("cancelled") : "unavailable";
  }
}
