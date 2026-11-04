"use client";
import { LocalizedText as I18nText, LocalizedElement as I18nElement } from "@/i18n/LocalizedText";

import React, { useEffect, useId } from "react";
import { Volume2 } from "lucide-react";
import { voiceKey, speechText } from "@/lib/speech";
import { useSpeechVoice } from "./useSpeechVoice";
import { useLocale } from "@/i18n/LocaleProvider";

export function VoiceSettings() {
  const { locale, t } = useLocale();
  const { voices, voice, choose } = useSpeechVoice(locale);
  const id = useId();
  const voiceId = voice ? voiceKey(voice) : "";
  useEffect(() => () => { window.speechSynthesis?.cancel(); }, [locale, voiceId]);

  const test = () => {
    if (!window.speechSynthesis || !voice) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(speechText(locale === "en" ? "This is how Notho will read lessons to you." : t("share.lessonDone"), locale));
    u.rate = 0.95;
    u.voice = voice;
    u.lang = voice.lang;
    window.speechSynthesis.speak(u);
  };

  if (!voice) return null;

  return (
    <div style={{
      background: "var(--color-surface)", border: "1px solid var(--color-border)",
      borderRadius: 12, padding: "14px 16px", marginBottom: 8,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
        <span style={{ color: "var(--color-primary)" }}><Volume2 size={18} /></span>
        <div>
          <label htmlFor={id} style={{ fontWeight: 600, fontSize: 14, color: "var(--color-text-primary)" }}><I18nText source={"Read-aloud voice"} /></label>
          <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}><I18nText source={"Used when you tap the speaker in lessons"} /></div>
        </div>
      </div>
      <select
        id={id}
        value={voiceKey(voice)}
        onChange={(e) => choose(e.target.value)}
        style={{
          width: "100%", padding: "8px 10px", borderRadius: 8,
          border: "1px solid var(--color-border)", background: "var(--color-bg)",
          color: "var(--color-text-primary)", fontSize: 14, marginBottom: 10,
        }}
      >
        {voices.map((v) => (
          <I18nElement as="option" key={voiceKey(v)} value={voiceKey(v)}>
            {v.name} ({v.lang})
          </I18nElement>
        ))}
      </select>
      <button type="button" className="btn btn-secondary" onClick={test} style={{ fontSize: 13 }}><I18nText source={"Test voice"} /></button>
    </div>
  );
}
