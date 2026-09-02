import { reportClientError } from "@/lib/errorReporting";
import { isBenignClientNoise } from "@/lib/errorNoise";

export type ServiceWorkerUpdateHandler = (
  registration: ServiceWorkerRegistration
) => void;

const SW_URL = "/sw.js";

let refreshing = false;
let registerAttempted = false;

function listenForControllerChange() {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (refreshing) return;
    refreshing = true;
    window.location.reload();
  });
}

function watchInstallingWorker(
  registration: ServiceWorkerRegistration,
  onUpdateAvailable: ServiceWorkerUpdateHandler
) {
  const worker = registration.installing;
  if (!worker) return;

  worker.addEventListener("statechange", () => {
    if (worker.state === "installed" && navigator.serviceWorker.controller) {
      onUpdateAvailable(registration);
    }
  });
}

function checkForWaitingWorker(
  registration: ServiceWorkerRegistration,
  onUpdateAvailable: ServiceWorkerUpdateHandler
) {
  if (registration.waiting && navigator.serviceWorker.controller) {
    onUpdateAvailable(registration);
  }
}

function whenPageSettled(): Promise<void> {
  if (typeof document === "undefined") return Promise.resolve();
  if (document.readyState === "complete") return Promise.resolve();
  return new Promise((resolve) => {
    window.addEventListener("load", () => resolve(), { once: true });
  });
}

function isAbortish(err: unknown): boolean {
  const name = (err as { name?: string } | undefined)?.name ?? "";
  const message = (err as { message?: string } | undefined)?.message ?? String(err);
  return (
    name === "AbortError" ||
    isBenignClientNoise("sw-registration", message)
  );
}

/** Activate a waiting worker and reload once it takes control. */
export function applyServiceWorkerUpdate(
  registration: ServiceWorkerRegistration
): void {
  registration.waiting?.postMessage({ type: "SKIP_WAITING" });
}

/** Register SW, detect updates, and invoke callback when a new version is waiting. */
export async function registerServiceWorker(options: {
  onUpdateAvailable: ServiceWorkerUpdateHandler;
}): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return null;
  }

  // React Strict Mode mounts this twice in development. One in-flight register
  // is enough; a second call is how Chrome 117 produces "Operation has been aborted".
  if (registerAttempted) {
    return navigator.serviceWorker.getRegistration(SW_URL).then((r) => r ?? null);
  }
  registerAttempted = true;

  listenForControllerChange();

  try {
    // Do not contend with first-paint for bandwidth. AbortError is what you get
    // when register() is still running as the user leaves /learn.
    await whenPageSettled();
    if (document.visibilityState === "hidden") {
      await new Promise<void>((resolve) => {
        const onVis = () => {
          if (document.visibilityState === "visible") {
            document.removeEventListener("visibilitychange", onVis);
            resolve();
          }
        };
        document.addEventListener("visibilitychange", onVis);
      });
    }

    const registration = await navigator.serviceWorker.register(SW_URL, {
      scope: "/",
      updateViaCache: "none",
    });

    checkForWaitingWorker(registration, options.onUpdateAvailable);

    registration.addEventListener("updatefound", () => {
      watchInstallingWorker(registration, options.onUpdateAvailable);
    });

    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        registration.update().catch(() => {/* transient — next visibility change retries */});
      }
    });

    window.setInterval(() => {
      registration.update().catch(() => {/* transient — next interval retries */});
    }, 60 * 60 * 1000);

    return registration;
  } catch (err) {
    if (!isAbortish(err)) {
      void reportClientError("sw-registration", err);
    }
    return null;
  }
}
