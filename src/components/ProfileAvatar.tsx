"use client";

import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { supabase } from "@/lib/supabaseClient";

async function compressAvatarFile(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const size = 320;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not prepare the photo.");
  const min = Math.min(bitmap.width, bitmap.height);
  const sx = (bitmap.width - min) / 2;
  const sy = (bitmap.height - min) / 2;
  ctx.drawImage(bitmap, sx, sy, min, min, 0, 0, size, size);
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Could not encode the photo."))),
      "image/jpeg",
      0.82,
    );
  });
  bitmap.close();
  return blob;
}

function cacheChosen(url: string | null) {
  try {
    if (url && !url.startsWith("data:")) localStorage.setItem("notho-avatar-url", url);
    else localStorage.removeItem("notho-avatar-url");
  } catch {
    /* ignore */
  }
}

function isGoogleHosted(url: string): boolean {
  try {
    const host = new URL(url).hostname;
    return host.endsWith("googleusercontent.com") || host.endsWith("ggpht.com") || host === "lh3.google.com";
  } catch {
    return false;
  }
}

function publicAvatarUrl(userId: string): string {
  const { data } = supabase.storage.from("avatars").getPublicUrl(`${userId}/avatar.jpg`);
  return data.publicUrl;
}

async function persistAvatarUrl(userId: string, url: string | null): Promise<void> {
  const { error: rowErr } = await supabase
    .from("profiles")
    .upsert({ user_id: userId, avatar_url: url }, { onConflict: "user_id" });
  if (rowErr) {
    const { error: updErr } = await supabase
      .from("profiles")
      .update({ avatar_url: url })
      .eq("user_id", userId);
    if (updErr) throw new Error(updErr.message || rowErr.message);
  }
  await supabase.auth.updateUser({
    data: { notho_avatar_url: url, avatar_url: url },
  });
  cacheChosen(url);
}

async function resolveSavedAvatar(userId: string): Promise<string | null> {
  try {
    const cached = localStorage.getItem("notho-avatar-url");
    if (cached && !cached.startsWith("data:") && !isGoogleHosted(cached)) return cached;
  } catch {
    /* ignore */
  }

  const { data: row } = await supabase
    .from("profiles")
    .select("avatar_url")
    .eq("user_id", userId)
    .maybeSingle();
  const fromRow = (row as { avatar_url?: string | null } | null)?.avatar_url?.trim() || "";
  if (fromRow && !fromRow.startsWith("data:") && !isGoogleHosted(fromRow)) return fromRow;

  const { data: listed } = await supabase.storage.from("avatars").list(userId, { limit: 10 });
  const hasFile = (listed ?? []).some((obj) => obj.name === "avatar.jpg" || obj.name.startsWith("avatar."));
  if (hasFile) return `${publicAvatarUrl(userId)}?v=${Date.now()}`;

  const { data: userData } = await supabase.auth.getUser();
  const meta = userData.user?.user_metadata as { notho_avatar_url?: string; avatar_url?: string } | undefined;
  const fromMeta = (meta?.notho_avatar_url || "").trim();
  if (fromMeta && !fromMeta.startsWith("data:") && !isGoogleHosted(fromMeta)) return fromMeta;

  if (fromRow && !fromRow.startsWith("data:")) return fromRow;
  return null;
}

export async function uploadProfileAvatar(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("Please choose a photo.");
  if (file.size > 12 * 1024 * 1024) throw new Error("That photo is too large. Please pick one under 12 MB.");
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) throw new Error("Not signed in");
  const blob = await compressAvatarFile(file);
  const path = `${user.id}/avatar.jpg`;
  const { error: upErr } = await supabase.storage
    .from("avatars")
    .upload(path, blob, { upsert: true, contentType: "image/jpeg", cacheControl: "3600" });
  if (upErr) throw new Error(upErr.message || "Could not save the photo.");
  const url = `${publicAvatarUrl(user.id)}?v=${Date.now()}`;
  await persistAvatarUrl(user.id, url);
  return url;
}

export async function removeProfileAvatar(): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    await supabase.storage.from("avatars").remove([`${user.id}/avatar.jpg`]);
    await persistAvatarUrl(user.id, null);
  } else {
    cacheChosen(null);
  }
}

function findInitialsCircle(): HTMLElement | null {
  const marked = document.querySelector<HTMLElement>("[data-notho-avatar-host]");
  if (marked && marked.isConnected) return marked;
  const mains = document.querySelectorAll("main");
  for (const main of mains) {
    const divs = main.querySelectorAll("div");
    for (const el of divs) {
      const node = el as HTMLElement;
      if (node.childElementCount !== 0) continue;
      const text = (node.textContent ?? "").trim();
      if (text.length < 1 || text.length > 3) continue;
      const w = node.offsetWidth;
      const h = node.offsetHeight;
      if (w < 64 || w > 88 || h < 64 || h > 88) continue;
      const radius = getComputedStyle(node).borderRadius;
      if (!radius.includes("%") && !radius.startsWith("50") && !radius.startsWith("999")) continue;
      node.setAttribute("data-notho-avatar-host", "1");
      return node;
    }
  }
  return null;
}

function paintCircle(node: HTMLElement | null, url: string | null) {
  if (!node) return;
  if (url) {
    node.style.backgroundImage = `url("${url.replace(/"/g, "")}")`;
    node.style.backgroundSize = "cover";
    node.style.backgroundPosition = "center";
    node.style.color = "transparent";
    node.style.backgroundColor = "transparent";
  } else {
    node.style.backgroundImage = "";
    node.style.color = "white";
    node.style.backgroundColor = "";
  }
}

