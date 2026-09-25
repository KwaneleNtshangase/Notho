"use client";

import React, { useRef } from "react";
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

export function ProfileAvatar({
  avatarUrl,
  initials,
  busy,
  onFile,
}: {
  avatarUrl: string | null;
  initials: string;
  busy: boolean;
  onFile: (file: File) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        aria-hidden="true"
        tabIndex={-1}
        style={{ display: "none" }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFile(file);
          if (inputRef.current) inputRef.current.value = "";
        }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        aria-label={avatarUrl ? "Change profile photo" : "Add a profile photo"}
        style={{
          position: "relative",
          width: 80,
          height: 80,
          borderRadius: "50%",
          marginBottom: 8,
          padding: 0,
          border: "none",
          cursor: busy ? "wait" : "pointer",
          background: "linear-gradient(135deg, var(--color-primary), var(--color-secondary))",
          boxShadow: "0 4px 16px rgba(0,122,133,0.25)",
          overflow: "hidden",
        }}
      >
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        ) : (
          <span
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              height: "100%",
              fontSize: 28,
              fontWeight: 900,
              color: "white",
            }}
          >
            {initials}
          </span>
        )}
        <span
          style={{
            position: "absolute",
            right: 2,
            bottom: 2,
            width: 26,
            height: 26,
            borderRadius: "50%",
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--color-text-primary)",
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
            <circle cx="12" cy="13" r="4" />
          </svg>
        </span>
      </button>
      <div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 8 }}>
        {busy ? "Updating photo…" : "Tap the photo to change it"}
      </div>
    </div>
  );
}
