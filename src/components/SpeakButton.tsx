"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Volume2, VolumeX, Settings2 } from "lucide-react";

interface SpeakButtonProps {
  text: string;
  /** Optional short label shown next to the icon on larger screens */
  label?: string;
  className?: string;
  style?: React.CSSProperties;
}

const VOICE_STORAGE_KEY = "notho-tts-voice-uri";

function stripHtml(html: string): string {
  if (typeof document === "undefined") return html.replace(/<[^>]+>/g, " ");
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
}

export function SpeakButton({ text, label, className, style }: SpeakButtonProps) {
  const [speaking, setSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string | null>(null);
  const [showVoices, setShowVoices] = useState(false);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    setSupported(true);

    const loadVoices = () => {
      const available = window.speechSynthesis.getVoices();
      // Prefer English (especially en-ZA) then other voices
      const sorted = [...available].sort((a, b) => {
        const aScore = (a.lang.startsWith("en") ? 10 : 0) + (a.lang.includes("ZA") || a.lang.includes("za") ? 5 : 0) + (a.localService ? 1 : 0);
        const bScore = (b.lang.startsWith("en") ? 10 : 0) + (b.lang.includes("ZA") || b.lang.includes("za") ? 5 : 0) + (b.localService ? 1 : 0);
        return bScore - aScore;
      });
      setVoices(sorted);

      const saved = localStorage.getItem(VOICE_STORAGE_KEY);
      if (saved && sorted.some((v) => v.voiceURI === saved)) {
        setSelectedVoiceURI(saved);
      } else if (sorted.length > 0) {
        setSelectedVoiceURI(sorted[0].voiceURI);
      }
    };

    loadVoices();
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
  }, []);

  const stop = useCallback(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }, []);

  const speak = useCallback(() => {
    if (!supported || !text.trim()) return;
    stop();

    const clean = stripHtml(text).replace(/\s+/g, " ").trim();
    if (!clean) return;

    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.volume = 1;

    if (selectedVoiceURI) {
      const voice = voices.find((v) => v.voiceURI === selectedVoiceURI);
      if (voice) utterance.voice = voice;
    }

    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  }, [supported, text, selectedVoiceURI, voices, stop]);

  const toggle = () => {
    if (speaking) stop();
    else speak();
  };

  const selectVoice = (uri: string) => {
    setSelectedVoiceURI(uri);
    localStorage.setItem(VOICE_STORAGE_KEY, uri);
    setShowVoices(false);
    // Restart if currently speaking
    if (speaking) {
      stop();
      setTimeout(speak, 50);
    }
  };

  if (!supported) return null;

  return (
    <span className={`speak-button-wrap ${className || ""}`} style={{ display: "inline-flex", alignItems: "center", gap: 4, ...style }}>
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
      {label && <span style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>{label}</span>}
      {voices.length > 1 && (
        <button
          type="button"
          onClick={() => setShowVoices((v) => !v)}
          aria-label="Choose voice"
          title="Choose voice"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 28,
            height: 28,
            borderRadius: 6,
            border: "none",
            background: "transparent",
            color: "var(--color-text-secondary)",
            cursor: "pointer",
          }}
        >
          <Settings2 size={14} />
        </button>
      )}
      {showVoices && (
        <div
          style={{
            position: "absolute",
            zIndex: 100,
            marginTop: 36,
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: 10,
            boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
            maxHeight: 220,
            overflowY: "auto",
            minWidth: 200,
            padding: 4,
          }}
        >
          {voices.slice(0, 12).map((v) => (
            <button
              key={v.voiceURI}
              type="button"
              onClick={() => selectVoice(v.voiceURI)}
              style={{
                display: "block",
                width: "100%",
                textAlign: "left",
                padding: "6px 10px",
                border: "none",
                background: v.voiceURI === selectedVoiceURI ? "var(--color-primary)" : "transparent",
                color: v.voiceURI === selectedVoiceURI ? "white" : "var(--color-text-primary)",
                borderRadius: 6,
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              {v.name} <span style={{ opacity: 0.6, fontSize: 11 }}>({v.lang})</span>
            </button>
          ))}
        </div>
      )}
    </span>
  );
}