export function ProfilePhotoGate() {
  const inputRef = useRef<HTMLInputElement>(null);
  const circleRef = useRef<HTMLElement | null>(null);
  const [box, setBox] = useState<{ top: number; left: number; size: number } | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [googleUrl, setGoogleUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [sheet, setSheet] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    let cancelled = false;
    void supabase.auth.getUser().then(async ({ data }) => {
      const user = data.user;
      if (!user || cancelled) return;
      const meta = user.user_metadata as { avatar_url?: string; picture?: string } | undefined;
      const google = typeof meta?.picture === "string" ? meta.picture : "";
      if (google && isGoogleHosted(google)) setGoogleUrl(google);
      const saved = await resolveSavedAvatar(user.id);
      if (!cancelled && saved) setAvatarUrl(saved);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let raf = 0;
    let lives = true;
    const tick = () => {
      if (!lives) return;
      const node = findInitialsCircle();
      circleRef.current = node;
      paintCircle(node, avatarUrl);
      if (node) {
        const r = node.getBoundingClientRect();
        if (r.width >= 40 && r.height >= 40) {
          const next = { top: r.top, left: r.left, size: r.width };
          setBox((prev) => {
            if (
              prev &&
              Math.abs(prev.top - next.top) < 0.4 &&
              Math.abs(prev.left - next.left) < 0.4 &&
              Math.abs(prev.size - next.size) < 0.4
            ) {
              return prev;
            }
            return next;
          });
        } else {
          setBox(null);
        }
      } else {
        setBox(null);
      }
      raf = window.requestAnimationFrame(tick);
    };
    raf = window.requestAnimationFrame(tick);
    return () => {
      lives = false;
      window.cancelAnimationFrame(raf);
    };
  }, [avatarUrl]);

  const flash = (msg: string) => {
    setHint(msg);
    window.setTimeout(() => setHint(null), 2200);
  };

  const onFile = async (file: File) => {
    setBusy(true);
    try {
      const url = await uploadProfileAvatar(file);
      setAvatarUrl(url);
      paintCircle(circleRef.current, url);
      flash("Photo saved");
    } catch (e) {
      flash(e instanceof Error ? e.message : "Could not update your photo.");
    } finally {
      setBusy(false);
      setSheet(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const useGoogle = async () => {
    if (!googleUrl) return;
    setBusy(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) await persistAvatarUrl(user.id, googleUrl);
      else cacheChosen(googleUrl);
      setAvatarUrl(googleUrl);
      paintCircle(circleRef.current, googleUrl);
      flash("Using your Google photo");
    } catch (e) {
      flash(e instanceof Error ? e.message : "Could not save that photo.");
    } finally {
      setBusy(false);
      setSheet(false);
    }
  };

  const remove = async () => {
    setBusy(true);
    try {
      await removeProfileAvatar();
      setAvatarUrl(null);
      paintCircle(circleRef.current, null);
      flash("Photo removed");
    } catch {
      setAvatarUrl(null);
      paintCircle(circleRef.current, null);
    } finally {
      setBusy(false);
      setSheet(false);
    }
  };

  const badge = 26;
  const overlay =
    mounted && box && typeof document !== "undefined"
      ? createPortal(
          <button
            type="button"
            onClick={() => setSheet(true)}
            disabled={busy}
            aria-label={avatarUrl ? "Change profile photo" : "Add a profile photo"}
            style={{
              position: "fixed",
              top: box.top + box.size - badge + 4,
              left: box.left + box.size - badge + 4,
              width: badge,
              height: badge,
              borderRadius: "50%",
              zIndex: 40,
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--color-text-primary)",
              boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
              padding: 0,
              cursor: busy ? "wait" : "pointer",
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
          </button>,
          document.body,
        )
      : null;

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        aria-hidden="true"
        tabIndex={-1}
        style={{ display: "none" }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void onFile(file);
        }}
      />
      {overlay}
      {sheet && (
        <div
          onClick={() => setSheet(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            zIndex: 520,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 480,
              background: "var(--color-surface)",
              borderRadius: "20px 20px 0 0",
              padding: "12px 16px 28px",
            }}
          >
            <div style={{ width: 36, height: 4, borderRadius: 99, background: "var(--color-border)", margin: "4px auto 14px" }} />
            <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 10 }}>Profile photo</div>
            <button type="button" className="btn btn-primary" style={{ width: "100%", marginBottom: 8 }} disabled={busy} onClick={() => inputRef.current?.click()}>
              Choose a photo
            </button>
            {googleUrl && (
              <button type="button" className="btn btn-secondary" style={{ width: "100%", marginBottom: 8 }} disabled={busy} onClick={() => { void useGoogle(); }}>
                Use my Google photo
              </button>
            )}
            {avatarUrl && (
              <button type="button" className="btn btn-secondary" style={{ width: "100%", marginBottom: 8, color: "#dc2626" }} disabled={busy} onClick={() => { void remove(); }}>
                Remove photo
              </button>
            )}
            <button type="button" className="btn btn-secondary" style={{ width: "100%" }} onClick={() => setSheet(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}
      {hint && (
        <div
          role="status"
          style={{
            position: "fixed",
            left: "50%",
            bottom: 96,
            transform: "translateX(-50%)",
            zIndex: 530,
            background: "var(--color-surface)",
            color: "var(--color-text-primary)",
            border: "1px solid var(--color-border)",
            borderRadius: 999,
            padding: "8px 14px",
            fontSize: 13,
            fontWeight: 600,
            boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
            whiteSpace: "nowrap",
          }}
        >
          {busy ? "Saving photo…" : hint}
        </div>
      )}
    </>
  );
}
