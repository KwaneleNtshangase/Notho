"use client";

import { useEffect, useState } from "react";

const APP_STORE = "https://apps.apple.com/app/notho/id6808142049";
const PLAY = "https://play.google.com/apps/testing/za.co.notho.app";
const GALLERY = "https://appgallery.huawei.com/app/C118850237";
const WEB = "/learn";

function storeForDevice(): string {
  if (typeof navigator === "undefined") return WEB;
  const ua = navigator.userAgent || "";
  if (/iPhone|iPad|iPod/i.test(ua)) return APP_STORE;
  if (/Huawei|HUAWEI|HarmonyOS/i.test(ua)) return GALLERY;
  if (/Android/i.test(ua)) return PLAY;
  return WEB;
}

export function OpenNothoButton({
  label = "Open Notho",
  style,
}: {
  label?: string;
  style?: React.CSSProperties;
}) {
  const [href, setHref] = useState(WEB);
  useEffect(() => {
    setHref(storeForDevice());
  }, []);
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      style={style}
    >
      {label}
    </a>
  );
}
