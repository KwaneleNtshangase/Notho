/** Attach the send id so a tap can be tied back to this reminder. */

export function kindFromKey(key: string): string {
  const head = key.split(":")[0] ?? "other";
  if (head === "streak" || head === "routine" || head === "hello" || head === "rank") return head;
  if (head.startsWith("over") || key.includes("budget")) return "budget";
  return head || "other";
}

export function stampUrl(url: string, id: string): string {
  const base = url.startsWith("/") ? url : `/${url}`;
  const join = base.includes("?") ? "&" : "?";
  return `${base}${join}n=${encodeURIComponent(id)}`;
}
