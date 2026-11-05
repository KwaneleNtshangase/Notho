import { afterEach, describe, expect, it, vi } from "vitest";
import { isIosNative, isIosNativeSync, isNativePlatform, nativePlatformSync } from "@/lib/capacitorPlatform";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("native platform snapshot", () => {
  it("stays on the web for desktop, mobile Safari, and Huawei Browser", () => {
    for (const userAgent of [
      "Mozilla/5.0 (Macintosh; Intel Mac OS X)",
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15",
      "Mozilla/5.0 (Linux; Android 10; HarmonyOS) HuaweiBrowser/13.0",
    ]) {
      vi.stubGlobal("navigator", { userAgent });
      vi.stubGlobal("window", {});
      expect(nativePlatformSync()).toBe("web");
      expect(isIosNativeSync()).toBe(false);
    }
  });

  it("recognises the iPhone app from the user agent and from the WebKit bridge", () => {
    vi.stubGlobal("navigator", { userAgent: "Mozilla/5.0 NothoApp/iOS" });
    vi.stubGlobal("window", {});
    expect(isIosNativeSync()).toBe(true);

    vi.stubGlobal("navigator", { userAgent: "Mozilla/5.0 (iPhone)" });
    vi.stubGlobal("window", { webkit: { messageHandlers: { bridge: {} } } });
    expect(nativePlatformSync()).toBe("ios");
    expect(isIosNativeSync()).toBe(true);
  });

  it("keeps the Android and Huawei shells off the iOS image share", async () => {
    vi.stubGlobal("navigator", { userAgent: "Mozilla/5.0 (Linux; Android 12; HarmonyOS) NothoApp/Android" });
    vi.stubGlobal("window", { androidBridge: {} });
    expect(nativePlatformSync()).toBe("android");
    expect(isIosNativeSync()).toBe(false);
    await expect(isNativePlatform()).resolves.toBe(true);
    await expect(isIosNative()).resolves.toBe(false);
  });

  it("resolves the iPhone shell without a later Capacitor import", async () => {
    vi.stubGlobal("navigator", { userAgent: "Mozilla/5.0 NothoApp/iOS" });
    vi.stubGlobal("window", {});
    await expect(isIosNative()).resolves.toBe(true);
  });
});
