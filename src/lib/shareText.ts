export type ShareTextType = "lesson" | "badge" | "streak" | "level";

export type ShareTextData = {
  lessonTitle?: string;
  badgeName?: string;
  streakDays?: number;
  xp?: number;
  level?: number;
  investorProfile?: string;
};

export function generateShareText(type: ShareTextType, data: ShareTextData): string {
  if (type === "lesson") {
    const title = data.lessonTitle ?? "a lesson";
    const xpPart = data.xp ? ` (+${data.xp} XP)` : "";
    return `I just completed "${title}"${xpPart} on Notho 🇿🇦\n\nFree South African money lessons, no jargon, 2 minutes a day. How would you score on this topic?\n👉 notho.co.za`;
  }
  if (type === "badge") {
    const name = data.badgeName ?? "a";
    return `I just unlocked the "${name}" badge on Notho 🏅\n\nBuilding real SA financial knowledge. Quiz: do you know the difference between CGT and income tax?\n👇 notho.co.za`;
  }
  if (type === "streak") {
    const days = data.streakDays ?? 0;
    return `${days} days straight learning about money 🔥\n\nNotho, free SA financial lessons. Most people can't answer 3 basic money questions. Can you?\n👇 notho.co.za`;
  }
  if (type === "level") {
    const level = data.level ?? 1;
    const profile = data.investorProfile ? ` My investor profile: ${data.investorProfile}.` : "";
    return `I just hit Level ${level} on Notho 🚀${profile}\n\nDo you know YOUR investor profile? Takes 2 min, most South Africans get it wrong.\n👇 notho.co.za`;
  }
  return "";
}
