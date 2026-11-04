import { describe, expect, it } from "vitest";
import {
  PERSON_PROPERTIES_TO_UNSET,
  SESSION_REPLAY_BLOCK_SELECTOR,
  SESSION_REPLAY_FLAG,
  SESSION_REPLAY_SAMPLE_RATE,
  choiceFromServer,
  decideSessionReplay,
  flagAfterWait,
  identifyProperties,
  interpretReplayFlag,
  isReplayEnvKilled,
  maskReplayText,
  readLocalReplayChoice,
  readReplayChoice,
  replayStorageKey,
  replayToggleStopsImmediately,
  scrubPersonProperties,
  scrubReplayNetworkRequest,
  sessionRecordingConfig,
  stripReplayUrl,
  writeLocalReplayChoice,
  type ReplayDecisionInput,
} from "@/lib/sessionReplay";

function memoryStorage(initial: Record<string, string> = {}) {
  const data = { ...initial };
  return {
    data,
    getItem: (key: string) => (key in data ? data[key] : null),
    setItem: (key: string, value: string) => {
      data[key] = value;
    },
  };
}

function decision(overrides: Partial<ReplayDecisionInput> = {}) {
  return decideSessionReplay({
    signedIn: true,
    envKilled: false,
    localChoice: null,
    settingsSettled: true,
    serverChoice: "on",
    serverFailed: false,
    flag: "on",
    posthogReady: true,
    blockedSurface: false,
    ...overrides,
  });
}

describe("session replay opt-out", () => {
  it("never records a signed-out visitor, even with a stale local opt-in", () => {
    const result = decision({ signedIn: false, localChoice: "on" });
    expect(result.record).toBe(false);
    expect(result.stop).toBe(true);
    expect(result.reason).toBe("signed-out");
  });

  it("does not start on this device until the saved choice has loaded", () => {
    const waiting = decision({
      settingsSettled: false,
      serverChoice: null,
      localChoice: "on",
    });
    expect(waiting.record).toBe(false);
    expect(waiting.stop).toBe(false);
    expect(waiting.reason).toBe("settings-pending");
  });

  it("honours a local opt-out immediately, before the server answers", () => {
    const result = decision({
      settingsSettled: false,
      serverChoice: null,
      localChoice: "off",
    });
    expect(result.record).toBe(false);
    expect(result.stop).toBe(true);
    expect(result.reason).toBe("local-opt-out");
  });

  it("lets a server opt-out from another device win over a local opt-in", () => {
    const result = decision({ localChoice: "on", serverChoice: "off" });
    expect(result.record).toBe(false);
    expect(result.stop).toBe(true);
    expect(result.reason).toBe("server-opt-out");
  });

  it("records a signed-in learner who has not opted out", () => {
    expect(decision().record).toBe(true);
    expect(decision({ serverChoice: "on", localChoice: null }).reason).toBe("record");
  });

  it("defaults to on when the server read fails and this device has no opt-out", () => {
    const result = decision({
      serverFailed: true,
      serverChoice: null,
      localChoice: null,
      flag: "unavailable",
    });
    expect(result.record).toBe(true);
    expect(result.reason).toBe("record-flag-unavailable");
  });

  it("stays off when the server read fails but this device already opted out", () => {
    const result = decision({
      serverFailed: true,
      serverChoice: null,
      localChoice: "off",
    });
    expect(result.record).toBe(false);
    expect(result.reason).toBe("local-opt-out");
  });

  it("treats a missing settings row as opted in", () => {
    expect(choiceFromServer(null)).toBe("on");
    expect(choiceFromServer(undefined)).toBe("on");
    expect(choiceFromServer(true)).toBe("on");
    expect(choiceFromServer(false)).toBe("off");
  });

  it("stops immediately when the settings toggle turns recording off", () => {
    expect(replayToggleStopsImmediately(false)).toBe(true);
    expect(replayToggleStopsImmediately(true)).toBe(false);
  });

  it("stores the choice per user so a shared device does not leak an opt-out", () => {
    const storage = memoryStorage();
    writeLocalReplayChoice(storage, "user-a", "off");
    writeLocalReplayChoice(storage, "user-b", "on");
    expect(readLocalReplayChoice(storage, "user-a")).toBe("off");
    expect(readLocalReplayChoice(storage, "user-b")).toBe("on");
    expect(replayStorageKey("user-a")).toBe("notho-session-replay:user-a");
    expect(readReplayChoice("false")).toBe("off");
    expect(readReplayChoice("")).toBe(null);
  });
});

