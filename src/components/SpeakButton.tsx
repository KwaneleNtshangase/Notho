"use client";
import { LocalizedElement as I18nElement } from "@/i18n/LocalizedText";

import React, { useEffect, useState, useCallback } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { useLocale } from "@/i18n/LocaleProvider";
import { useSpeechVoice } from "./useSpeechVoice";
import { speechText, voiceKey } from "@/lib/speech";

interface SpeakButtonProps {
  text: string;
  className?: string;
  style?: React.CSSProperties;
}

function stripHtml(html: string): string {
  if (typeof document === "undefined") return html.replace(/<[^>]+>/g, " ");
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
}

export function SpeakButton({ text, className, style }: SpeakButtonProps) {
  const { locale, t } = useLocale();
  const { voice } = useSpeechVoice(locale);
  const voiceId = voice ? voiceKey(voice) : "";
  const [speaking, setSpeaking] = useState(false);
  useEffect(() => {
    return () => { window.speechSynthesis?.cancel(); setSpeaking(false); };
  }, [locale, voiceId]);

  const stop = useCallback(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }, []);

  const speak = useCallback(() => {
    if (!voice || !text.trim()) return;
    // Always cancel anything already speaking so only one utterance plays
    window.speechSynthesis.cancel();

    const clean = stripHtml(text).replace(/\s+/g, " ").trim();
    if (!clean) return;

    const utterance = new SpeechSynthesisUtterance(speechText(clean, locale));
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.voice = voice;
    utterance.lang = voice.lang;

    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  }, [voice, text, locale]);

  const toggle = () => {
    if (speaking) stop();
    else speak();
  };

  if (!voice) return null;

  return (
    <span className={`speak-button-wrap ${className || ""}`} style={{ display: "inline-flex", alignItems: "center", ...style }}>
      <I18nElement as="button"
        type="button"
        onClick={toggle}
        aria-label={speaking ? t("speech.stop") : t("speech.read")}
        title={speaking ? t("speech.stop") : t("speech.read")}
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
      </I18nElement>
    </span>
  );
}
