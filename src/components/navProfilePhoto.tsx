"use client";

import { useLayoutEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { NothoProfile } from "@/components/icons/NothoIcons";

export const AVATAR_CHANGED = "notho-avatar-changed";

export function readCachedAvatarUrl(): string | null {
  try {
    const cached = localStorage.getItem("notho-avatar-url");
    if (cached && !cached.startsWith("data:")) return cached;
  } catch {
    /* ignore */
  }
  return null;
}

export function publishAvatarUrl(url: string | null) {
  try {
    if (url && !url.startsWith("data:")) localStorage.setItem("notho-avatar-url", url);
    else localStorage.removeItem("notho-avatar-url");
  } catch {
    /* ignore */
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(AVATAR_CHANGED, { detail: url }));
  }
}

function preloadAvatar(url: string) {
  const img = new Image();
  img.decoding = "sync";
  img.src = url;
  if (typeof img.decode === "function") void img.decode().catch(() => undefined);
}

function isGoogleHosted(url: string): boolean {
  try {
    const host = new URL(url).hostname;
    return host.endsWith("googleusercontent.com") || host.endsWith("ggpht.com") || host === "lh3.google.com";
  } catch {
    return false;
  }
}

function paintHost(url: string | null) {
  const node = document.querySelector<HTMLElement>("[data-notho-avatar-host]");
  if (!node || !url) return;
  node.style.backgroundImage = `url("${url.replace(/"/g, "")}")`;
  node.style.backgroundSize = "cover";
  node.style.backgroundPosition = "center";
  node.style.color = "transparent";
  node.style.backgroundColor = "transparent";
}

export function warmProfileAvatar() {
  const cached = readCachedAvatarUrl();
  if (cached) preloadAvatar(cached);
  void supabase.auth.getSession().then(async ({ data }) => {
    const user = data.session?.user;
    if (!user) return;
    const meta = user.user_metadata as { notho_avatar_url?: string; avatar_url?: string } | undefined;
    let url = cached || (meta?.notho_avatar_url || meta?.avatar_url || "").trim();
    if (!url || url.startsWith("data:") || isGoogleHosted(url)) {
      const { data: row } = await supabase
        .from("profiles")
        .select("avatar_url")
        .eq("user_id", user.id)
        .maybeSingle();
      const fromRow = (row as { avatar_url?: string | null } | null)?.avatar_url?.trim() || "";
      if (fromRow && !fromRow.startsWith("data:")) url = fromRow;
      else if (cached) url = cached;
      else return;
    }
    if (!url || url.startsWith("data:")) return;
    if (url !== cached) publishAvatarUrl(url);
    preloadAvatar(url);
    paintHost(url);
  });
}

export function ProfilePhotoBoot() {
  useLayoutEffect(() => {
    const paint = () => paintHost(readCachedAvatarUrl());
    paint();
    const onChange = () => paint();
    window.addEventListener(AVATAR_CHANGED, onChange);
    const obs = new MutationObserver(paint);
    obs.observe(document.body, { childList: true, subtree: true });
    return () => {
      window.removeEventListener(AVATAR_CHANGED, onChange);
      obs.disconnect();
    };
  }, []);
  return null;
}

export function NavProfileMark({ size = 24 }: { size?: number }) {
  const [url, setUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useLayoutEffect(() => {
    setUrl(readCachedAvatarUrl());
    const onChange = (event: Event) => {
      const next = (event as CustomEvent<string | null>).detail ?? readCachedAvatarUrl();
      setFailed(false);
      setUrl(next && !next.startsWith("data:") ? next : null);
    };
    window.addEventListener(AVATAR_CHANGED, onChange);
    return () => window.removeEventListener(AVATAR_CHANGED, onChange);
  }, []);

  if (url && !failed) {
    return (
      <img
        src={url}
        alt=""
        width={size}
        height={size}
        decoding="sync"
        onError={() => setFailed(true)}
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          objectFit: "cover",
          display: "block",
        }}
      />
    );
  }
  return <NothoProfile size={size} className="text-current" />;
}
