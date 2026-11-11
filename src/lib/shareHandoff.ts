import { analytics } from "@/lib/analytics";
import { isIosNativeSync, nativePlatformSync } from "@/lib/capacitorPlatform";
import { markSharedToday } from "@/lib/dailyChallengeFlags";
import { isShareCancel, shareNativeFile, shareNativeText } from "@/lib/nativeShare";

export type ShareHandoffResult = "shared" | "cancelled" | "failed" | "needs-whatsapp";

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

function whatsAppUrl(text: string): string {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

/**
 * Open WhatsApp from a live click.
 * On the web, `window.open` runs before this returns. `noopener` is in the
 * feature string so the new page never receives `window.opener`. With that
 * flag the return value is null even when the window opens, so a blocked
 * popup cannot be told apart from a successful one.
 * Inside the iOS and Android shells, `window.open` of wa.me stays in the
 * WebView and does nothing. The Browser plugin opens the system handler and
 * does not need the original tap, so a failed native sheet can still fall
 * through on the next tap.
 */
export function openWhatsAppNow(text: string, shareType?: ShareKind): Promise<boolean> {
  const url = whatsAppUrl(text);
  if (nativePlatformSync() !== "web") {
    return import("@capacitor/browser")
      .then(({ Browser }) => Browser.open({ url }))
      .then(() => {
        record(shareType, "whatsapp");
        return true;
      })
      .catch(() => false);
  }
  if (typeof window === "undefined" || typeof window.open !== "function") return Promise.resolve(false);
  try {
    window.open(url, "_blank", "noopener,noreferrer");
  } catch {
    return Promise.resolve(false);
  }
  record(shareType, "whatsapp");
  return Promise.resolve(true);
}

function whatsAppResult(target: TextShareTarget): Promise<ShareHandoffResult> {
  return openWhatsAppNow(target.text, target.shareType).then((ok) => (ok ? "shared" : "failed"));
}

/**
 * Web Share, or WhatsApp when the browser has no share sheet.
 * Call this directly from the click handler. Do not await anything first:
 * Safari, Huawei Browser, and Android WebViews drop the gesture and then
 * both calls no-op.
 */
export function shareTextNow(target: TextShareTarget): Promise<ShareHandoffResult> {
  // The Android and Huawei shells expose navigator.share, but the WebView
  // share call no-ops or rejects after the tap is gone. The Capacitor text
  // sheet does not need that tap. Do this before Web Share so the stub
  // cannot swallow the click.
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
      return "needs-whatsapp" as const;
    });
  }
  // iPhone app shares are image sheets. A text call must not open WhatsApp
  // or the web sheet. Callers with a card use beginTextShare / startDuoShare.
  if (isIosNativeSync()) return Promise.resolve("failed");

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
      // The throw is still inside the click, so WhatsApp can open now.
      return whatsAppResult(target);
    }
    return pending.then(
      () => {
        record(target.shareType, "native");
        return "shared" as const;
      },
      (err: unknown) => {
        if (isShareCancel(err)) return "cancelled" as const;
        // The rejection runs after the gesture is gone. Opening WhatsApp
        // here is blocked, and retrying the same share call fails again.
        return "needs-whatsapp" as const;
      },
    );
  }
  return whatsAppResult(target);
}

/**
 * Text share for every non-card button.
 * iPhone app: image sheet, and only when the caller can paint one.
 * Android, Huawei, web, and desktop: shareTextNow, which must reach the
 * sheet or WhatsApp before this returns.
 */
export function beginTextShare(target: TextShareTarget & {
  fileName?: string;
  createBlob?: () => Promise<Blob>;
}): Promise<ShareHandoffResult> {
  if (isIosNativeSync()) {
    if (!target.createBlob) return Promise.resolve("failed");
    return shareIosCard({
      text: target.text,
      fileName: target.fileName ?? "notho-share.png",
      shareType: target.shareType,
      createBlob: target.createBlob,
    });
  }
  return shareTextNow(target);
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

/**
 * What to do after a PDF has already been fetched. The original tap does not
 * survive that wait on the web, so a failed share must not pretend a
 * programmatic download worked. `preview` means show the ready file and let
 * Share / Save PDF run on a new tap. Cancellation stays `done`.
 */
export function preparedFileFollowUp(result: "shared" | "cancelled" | "unavailable"): "done" | "preview" {
  return result === "shared" || result === "cancelled" ? "done" : "preview";
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

export type ReadyFile = {
  blob: Blob;
  fileName: string;
  mimeType: string;
  title: string;
  dialogTitle?: string;
};

/** Anchor download. Must run in the click turn on the web. */
export function downloadBlobNow(blob: Blob, fileName: string): boolean {
  if (typeof document === "undefined") return false;
  try {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    if (typeof window !== "undefined" && typeof window.setTimeout === "function") {
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * A file that was built after an await (PDF fetch, account export).
 * Native sheets still open. The web must not call navigator.share here.
 */
export async function shareOrDeferFile(opts: ReadyFile): Promise<"shared" | "cancelled" | "needs-tap"> {
  if (nativePlatformSync() === "web") return "needs-tap";
  const outcome = beginFileShare(opts);
  if (outcome === "unavailable") return "needs-tap";
  const result = await outcome;
  return result === "shared" || result === "cancelled" ? result : "needs-tap";
}

/** Same wait as shareOrDeferFile, in the budget preview's done/preview words. */
export async function shareFileAfterWait(opts: ReadyFile): Promise<"done" | "preview"> {
  const result = await shareOrDeferFile(opts);
  return result === "needs-tap" ? "preview" : "done";
}

/**
 * Share a file that is already in memory, from a fresh tap.
 * Downloads in that same turn when the browser cannot share files.
 * A later rejection does not download: the tap is already gone.
 */
export function deliverReadyFile(opts: ReadyFile): Promise<"shared" | "cancelled" | "downloaded" | "failed"> {
  const outcome = beginFileShare(opts);
  if (outcome === "unavailable") {
    return Promise.resolve(downloadBlobNow(opts.blob, opts.fileName) ? "downloaded" : "failed");
  }
  return outcome.then((result) => (result === "shared" || result === "cancelled" ? result : "failed"));
}

/**
 * Save PDF. Web downloads in the click turn. Native opens the file sheet
 * and does not download when the learner dismisses it.
 */
export function saveReadyFile(opts: ReadyFile): Promise<"shared" | "cancelled" | "downloaded" | "failed"> {
  if (nativePlatformSync() === "web") {
    return Promise.resolve(downloadBlobNow(opts.blob, opts.fileName) ? "downloaded" : "failed");
  }
  return deliverReadyFile(opts);
}
