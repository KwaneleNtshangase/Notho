/** Copy that is allowed on a Duo share card. The caption stays in the share sheet. */

export type DuoCardKind = "lesson" | "streak" | "calculator";

export type DuoCardCopy = {
  kind: DuoCardKind;
  eyebrow: string;
  title: string;
  number: string;
  footnote: string;
};

export function duoCardCopy(input: {
  type: DuoCardKind;
  lessonTitle?: string;
  xpEarned?: number;
  isPerfect?: boolean;
  streakDays?: number;
  headline?: string;
}): DuoCardCopy {
  if (input.type === "streak") {
    const days = Math.max(0, input.streakDays ?? 0);
    return {
      kind: "streak",
      eyebrow: "",
      title: "",
      number: String(days),
      footnote: "day streak",
    };
  }
  if (input.type === "calculator") {
    return {
      kind: "calculator",
      eyebrow: "CALCULATED",
      title: (input.headline ?? "A money number").trim() || "A money number",
      number: "",
      footnote: "",
    };
  }
  const perfect = Boolean(input.isPerfect);
  return {
    kind: "lesson",
    eyebrow: perfect ? "PERFECT LESSON" : "LESSON COMPLETE",
    title: (input.lessonTitle ?? "Lesson").trim() || "Lesson",
    number: `+${Math.max(0, input.xpEarned ?? 0)} XP`,
    footnote: perfect ? "no misses" : "",
  };
}

/** Card pixels must not carry the share caption or a URL. */
export function cardHasCaption(copy: DuoCardCopy): boolean {
  const blob = `${copy.eyebrow} ${copy.title} ${copy.number} ${copy.footnote}`.toLowerCase();
  return blob.includes("notho.co.za") || blob.includes("http") || blob.includes("try it");
}
