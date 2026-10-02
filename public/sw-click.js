// Notho service worker push handlers — loaded after the main worker logic via importScripts is not used.
// This file is the click navigator. The main sw.js notificationclick is replaced by bumping
// the handler here only if registered. Keep the real fix in sw.js.
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/";
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then(async (clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && "navigate" in client) {
          await client.navigate(url);
          return client.focus();
        }
      }
      return clients.openWindow(url);
    })
  );
});
