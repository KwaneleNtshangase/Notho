import { beforeEach, describe, expect, it, vi } from "vitest";
import { shareDuoCard } from "@/components/ShareCard";
import { analytics } from "@/lib/analytics";
import { isIosNativeSync, nativePlatformSync } from "@/lib/capacitorPlatform";
import { markSharedToday } from "@/lib/dailyChallengeFlags";
import { shareNativeFile, shareNativeText } from "@/lib/nativeShare";
import { beginFileShare, openWhatsAppNow, preparedFileFollowUp, shareTextNow, startDuoShare } from "@/lib/shareHandoff";

vi.mock("@/lib/analytics", () => ({
  analytics: { shareTriggered: vi.fn() },
}));

vi.mock("@/lib/dailyChallengeFlags", () => ({
  markSharedToday: vi.fn(),
}));

vi.mock("@/lib/nativeShare", async () => {
  const actual = await vi.importActual<typeof import("@/lib/nativeShare")>("@/lib/nativeShare");
  return {
    ...actual,
    shareNativeFile: vi.fn(),
    shareNativeText: vi.fn(),
  };
});

const nativeFile = vi.mocked(shareNativeFile);
const nativeText = vi.mocked(shareNativeText);

function install(opts: {
  userAgent: string;
  share?: ((data: ShareData) => Promise<void>) | undefined;
  canShare?: (data: ShareData) => boolean;
  open?: () => Window | null;
  bridge?: "ios" | "android";
}) {
  const open = vi.fn<(url?: string, target?: string, features?: string) => Window | null>(opts.open ?? (() => ({ closed: false, opener: null }) as Window));
  const win: Record<string, unknown> = { open };
  if (opts.bridge === "ios") win.webkit = { messageHandlers: { bridge: {} } };
  if (opts.bridge === "android") win.androidBridge = {};
  vi.stubGlobal("window", win);
  vi.stubGlobal("navigator", {
    userAgent: opts.userAgent,
    share: opts.share,
    canShare: opts.canShare,
  });
  return { open };
}

const streakCard = {
  text: "3 days straight",
  fileName: "notho-streak.png",
  shareType: "streak" as const,
  createBlob: vi.fn(async () => new Blob(["png"])),
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.unstubAllGlobals();
  streakCard.createBlob.mockClear();
});

