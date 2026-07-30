import { reportClientError } from "@/lib/errorReporting";

export type ServiceWorkerUpdateHandler = (
  registration: ServiceWorkerRegistration
) => void;

const SW_URL = "/sw.js";

let refreshing = false;

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

  listenForControllerChange();

  try {
    const registration = await navigator.serviceWorker.register(SW_URL);

    checkForWaitingWorker(registration, options.onUpdateAvailable);

    registration.addEventListener("updatefound", () => {
      watchInstallingWorker(registration, options.onUpdateAvailable);
    });

    // Re-check when the tab becomes visible (browser SW update check is throttled).
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        registration.update().catch(() => {/* transient — next visibility change retries */});
      }
    });

    // Periodic check while the app is open.
    window.setInterval(() => {
      registration.update().catch(() => {/* transient — next interval retries */});
    }, 60 * 60 * 1000);

    return registration;
  } catch (err) {
    void reportClientError("sw-registration", err);
    return null;
  }
}
