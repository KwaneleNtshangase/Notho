"use client";

import React, { useEffect, useState } from "react";
import { Volume2 } from "lucide-react";
import { VOICE_STORAGE_KEY, voiceKey, getSavedVoice } from "@/components/SpeakButton";

export function VoiceSettings() {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    setSupported(true);

    const load = () => {
      const available = window.speechSynthesis.getVoices();
      const sorted = [...available].sort((a, b) => {
        const aScore = (a.lang.startsWith("en") ? 10 : 0) + (a.lang.toLowerCase().includes("za") ? 5 : 0) + (a.localService ? 1 : 0);
        const bScore = (b.lang.startsWith("en") ? 10 : 0) + (b.lang.toLowerCase().includes("za") ? 5 : 0) + (b.localService ? 1 : 0);
        return bScore - aScore;
      });
      setVoices(sorted);

      const saved = localStorage.getItem(VOICE_STORAGE_KEY);
      if (saved && sorted.some((v) => voiceKey(v) === saved)) {
        setSelected(saved);
      } else if (sorted.length > 0) {
        setSelected(voiceKey(sorted[0]));
      }
    };

    load();
    window.speechSynthesis.addEventListener("voiceschanged", load);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", load);
  }, []);

  const choose = (key: string) => {
    setSelected(key);
    localStorage.setItem(VOICE_STORAGE_KEY, key);
  };

  const test = () => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance("This is how Notho will read lessons to you.");
    u.rate = 0.95;
    const voice = getSavedVoice();
    if (voice) u.voice = voice;
    window.speechSynthesis.speak(u);
  };

  if (!supported) return null;

  return (
    <div style={{
      background: "var(--color-surface)", border: "1px solid var(--color-border)",
      borderRadius: 12, padding: "14px 16px", marginBottom: 8,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
        <span style={{ color: "var(--color-primary)" }}><Volume2 size={18} /></span>
        <div>
          <div style={{ fontWeight: 600, fontSize: 14, color: "var(--color-text-primary)" }}>Read-aloud voice</div>
          <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>Used when you tap the speaker in lessons</div>
        </div>
      </div>
      <select
        value={selected}
        onChange={(e) => choose(e.target.value)}
        style={{
          width: "100%", padding: "8px 10px", borderRadius: 8,
          border: "1px solid var(--color-border)", background: "var(--color-bg)",
          color: "var(--color-text-primary)", fontSize: 14, marginBottom: 10,
        }}
      >
        {voices.map((v) => (
          <option key={voiceKey(v)} value={voiceKey(v)}>
            {v.name} ({v.lang})
          </option>
        ))}
      </select>
      <button type="button" className="btn btn-secondary" onClick={test} style={{ fontSize: 13 }}>
        Test voice
      </button>
    </div>
  );
}
