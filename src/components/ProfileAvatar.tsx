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

async function persistAvatarUrl(userId: string, url: string | null): Promise<void> {
  await supabase.from("profiles").upsert({ user_id: userId, avatar_url: url }, { onConflict: "user_id" });
  if (url && !url.startsWith("data:")) {
    await supabase.auth.updateUser({ data: { avatar_url: url } });
  } else if (!url) {
    await supabase.auth.updateUser({ data: { avatar_url: null } });
  }
  try {
    if (url) localStorage.setItem("notho-avatar-url", url);
    else localStorage.removeItem("notho-avatar-url");
  } catch {
    /* ignore quota / private mode */
  }
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
  let url: string;
  if (!upErr) {
    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    url = `${data.publicUrl}?v=${Date.now()}`;
  } else {
    url = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error("Could not read the photo."));
      reader.readAsDataURL(blob);
    });
  }
  await persistAvatarUrl(user.id, url);
  return url;
}

export async function removeProfileAvatar(): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    await supabase.storage.from("avatars").remove([`${user.id}/avatar.jpg`]);
    await persistAvatarUrl(user.id, null);
  } else {
    try { localStorage.removeItem("notho-avatar-url"); } catch { /* ignore */ }
  }
}

function findInitialsCircle(): HTMLElement | null {
  const marked = document.querySelector<HTMLElement>("[data-notho-avatar-host]");
  if (marked) return marked;
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

export function ProfilePhotoGate() {
  const inputRef = useRef<HTMLInputElement>(null);
  const circleRef = useRef<HTMLElement | null>(null);
  const [box, setBox] = useState<{ top: number; left: number; size: number } | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    try {
      const cached = localStorage.getItem("notho-avatar-url");
      if (cached) setAvatarUrl(cached);
    } catch {
      /* ignore */
    }
    let cancelled = false;
    void supabase.auth.getUser().then(async ({ data }) => {
      const user = data.user;
      if (!user || cancelled) return;
      const meta = user.user_metadata as { avatar_url?: string; picture?: string } | undefined;
      const { data: row } = await supabase
        .from("profiles")
        .select("avatar_url")
        .eq("user_id", user.id)
        .maybeSingle();
      const fromRow = (row as { avatar_url?: string | null } | null)?.avatar_url?.trim();
      const fromMeta = meta?.avatar_url || meta?.picture || "";
      const next = fromRow || fromMeta || null;
      if (next && !cancelled) setAvatarUrl(next);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const measure = () => {
      const node = findInitialsCircle();
      circleRef.current = node;
      if (!node) {
        setBox((prev) => (prev ? null : prev));
        return;
      }
      const r = node.getBoundingClientRect();
      if (r.width < 40 || r.height < 40) {
        setBox(null);
        return;
      }
      const next = { top: r.top, left: r.left, size: r.width };
      setBox((prev) => {
        if (
          prev &&
          Math.abs(prev.top - next.top) < 0.5 &&
          Math.abs(prev.left - next.left) < 0.5 &&
          Math.abs(prev.size - next.size) < 0.5
        ) {
          return prev;
        }
        return next;
      });
    };
    measure();
    const interval = window.setInterval(measure, 250);
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, []);

  const onFile = async (file: File) => {
    setBusy(true);
    setHint(null);
    try {
      const url = await uploadProfileAvatar(file);
      setAvatarUrl(url);
      setHint("Photo updated");
      window.setTimeout(() => setHint(null), 2000);
    } catch (e) {
      setHint(e instanceof Error ? e.message : "Could not update your photo.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const badge = 26;
  const overlay =
    mounted && box && typeof document !== "undefined"
      ? createPortal(
          <div
            style={{
              position: "fixed",
              top: box.top,
              left: box.left,
              width: box.size,
              height: box.size,
              zIndex: 40,
              pointerEvents: "none",
            }}
          >
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={busy}
              aria-label={avatarUrl ? "Change profile photo" : "Add a profile photo"}
              style={{
                position: "absolute",
                inset: 0,
                border: "none",
                padding: 0,
                margin: 0,
                borderRadius: "50%",
                overflow: "hidden",
                background: avatarUrl ? "transparent" : "transparent",
                cursor: busy ? "wait" : "pointer",
                pointerEvents: "auto",
              }}
            >
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarUrl}
                  alt=""
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                />
              ) : null}
            </button>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={busy}
              aria-label="Change profile photo"
              style={{
                position: "absolute",
                right: -4,
                bottom: -4,
                width: badge,
                height: badge,
                borderRadius: "50%",
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--color-text-primary)",
                boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
                padding: 0,
                cursor: busy ? "wait" : "pointer",
                pointerEvents: "auto",
                zIndex: 1,
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
            </button>
          </div>,
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
      {hint ? (
        <div
          role="status"
          style={{
            position: "fixed",
            left: "50%",
            bottom: 96,
            transform: "translateX(-50%)",
            zIndex: 80,
            background: "var(--color-surface)",
            color: "var(--color-text-primary)",
            border: "1px solid var(--color-border)",
            borderRadius: 999,
            padding: "8px 14px",
            fontSize: 13,
            fontWeight: 600,
            boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
          }}
        >
          {busy ? "Updating photo…" : hint}
        </div>
      ) : null}
    </>
  );
}