describe("share buttons that were waiting on the Capacitor import", () => {
  it("opens Web Share in the click turn on web and desktop", () => {
    let calledInTurn = false;
    const share = vi.fn<(data: ShareData) => Promise<void>>(() => {
      calledInTurn = true;
      return Promise.resolve();
    });
    install({ userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X)", share });
    const pending = shareDuoCard({ type: "streak", streakDays: 3 });
    expect(calledInTurn).toBe(true);
    expect(share).toHaveBeenCalledWith(expect.objectContaining({
      title: "Notho",
      url: "https://www.notho.co.za",
    }));
    expect(String(share.mock.calls[0][0].text)).toContain("3");
    expect(nativeFile).not.toHaveBeenCalled();
    return expect(pending).resolves.toBe("shared");
  });

  it("keeps Android and the Huawei shell on text share", () => {
    const share = vi.fn(() => Promise.resolve());
    install({
      userAgent: "Mozilla/5.0 (Linux; Android 12; ELS-NX9; HarmonyOS) NothoApp/Android",
      share,
    });
    const pending = startDuoShare({ ...streakCard, createBlob: streakCard.createBlob });
    expect(share).toHaveBeenCalledTimes(1);
    expect(streakCard.createBlob).not.toHaveBeenCalled();
    expect(nativeFile).not.toHaveBeenCalled();
    expect(isIosNativeSync()).toBe(false);
    expect(nativePlatformSync()).toBe("android");
    return expect(pending).resolves.toBe("shared");
  });

  it("uses the native text sheet on the Android shell when Web Share is missing", async () => {
    const { open } = install({
      userAgent: "Mozilla/5.0 (Linux; Android 12; HarmonyOS) NothoApp/Android",
      bridge: "android",
    });
    nativeText.mockResolvedValue("shared");
    await expect(startDuoShare(streakCard)).resolves.toBe("shared");
    expect(nativeText).toHaveBeenCalledWith(expect.objectContaining({ text: streakCard.text, dialogTitle: "Share" }));
    expect(nativeFile).not.toHaveBeenCalled();
    expect(streakCard.createBlob).not.toHaveBeenCalled();
    expect(open).not.toHaveBeenCalled();
  });

  it("does not open WhatsApp when the Android text sheet is dismissed", async () => {
    const { open } = install({ userAgent: "Mozilla/5.0 NothoApp/Android", bridge: "android" });
    nativeText.mockResolvedValue("cancelled");
    await expect(startDuoShare(streakCard)).resolves.toBe("cancelled");
    expect(open).not.toHaveBeenCalled();
    expect(markSharedToday).not.toHaveBeenCalled();
  });

  it("opens WhatsApp in the click turn when the browser has no share sheet", () => {
    const { open } = install({
      userAgent: "Mozilla/5.0 (Linux; Android 10; HarmonyOS) HuaweiBrowser/13.0",
    });
    const pending = shareDuoCard({ type: "calculator", headline: "R10 000", sub: "in 10 years" });
    expect(open).toHaveBeenCalledTimes(1);
    expect(open.mock.calls[0]?.[0]).toMatch(/^https:\/\/wa\.me\/\?text=/);
    expect(open.mock.calls[0]?.[1]).toBe("_blank");
    expect(open.mock.calls[0]?.[2]).toBe("noopener,noreferrer");
    expect(nativeFile).not.toHaveBeenCalled();
    return expect(pending).resolves.toBe("shared");
  });

  it("does not treat a null WhatsApp window as failure when opener is severed", async () => {
    install({
      userAgent: "Mozilla/5.0 (Linux; Android 10; HarmonyOS) HuaweiBrowser/13.0",
      open: () => null,
    });
    await expect(shareDuoCard({ type: "streak", streakDays: 2 })).resolves.toBe("shared");
    expect(markSharedToday).toHaveBeenCalled();
  });

  it("does not open WhatsApp when the learner dismisses the text sheet", async () => {
    const share = vi.fn(() => Promise.reject(Object.assign(new Error("abort"), { name: "AbortError" })));
    const { open } = install({ userAgent: "Mozilla/5.0 (Windows NT 10.0)", share });
    await expect(shareDuoCard({ type: "lesson", lessonTitle: "What is Money?", xpEarned: 40, isPerfect: false, courseName: "Notho" })).resolves.toBe("cancelled");
    expect(open).not.toHaveBeenCalled();
    expect(markSharedToday).not.toHaveBeenCalled();
  });

  it("does not open WhatsApp after Web Share rejects asynchronously", async () => {
    const share = vi.fn(() => Promise.reject(Object.assign(new Error("no"), { name: "NotAllowedError" })));
    const { open } = install({ userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)", share });
    await expect(startDuoShare(streakCard)).resolves.toBe("needs-whatsapp");
    expect(share).toHaveBeenCalledTimes(1);
    expect(open).not.toHaveBeenCalled();
    expect(markSharedToday).not.toHaveBeenCalled();
  });

  it("opens WhatsApp in the click turn when Web Share throws before yielding", () => {
    const share = vi.fn(() => {
      throw Object.assign(new Error("no"), { name: "NotAllowedError" });
    });
    const { open } = install({ userAgent: "Mozilla/5.0 (Macintosh)", share });
    const pending = shareTextNow({ text: "hello", shareType: "lesson" });
    expect(open).toHaveBeenCalledWith(expect.stringMatching(/^https:\/\/wa\.me\/\?text=/), "_blank", "noopener,noreferrer");
    return expect(pending).resolves.toBe("shared");
  });

  it("asks for a fresh WhatsApp tap when the Android text sheet is unavailable", async () => {
    const { open } = install({ userAgent: "Mozilla/5.0 NothoApp/Android", bridge: "android" });
    nativeText.mockResolvedValue("unavailable");
    await expect(startDuoShare(streakCard)).resolves.toBe("needs-whatsapp");
    expect(open).not.toHaveBeenCalled();
  });

  it("opens WhatsApp with noopener on the follow-up tap", () => {
    const open = vi.fn(() => null);
    vi.stubGlobal("window", { open });
    vi.stubGlobal("navigator", { userAgent: "Mozilla/5.0" });
    expect(openWhatsAppNow("See you there", "lesson")).toBe(true);
    expect(open).toHaveBeenCalledWith(expect.stringMatching(/^https:\/\/wa\.me\/\?text=/), "_blank", "noopener,noreferrer");
    expect(markSharedToday).toHaveBeenCalled();
  });
});

describe("iPhone app image share", () => {
  it("shares the card and does not open a text sheet or WhatsApp", async () => {
    const share = vi.fn(() => Promise.resolve());
    const { open } = install({ userAgent: "Mozilla/5.0 NothoApp/iOS", share });
    nativeFile.mockResolvedValue("shared");
    const createBlob = vi.fn(async () => new Blob(["png"]));
    await expect(startDuoShare({ ...streakCard, createBlob })).resolves.toBe("shared");
    expect(createBlob).toHaveBeenCalledTimes(1);
    expect(nativeFile).toHaveBeenCalledWith(expect.objectContaining({
      fileName: "notho-streak.png",
      dialogTitle: "Share",
    }));
    expect(share).not.toHaveBeenCalled();
    expect(open).not.toHaveBeenCalled();
    expect(nativeText).not.toHaveBeenCalled();
    expect(analytics.shareTriggered).toHaveBeenCalledWith("streak", "native");
  });

  it("treats a dismissed image sheet as cancel and does not share again", async () => {
    const { open } = install({ userAgent: "Mozilla/5.0 NothoApp/iOS", bridge: "ios" });
    nativeFile.mockResolvedValue("cancelled");
    await expect(startDuoShare(streakCard)).resolves.toBe("cancelled");
    expect(nativeText).not.toHaveBeenCalled();
    expect(open).not.toHaveBeenCalled();
    expect(markSharedToday).not.toHaveBeenCalled();
  });

  it("uses a native text sheet when the image file cannot be written", async () => {
    const { open } = install({ userAgent: "Mozilla/5.0 NothoApp/iOS" });
    nativeFile.mockResolvedValue("unavailable");
    nativeText.mockResolvedValue("shared");
    await expect(startDuoShare(streakCard)).resolves.toBe("shared");
    expect(nativeText).toHaveBeenCalledTimes(1);
    expect(open).not.toHaveBeenCalled();
  });

  it("fails honestly when neither native sheet is available", async () => {
    const share = vi.fn(() => Promise.resolve());
    const { open } = install({ userAgent: "Mozilla/5.0 NothoApp/iOS", share });
    nativeFile.mockResolvedValue("unavailable");
    nativeText.mockResolvedValue("unavailable");
    await expect(startDuoShare(streakCard)).resolves.toBe("failed");
    expect(share).not.toHaveBeenCalled();
    expect(open).not.toHaveBeenCalled();
    expect(markSharedToday).not.toHaveBeenCalled();
  });

  it("does not text-share from the lesson or streak card while the shell is iOS", () => {
    const share = vi.fn(() => Promise.resolve());
    install({ userAgent: "Mozilla/5.0 NothoApp/iOS", share });
    const pending = shareDuoCard({ type: "streak", streakDays: 4 });
    expect(share).not.toHaveBeenCalled();
    expect(isIosNativeSync()).toBe(true);
    return expect(pending).resolves.toBe("failed");
  });
});

describe("budget file share", () => {
  it("keeps a cancelled report share from opening the preview", () => {
    expect(preparedFileFollowUp("cancelled")).toBe("done");
    expect(preparedFileFollowUp("shared")).toBe("done");
  });

  it("shows the ready preview when the post-fetch share cannot run", () => {
    expect(preparedFileFollowUp("unavailable")).toBe("preview");
  });

  it("returns unavailable in the click turn when the browser cannot share files", () => {
    install({ userAgent: "Mozilla/5.0 (X11; Linux x86_64) Firefox" });
    const outcome = beginFileShare({
      blob: new Blob(["%PDF"]),
      fileName: "notho-budget-report.pdf",
      mimeType: "application/pdf",
      title: "Notho budget report",
    });
    expect(outcome).toBe("unavailable");
    expect(nativeFile).not.toHaveBeenCalled();
  });

  it("calls the file share sheet before yielding on the web", () => {
    let calledInTurn = false;
    const share = vi.fn(() => {
      calledInTurn = true;
      return Promise.resolve();
    });
    install({
      userAgent: "Mozilla/5.0 (Macintosh)",
      share,
      canShare: () => true,
    });
    const outcome = beginFileShare({
      blob: new Blob(["%PDF"]),
      fileName: "report.pdf",
      mimeType: "application/pdf",
      title: "Notho budget report",
    });
    expect(calledInTurn).toBe(true);
    expect(outcome).toBeInstanceOf(Promise);
    return expect(outcome).resolves.toBe("shared");
  });

  it("does not ask the caller to download when the file sheet is dismissed", async () => {
    const share = vi.fn(() => Promise.reject(Object.assign(new Error("abort"), { name: "AbortError" })));
    install({ userAgent: "Mozilla/5.0 (Macintosh)", share, canShare: () => true });
    const outcome = beginFileShare({
      blob: new Blob(["%PDF"]),
      fileName: "report.pdf",
      mimeType: "application/pdf",
      title: "Notho budget report",
    });
    expect(outcome).toBeInstanceOf(Promise);
    await expect(outcome).resolves.toBe("cancelled");
  });

  it("uses the native sheet on Android and Huawei, including when the learner cancels", async () => {
    const share = vi.fn(() => Promise.resolve());
    install({
      userAgent: "Mozilla/5.0 NothoApp/Android",
      share,
      bridge: "android",
    });
    nativeFile.mockResolvedValue("cancelled");
    const outcome = beginFileShare({
      blob: new Blob(["%PDF"]),
      fileName: "report.pdf",
      mimeType: "application/pdf",
      title: "Notho budget report",
      dialogTitle: "Share your budget report",
    });
    expect(share).not.toHaveBeenCalled();
    expect(outcome).toBeInstanceOf(Promise);
    await expect(outcome).resolves.toBe("cancelled");
    expect(nativeFile).toHaveBeenCalledTimes(1);
  });
});
