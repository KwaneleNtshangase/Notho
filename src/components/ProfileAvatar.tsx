"use client";

import React, { useEffect, useRef, useState } from "react";
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
    if (url) localStorage.setItem("notho-avatar-url", url);
    else localStorage.removeItem("notho-avatar-url");
  } catch {
    /* ignore */
  }
}

async function persistAvatarUrl(userId: string, url: string | null): Promise<void> {
  await supabase.from("profiles").upsert({ user_id: userId, avatar_url: url }, { onConflict: "user_id" });
  cacheChosen(url);
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
    cacheChosen(null);
  }
}

function isGoogleHosted(url: string): boolean {
  try {
    const host = new URL(url).hostname;
    return host.endsWith("googleusercontent.com") || host.endsWith("ggpht.com") || host.endsWith("google.com");
  } catch {
    return false;
  }
}

export function ProfileAvatar({ initials }: { initials: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [googleUrl, setGoogleUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [sheet, setSheet] = useState(false);
  const [hint, setHint] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    try {
      const cached = localStorage.getItem("notho-avatar-url");
      // Cached Google URLs were never an explicit Notho choice — drop them.
      if (cached && !isGoogleHosted(cached)) setAvatarUrl(cached);
      else if (cached && isGoogleHosted(cached)) localStorage.removeItem("notho-avatar-url");
    } catch {
      /* ignore */
    }
    void supabase.auth.getUser().then(async ({ data }) => {
      const user = data.user;
      if (!user || cancelled) return;
      const meta = user.user_metadata as { avatar_url?: string; picture?: string } | undefined;
      const google = (typeof meta?.picture === "string" && meta.picture) || (typeof meta?.avatar_url === "string" && meta.avatar_url) || "";
      if (google && isGoogleHosted(google)) setGoogleUrl(google);
      const { data: row } = await supabase
        .from("profiles")
        .select("avatar_url")
        .eq("user_id", user.id)
        .maybeSingle();
      const fromRow = (row as { avatar_url?: string | null } | null)?.avatar_url?.trim() || "";
      if (cancelled) return;
      if (fromRow && !isGoogleHosted(fromRow)) setAvatarUrl(fromRow);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const flash = (msg: string) => {
    setHint(msg);
    window.setTimeout(() => setHint(null), 2200);
  };

  const onFile = async (file: File) => {
    setBusy(true);
    try {
      const url = await uploadProfileAvatar(file);
      setAvatarUrl(url);
      flash("Photo updated");
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
      flash("Photo removed");
    } catch {
      setAvatarUrl(null);
    } finally {
      setBusy(false);
      setSheet(false);
    }
  };

  return (
    <div style={{ position: "relative", width: 80, height: 80, marginBottom: 12 }}>
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
      <button
        type="button"
        onClick={() => setSheet(true)}
        disabled={busy}
        aria-label={avatarUrl ? "Change profile photo" : "Add a profile photo"}
        style={{
          width: 72,
          height: 72,
          borderRadius: "50%",
          margin: "4px",
          padding: 0,
          border: "none",
          overflow: "hidden",
          cursor: busy ? "wait" : "pointer",
          background: "linear-gradient(135deg, var(--color-primary), var(--color-secondary))",
          boxShadow: "0 4px 16px rgba(0,122,133,0.25)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        ) : (
          <span style={{ fontSize: 28, fontWeight: 900, color: "white" }}>{initials}</span>
        )}
      </button>
      <button
        type="button"
        onClick={() => setSheet(true)}
        disabled={busy}
        aria-hidden
        tabIndex={-1}
        style={{
          position: "absolute",
          right: 0,
          bottom: 0,
          width: 26,
          height: 26,
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
        }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
          <circle cx="12" cy="13" r="4" />
        </svg>
      </button>

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
          {busy ? "Updating photo…" : hint}
        </div>
      )}
    </div>
  );
}

/** @deprecated overlay removed — ProfileView renders ProfileAvatar in flow */
export function ProfilePhotoGate() {
  return null;
}
