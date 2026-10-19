"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Volume2, VolumeX } from "lucide-react";

interface SpeakButtonProps {
  text: string;
  className?: string;
  style?: React.CSSProperties;
}

export const VOICE_STORAGE_KEY = "notho-tts-voice-key";

function stripHtml(html: string): string {
  if (typeof document === "undefined") return html.replace(/<[^>]+>/g, " ");
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
}

export function voiceKey(v: SpeechSynthesisVoice): string {
  return `${v.name}||${v.lang}`;
}

export function getSavedVoice(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !window.speechSynthesis) return null;
  const saved = localStorage.getItem(VOICE_STORAGE_KEY);
  if (!saved) return null;
  const voices = window.speechSynthesis.getVoices();
  return voices.find((v) => voiceKey(v) === saved) ?? null;
}

export function SpeakButton({ text, className, style }: SpeakButtonProps) {
  const [speaking, setSpeaking] = useState(false);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    setSupported(true);
    // Prime voices (some browsers only populate after this)
    window.speechSynthesis.getVoices();
  }, []);

  const stop = useCallback(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }, []);

  const speak = useCallback(() => {
    if (!supported || !text.trim()) return;
    // Always cancel anything already speaking so only one utterance plays
    window.speechSynthesis.cancel();

    const clean = stripHtml(text).replace(/\s+/g, " ").trim();
    if (!clean) return;

    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.volume = 1;

    const voice = getSavedVoice();
    if (voice) utterance.voice = voice;

    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  }, [supported, text]);

  const toggle = () => {
    if (speaking) stop();
    else speak();
  };

  if (!supported) return null;

  return (
    <span className={`speak-button-wrap ${className || ""}`} style={{ display: "inline-flex", alignItems: "center", ...style }}>
      <button
        type="button"
        onClick={toggle}
        aria-label={speaking ? "Stop reading" : "Read aloud"}
        title={speaking ? "Stop" : "Read aloud"}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 32,
          height: 32,
          borderRadius: 8,
          border: "1px solid var(--color-border)",
          background: speaking ? "var(--color-primary)" : "var(--color-surface)",
          color: speaking ? "white" : "var(--color-text-secondary)",
          cursor: "pointer",
          flexShrink: 0,
        }}
      >
        {speaking ? <VolumeX size={16} /> : <Volume2 size={16} />}
      </button>
    </span>
  );
}