describe("session replay kill switch", () => {
  it("kills recording when either env var is explicitly off", () => {
    expect(isReplayEnvKilled({})).toBe(false);
    expect(isReplayEnvKilled({ POSTHOG_SESSION_REPLAY: "on" })).toBe(false);
    expect(isReplayEnvKilled({ POSTHOG_SESSION_REPLAY: "off" })).toBe(true);
    expect(isReplayEnvKilled({ NEXT_PUBLIC_POSTHOG_SESSION_REPLAY: "false" })).toBe(true);
    expect(isReplayEnvKilled({ POSTHOG_SESSION_REPLAY: "0" })).toBe(true);
    expect(decision({ envKilled: true }).reason).toBe("env-kill-switch");
  });

  it("stops on an explicit flag false and allows recording when the flag is unavailable", () => {
    expect(SESSION_REPLAY_FLAG).toBe("session-replay-enabled");
    expect(interpretReplayFlag({ value: false, errorsLoading: false })).toBe("off");
    expect(interpretReplayFlag({ value: true, errorsLoading: false })).toBe("on");
    expect(interpretReplayFlag({ value: undefined, errorsLoading: false })).toBe("unavailable");
    expect(interpretReplayFlag({ value: undefined, errorsLoading: true })).toBe("unavailable");
    expect(interpretReplayFlag({ value: false, errorsLoading: true })).toBe("off");
    expect(flagAfterWait("pending")).toBe("unavailable");
    expect(flagAfterWait("off")).toBe("off");

    expect(decision({ flag: "off" }).record).toBe(false);
    expect(decision({ flag: "pending" })).toMatchObject({ record: false, stop: false, reason: "flag-pending" });
    expect(decision({ flag: "unavailable", envKilled: false }).record).toBe(true);
    expect(decision({ flag: "unavailable", envKilled: true }).record).toBe(false);
  });

  it("does not record the admin desk", () => {
    expect(decision({ blockedSurface: true }).reason).toBe("blocked-surface");
  });
});

describe("session replay masking", () => {
  it("masks every input and text node, blocks images, and records no payloads", () => {
    expect(sessionRecordingConfig.maskAllInputs).toBe(true);
    expect(sessionRecordingConfig.maskTextSelector).toBe("*");
    expect(sessionRecordingConfig.blockSelector).toBe(SESSION_REPLAY_BLOCK_SELECTOR);
    expect(sessionRecordingConfig.blockSelector).toContain("img");
    expect(sessionRecordingConfig.blockSelector).toContain("canvas");
    expect(sessionRecordingConfig.blockSelector).toContain("video");
    expect(sessionRecordingConfig.recordHeaders).toBe(false);
    expect(sessionRecordingConfig.recordBody).toBe(false);
    expect(sessionRecordingConfig.captureCanvas.recordCanvas).toBe(false);
    expect(sessionRecordingConfig.sampleRate).toBe(SESSION_REPLAY_SAMPLE_RATE);
    expect(SESSION_REPLAY_SAMPLE_RATE).toBe(1);
    expect(maskReplayText("R 12 400")).toBe("********");
    expect(maskReplayText("   ")).toBe("   ");
  });

  it("strips network bodies, headers, and query strings", () => {
    const scrubbed = scrubReplayNetworkRequest({
      name: "https://www.notho.co.za/budget?email=learner@notho.co.za&amount=1200",
      url: "/api/budget/import?token=secret",
      requestHeaders: { Authorization: "Bearer secret" },
      responseHeaders: { "set-cookie": "session" },
      requestBody: "{\"description\":\"Woolworths\"}",
      responseBody: "{\"balance\":1200}",
    });
    expect(scrubbed.name).toBe("https://www.notho.co.za/budget");
    expect(scrubbed.url).toBe("/api/budget/import");
    expect(scrubbed.requestHeaders).toBeUndefined();
    expect(scrubbed.responseHeaders).toBeUndefined();
    expect(scrubbed.requestBody).toBeNull();
    expect(scrubbed.responseBody).toBeNull();
    expect(stripReplayUrl("/learn#section")).toBe("/learn");
  });
});

describe("session replay copy", () => {
  it("puts the opt-out on the settings screen and in both privacy policies", async () => {
    const fs = await import("fs");
    const path = await import("path");
    const settings = fs.readFileSync(path.resolve(__dirname, "../../components/SettingsView.tsx"), "utf8");
    const privacy = fs.readFileSync(path.resolve(__dirname, "../../app/privacy/page.tsx"), "utf8");
    const inApp = fs.readFileSync(path.resolve(__dirname, "../../components/ProfileView.tsx"), "utf8");
    const gate = fs.readFileSync(path.resolve(__dirname, "../../components/SessionReplayGate.tsx"), "utf8");

    expect(settings).toContain("Session recording: help improve Notho");
    expect(settings).toContain("stopSessionReplayNow");
    expect(settings).toContain("we never sell this data");
    expect(privacy).toContain("Signed-in sessions are recorded by default");
    expect(privacy).toContain("We never sell them");
    expect(inApp).toContain("8a. Session recording");
    expect(inApp).toContain("we never sell this data");
    expect(gate).toContain("decideSessionReplay");
  });
});

describe("person properties", () => {
  it("does not send email, name, or username on identify", () => {
    const props = identifyProperties({
      userId: "user-1",
      username: "Kwanele",
      email: "learner@notho.co.za",
      name: "Kwanele Ntshangase",
      platform: "web",
    });
    expect(props).toEqual({ platform: "web" });
    expect(JSON.stringify(props)).not.toContain("@");
    expect(JSON.stringify(props).toLowerCase()).not.toContain("kwanele");
  });

  it("scrubs nested identify $set payloads", () => {
    const scrubbed = scrubPersonProperties({
      $set: { email: "learner@notho.co.za", username: "Kwanele", platform: "web" },
      $set_once: { $name: "Kwanele", plan: "free" },
      note: "reach me at learner@notho.co.za",
    });
    expect(scrubbed.$set).toEqual({ platform: "web" });
    expect(scrubbed.$set_once).toEqual({ plan: "free" });
    expect(scrubbed.note).toBeUndefined();
    expect(PERSON_PROPERTIES_TO_UNSET).toContain("email");
    expect(PERSON_PROPERTIES_TO_UNSET).toContain("$email");
    expect(PERSON_PROPERTIES_TO_UNSET).toContain("username");
  });
});
