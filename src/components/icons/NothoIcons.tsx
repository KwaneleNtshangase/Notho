import { LocalizedText as I18nText, LocalizedElement as I18nElement } from "@/i18n/LocalizedText";
import type { SVGProps } from "react";

/**
 * Notho house-style icon set.
 *
 * One consistent visual language so the app stops looking like the default
 * Lucide/Feather set everyone uses:
 *   - 24x24 grid, rounded geometry, 2px rounded strokes
 *   - currentColor everywhere (so they inherit text/nav colour)
 *   - a single filled "accent" per icon for warmth/signature
 *
 * The wrapper accepts the same props as lucide (size, strokeWidth, color,
 * className, style, aria-*, onClick, ...) so these are drop-in replacements
 * for `lucide-react`: just repoint the import.
 */

export type NothoIconProps = Omit<SVGProps<SVGSVGElement>, "ref"> & {
  size?: number;
};

function Icon({
  size = 24,
  strokeWidth = 2,
  className,
  style,
  children,
  ...rest
}: NothoIconProps & { children: React.ReactNode }) {
  return (
    <I18nElement as="svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      <I18nText>{children}</I18nText>
    </I18nElement>
  );
}

/* ── Learn - open book with page detail + growth spark ─────────────────── */
export function NothoLearn(p: NothoIconProps) {
  return (
    <Icon {...p}>
      <path d="M12 7C10 5.8 7.4 5.3 5 5.6c-.6.07-1 .57-1 1.15v9.4c0 .62.5 1.1 1.12 1.04 2.3-.26 4.7.3 6.88 1.71" />
      <path d="M12 7c2-1.2 4.6-1.7 7-1.4.6.07 1 .57 1 1.15v9.4c0 .62-.5 1.1-1.12 1.04-2.3-.26-4.7.3-6.88 1.71" />
      <path d="M12 7v11.15" />
      <path d="M6.6 9.3h3.1" opacity="0.5" />
      <path d="M6.6 11.7h2.6" opacity="0.5" />
      <path d="M14.3 9.3h3.1" opacity="0.5" />
      <path d="M14.8 11.7h2.6" opacity="0.5" />
      <path d="M20.1 3l.6 1.25 1.25.6-1.25.6-.6 1.25-.6-1.25L18.25 4.85l1.25-.6z" fill="currentColor" stroke="none" />
    </Icon>
  );
}

/* ── Calculate - calculator ────────────────────────────────────────────── */
export function NothoCalculate(p: NothoIconProps) {
  return (
    <Icon {...p}>
      <rect x="5" y="2.6" width="14" height="18.8" rx="3.2" />
      <rect x="8" y="5.6" width="8" height="3.2" rx="1.2" fill="currentColor" opacity="0.28" stroke="none" />
      <circle cx="9" cy="13.2" r="1.05" fill="currentColor" stroke="none" />
      <circle cx="12" cy="13.2" r="1.05" fill="currentColor" stroke="none" />
      <circle cx="9" cy="17" r="1.05" fill="currentColor" stroke="none" />
      <circle cx="12" cy="17" r="1.05" fill="currentColor" stroke="none" />
      <rect x="14.4" y="12.3" width="2.6" height="5.6" rx="1.3" fill="currentColor" stroke="none" />
    </Icon>
  );
}

/* ── Budget - wallet with note tucked in + clasp ───────────────────────── */
export function NothoBudget(p: NothoIconProps) {
  return (
    <Icon {...p}>
      <rect x="3.5" y="8" width="17" height="11" rx="2.6" />
      <path d="M7 8V5.7c0-.6.55-1.05 1.15-.93l8.4 1.7c.5.1.85.55.85 1.06V8" />
      <rect x="14" y="11.3" width="6.5" height="4.4" rx="2.2" fill="currentColor" opacity="0.28" stroke="none" />
      <circle cx="17.3" cy="13.5" r="1.05" fill="currentColor" stroke="none" />
    </Icon>
  );
}

/* ── Goals - arrow striking the bullseye (echoes the logo arrow) ────────── */
export function NothoGoals(p: NothoIconProps) {
  return (
    <Icon {...p}>
      <circle cx="10.5" cy="13.5" r="6.8" />
      <circle cx="10.5" cy="13.5" r="3.2" opacity="0.5" />
      <circle cx="10.5" cy="13.5" r="1.2" fill="currentColor" stroke="none" />
      <path d="M10.5 13.5 20 4" />
      <path d="M15.5 4H20v4.5" />
    </Icon>
  );
}

/* ── Progress - ascending bars + rising arrow (the logo's chart) ────────── */
export function NothoProgress(p: NothoIconProps) {
  return (
    <Icon {...p}>
      <rect x="3.2" y="14" width="3.4" height="6" rx="1.2" fill="currentColor" opacity="0.3" stroke="none" />
      <rect x="10.3" y="11" width="3.4" height="9" rx="1.2" fill="currentColor" opacity="0.3" stroke="none" />
      <rect x="17.4" y="8" width="3.4" height="12" rx="1.2" fill="currentColor" opacity="0.3" stroke="none" />
      <path d="M4 12.5l5-3.8 3 2.2 7.2-6" />
      <path d="M15.4 4.9h4v4" />
    </Icon>
  );
}

/* ── Profile - person ──────────────────────────────────────────────────── */
export function NothoProfile(p: NothoIconProps) {
  return (
    <Icon {...p}>
      <circle cx="12" cy="8.4" r="3.7" />
      <path d="M5.5 19.5c0-3.6 2.9-6.2 6.5-6.2s6.5 2.6 6.5 6.2" />
    </Icon>
  );
}

/* ── Leaderboard - podium + spark ──────────────────────────────────────── */
export function NothoLeaderboard(p: NothoIconProps) {
  return (
    <Icon {...p}>
      <rect x="3.5" y="12.5" width="4.7" height="7.5" rx="1.5" />
      <rect x="9.65" y="8.7" width="4.7" height="11.3" rx="1.5" />
      <rect x="15.8" y="14.5" width="4.7" height="5.5" rx="1.5" />
      <path d="M12 3.2l.85 1.7 1.7.85-1.7.85L12 9.15l-.85-1.7-1.7-.85 1.7-.85z" fill="currentColor" stroke="none" />
    </Icon>
  );
}

/* ═══ Gamification ═════════════════════════════════════════════════════════
   The "seen everywhere" set: streak, XP, hearts, freeze, level.
   Same house language so the top bar / stats feel custom, not stock.
   ════════════════════════════════════════════════════════════════════════ */

/* ── Streak - flame with an inner spark ────────────────────────────────── */
export function NothoStreak(p: NothoIconProps) {
  return (
    <Icon {...p}>
      <path d="M12 2.5c.7 2.3 2.2 3.3 3.5 4.9 1.2 1.5 1.8 3 1.8 4.8a5.3 5.3 0 1 1-10.6 0c0-1.3.4-2.5 1.2-3.6.3.8.9 1.4 1.7 1.6-.5-1.9.2-3.8 2.4-7.7z" />
      <path d="M12 12.2c1.3 0 2.3 1 2.3 2.3S13.3 16.8 12 16.8s-2.3-1-2.3-2.3c0-.8.4-1.4 1-1.8.1.6.5 1 1 1.1-.3-.6-.1-1.1.3-1.6z" fill="currentColor" stroke="none" />
    </Icon>
  );
}

/* ── XP - bold filled lightning bolt ───────────────────────────────────── */
export function NothoXP(p: NothoIconProps) {
  return (
    <Icon {...p}>
      <path d="M13.1 2.2 4.7 12.9c-.5.6-.06 1.5.72 1.5H10l-1 6.8c-.13.85.95 1.25 1.4.55L19.3 11.1c.5-.62.05-1.5-.72-1.5H14l1-6.85c.13-.85-.95-1.25-1.4-.55z" fill="currentColor" stroke="none" />
    </Icon>
  );
}

/* ── Hearts - rounded heart (supports filled state for the row) ─────────── */
export function NothoHeart({ filled = true, ...p }: NothoIconProps & { filled?: boolean }) {
  return (
    <Icon {...p}>
      <path
        d="M12 20.5 4.4 13a4.7 4.7 0 0 1 6.6-6.7l1 .98 1-.98A4.7 4.7 0 0 1 19.6 13z"
        fill={filled ? "currentColor" : "none"}
      />
    </Icon>
  );
}

/* ── Freeze - shield with a snowflake ──────────────────────────────────── */
export function NothoFreeze(p: NothoIconProps) {
  return (
    <Icon {...p}>
      <path d="M12 2.6 5.2 5.1c-.5.2-.8.6-.8 1.1v5c0 4.2 2.9 7.5 7.1 8.6.3.1.6.1.9 0 4.2-1.1 7.1-4.4 7.1-8.6v-5c0-.5-.3-.9-.8-1.1L12 2.6z" />
      <path d="M12 8v6.4M9.2 9.7l5.6 3.2M14.8 9.7l-5.6 3.2" />
      <circle cx="12" cy="11.3" r="1" fill="currentColor" stroke="none" />
    </Icon>
  );
}

/* ── Level - medal with a star ─────────────────────────────────────────── */
export function NothoLevel(p: NothoIconProps) {
  return (
    <Icon {...p}>
      <circle cx="12" cy="9" r="6" />
      <path d="M8.7 14.2 7.4 21l4.6-2.5L16.6 21l-1.3-6.8" />
      <path d="M12 6l.95 1.93 2.13.31-1.54 1.5.36 2.12L12 10.9l-1.9 1.06.36-2.12-1.54-1.5 2.13-.31z" fill="currentColor" stroke="none" />
    </Icon>
  );
}

/* ═══ Course / category tiles ══════════════════════════════════════════════
   Bespoke versions of the Learn-screen category icons.
   ════════════════════════════════════════════════════════════════════════ */

/* ── Shield - protection / emergency fund (shield + check) ──────────────── */
export function NothoShield(p: NothoIconProps) {
  return (
    <Icon {...p}>
      <path d="M12 2.6 5.2 5.1c-.5.2-.8.6-.8 1.1v5c0 4.2 2.9 7.5 7.1 8.6.3.1.6.1.9 0 4.2-1.1 7.1-4.4 7.1-8.6v-5c0-.5-.3-.9-.8-1.1L12 2.6z" />
      <path d="M9 11.6l2.1 2.1 4-4.3" />
    </Icon>
  );
}

/* ── Credit card ───────────────────────────────────────────────────────── */
export function NothoCredit(p: NothoIconProps) {
  return (
    <Icon {...p}>
      <rect x="2.5" y="5" width="19" height="14" rx="3" />
      <rect x="2.5" y="8.4" width="19" height="2.7" fill="currentColor" stroke="none" />
      <rect x="5.5" y="14.2" width="5" height="2.1" rx="1.05" fill="currentColor" opacity="0.35" stroke="none" />
    </Icon>
  );
}

/* ── Building - banks / institutions ───────────────────────────────────── */
export function NothoBuilding(p: NothoIconProps) {
  return (
    <Icon {...p}>
      <path d="M4 9.6 12 4.5l8 5.1" />
      <path d="M4 9.9h16" />
      <path d="M6 10.2v7.3M10 10.2v7.3M14 10.2v7.3M18 10.2v7.3" />
      <path d="M3.4 20.4h17.2" />
      <circle cx="12" cy="7.3" r="0.95" fill="currentColor" stroke="none" />
    </Icon>
  );
}

/* ── Briefcase - business / career ─────────────────────────────────────── */
export function NothoBriefcase(p: NothoIconProps) {
  return (
    <Icon {...p}>
      <rect x="3" y="7.5" width="18" height="12" rx="2.6" />
      <path d="M8.5 7.5V6c0-.9.7-1.6 1.6-1.6h3.8c.9 0 1.6.7 1.6 1.6v1.5" />
      <rect x="3" y="11.4" width="18" height="2" fill="currentColor" opacity="0.3" stroke="none" />
      <rect x="10.4" y="11" width="3.2" height="3" rx="0.9" fill="currentColor" stroke="none" />
    </Icon>
  );
}

/* ── Umbrella - insurance / cover ──────────────────────────────────────── */
export function NothoUmbrella(p: NothoIconProps) {
  return (
    <Icon {...p}>
      <path d="M3.6 11a8.4 8.4 0 0 1 16.8 0c-1.35-.95-2.45-.95-3.4 0-.95-.9-2.45-.9-3.4 0-.95-.9-2.45-.9-3.4 0-.95-.95-2.05-.95-3.2 0z" />
      <path d="M12 11v7.4a2.2 2.2 0 0 0 4.4 0" />
      <circle cx="12" cy="3.4" r="0.95" fill="currentColor" stroke="none" />
    </Icon>
  );
}

/* ── Flag - goals / milestones ─────────────────────────────────────────── */
export function NothoFlag(p: NothoIconProps) {
  return (
    <Icon {...p}>
      <path d="M6 21V3.6" />
      <path d="M6 4.6h10.4c.85 0 1.3.95.72 1.6L15.7 8l1.42 1.8c.58.65.13 1.6-.72 1.6H6z" fill="currentColor" opacity="0.22" stroke="currentColor" />
    </Icon>
  );
}

/* ── Home - saving for a home ──────────────────────────────────────────── */
export function NothoHome(p: NothoIconProps) {
  return (
    <Icon {...p}>
      <path d="M4 10.6 12 4l8 6.6" />
      <path d="M5.6 9.7V19a1 1 0 0 0 1 1H17.4a1 1 0 0 0 1-1V9.7" />
      <rect x="10" y="13.6" width="4" height="6.4" rx="0.6" fill="currentColor" opacity="0.3" stroke="none" />
    </Icon>
  );
}

/* ── Document - tax / paperwork ────────────────────────────────────────── */
export function NothoDoc(p: NothoIconProps) {
  return (
    <Icon {...p}>
      <path d="M6 2.6h7.2L19 8.2v11.2a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4.6a2 2 0 0 1 2-2z" />
      <path d="M13 2.8V8.4h5.4" />
      <path d="M8.6 12.6h6.8M8.6 15.6h6.8M8.6 18.4h4" opacity="0.55" />
    </Icon>
  );
}

/* ── Alert - emergencies / scams ───────────────────────────────────────── */
export function NothoAlert(p: NothoIconProps) {
  return (
    <Icon {...p}>
      <path d="M6 18v-5.6a6 6 0 0 1 12 0V18" />
      <path d="M4.4 18.2h15.2" />
      <path d="M12 4.2V2.5M19.2 6.6l1.1-1.1M4.8 6.6 3.7 5.5" />
      <circle cx="12" cy="12.6" r="2" fill="currentColor" stroke="none" />
    </Icon>
  );
}

/* ── Brain - money psychology ──────────────────────────────────────────── */
export function NothoBrain(p: NothoIconProps) {
  return (
    <Icon {...p}>
      <path d="M9.6 4.4a3 3 0 0 0-3 3 3 3 0 0 0-1.1 5.8v.8a3 3 0 0 0 4.1 2.8" />
      <path d="M14.4 4.4a3 3 0 0 1 3 3 3 3 0 0 1 1.1 5.8v.8a3 3 0 0 1-4.1 2.8" />
      <path d="M12 4.9v14.2" opacity="0.5" />
      <circle cx="9.1" cy="9.6" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="14.9" cy="9.6" r="0.9" fill="currentColor" stroke="none" />
    </Icon>
  );
}

/* ── Trophy - wins / completion / leaderboard ──────────────────────────── */
export function NothoTrophy(p: NothoIconProps) {
  return (
    <Icon {...p}>
      <path d="M6.5 4h11v4.5a5.5 5.5 0 0 1-11 0z" />
      <path d="M6.5 5.5H4.2c0 2.2 1 3.6 2.8 4M17.5 5.5h2.3c0 2.2-1 3.6-2.8 4" />
      <path d="M9.5 14.2 9 18h6l-.5-3.8" />
      <path d="M7.5 20.5h9" />
      <path d="M12 7.2l.7 1.4 1.5.22-1.1 1.06.26 1.52L12 10.7l-1.36.72.26-1.52-1.1-1.06 1.5-.22z" fill="currentColor" stroke="none" />
    </Icon>
  );
}

/* ═══ Category icons (house style) - intuitive picks for budget categories ══ */
export function Fuel(p: NothoIconProps) {
  return <Icon {...p}><rect x="4" y="4" width="9" height="16" rx="1.6" /><path d="M4 10h9" /><path d="M13 8l3 3v6a2 2 0 0 0 2 2 2 2 0 0 0 2-2V9l-2.5-2.5" /><rect x="6" y="6.5" width="5" height="2.5" rx="0.6" fill="currentColor" stroke="none" /></Icon>;
}
export function Utensils(p: NothoIconProps) {
  return <Icon {...p}><path d="M7 3v8a2 2 0 0 0 2 2h0V3" /><path d="M9 13v8" /><path d="M5 3v5" /><path d="M17 3c-1.5 0-2.5 2-2.5 5s1 4 2.5 4v9" /></Icon>;
}
export function Coffee(p: NothoIconProps) {
  return <Icon {...p}><path d="M4 9h13v5a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V9z" /><path d="M17 10h2a2 2 0 0 1 0 4h-2" /><path d="M8 3v2M12 3v2" /></Icon>;
}
export function Dumbbell(p: NothoIconProps) {
  return <Icon {...p}><path d="M9 9v6M15 9v6M9 12h6" /><rect x="3" y="8" width="3" height="8" rx="1" fill="currentColor" stroke="none" /><rect x="18" y="8" width="3" height="8" rx="1" fill="currentColor" stroke="none" /></Icon>;
}
export function Shirt(p: NothoIconProps) {
  return <Icon {...p}><path d="M8 3l4 2 4-2 4 3-2.5 3L18 9v11H6V9l-1.5.9L2 6l4-3z" /></Icon>;
}
export function Gift(p: NothoIconProps) {
  return <Icon {...p}><rect x="4" y="9" width="16" height="11" rx="1.4" /><path d="M4 13h16M12 9v11" /><path d="M12 9S10.5 4 8 5s-.5 4 4 4c4.5 0 6-3 4-4s-4 4-4 4z" /></Icon>;
}
export function Plane(p: NothoIconProps) {
  return <Icon {...p}><path d="M10.5 2.5c.8-.8 2-.8 2 .5v6l7 4v2l-7-2v4l2 1.5V21l-3.5-1L7.5 21v-1.5L9.5 18v-4l-7 2v-2l7-4V3c0-1 .3-1 1.5-.5z" fill="currentColor" stroke="none" /></Icon>;
}
export function PawPrint(p: NothoIconProps) {
  return <Icon {...p}><circle cx="7" cy="9" r="1.7" fill="currentColor" stroke="none" /><circle cx="12" cy="6.5" r="1.7" fill="currentColor" stroke="none" /><circle cx="17" cy="9" r="1.7" fill="currentColor" stroke="none" /><path d="M12 12c-2.5 0-4.5 2-4.5 4.2 0 1.6 1.3 2.3 2.5 2.3 .9 0 1.3-.4 2-.4s1.1.4 2 .4c1.2 0 2.5-.7 2.5-2.3C16.5 14 14.5 12 12 12z" /></Icon>;
}
export function Users(p: NothoIconProps) {
  return <Icon {...p}><circle cx="9" cy="8" r="3" /><path d="M3.5 19a5.5 5.5 0 0 1 11 0" /><circle cx="17" cy="8.5" r="2.3" fill="currentColor" stroke="none" /><path d="M16 13.4a4.5 4.5 0 0 1 4.5 4.6" /></Icon>;
}
export function Church(p: NothoIconProps) {
  return <Icon {...p}><path d="M12 2v4M10 4h4" /><path d="M12 6l5 4v10H7V10z" /><path d="M4 12l3-2M20 12l-3-2M4 12v8h3M20 12v8h-3" /><rect x="10.5" y="14" width="3" height="6" fill="currentColor" stroke="none" /></Icon>;
}
export function Receipt(p: NothoIconProps) {
  return <Icon {...p}><path d="M5 3h14v18l-2.3-1.5L14.3 21 12 19.5 9.7 21 7.3 19.5 5 21z" /><path d="M8 8h8M8 12h8" /></Icon>;
}
export function Scissors(p: NothoIconProps) {
  return <Icon {...p}><circle cx="6" cy="6" r="2.4" /><circle cx="6" cy="18" r="2.4" /><path d="M8 8l12 10M8 16L20 6M9.5 12l-1.7 1.4" /></Icon>;
}
export function Pill(p: NothoIconProps) {
  return <Icon {...p}><rect x="3.5" y="8" width="17" height="8" rx="4" transform="rotate(-45 12 12)" /><path d="M8.7 8.7l6.6 6.6" /></Icon>;
}
export function Bus(p: NothoIconProps) {
  return <Icon {...p}><rect x="4" y="4" width="16" height="13" rx="2" /><path d="M4 12h16" /><circle cx="8" cy="18.5" r="1.4" fill="currentColor" stroke="none" /><circle cx="16" cy="18.5" r="1.4" fill="currentColor" stroke="none" /><path d="M7.5 8h9" /></Icon>;
}
export function Wifi(p: NothoIconProps) {
  return <Icon {...p}><path d="M2.5 9a13 13 0 0 1 19 0" /><path d="M5.5 12.5a9 9 0 0 1 13 0" /><path d="M8.5 16a5 5 0 0 1 7 0" /><circle cx="12" cy="19.5" r="1.2" fill="currentColor" stroke="none" /></Icon>;
}
export function Droplet(p: NothoIconProps) {
  return <Icon {...p}><path d="M12 3s6 6.5 6 10.5a6 6 0 0 1-12 0C6 9.5 12 3 12 3z" /><path d="M9.5 14a2.5 2.5 0 0 0 2.5 2.5" /></Icon>;
}
export function Wrench(p: NothoIconProps) {
  return <Icon {...p}><path d="M15 4a4.5 4.5 0 0 0-1.5 8.7L5 21l-2-2 8.3-8.5A4.5 4.5 0 0 0 20 6l-2.7 2.7-2-2L18 4a4.5 4.5 0 0 0-3-.0z" /></Icon>;
}
export function Music(p: NothoIconProps) {
  return <Icon {...p}><path d="M9 18V6l10-2v12" /><circle cx="6.5" cy="18" r="2.4" fill="currentColor" stroke="none" /><circle cx="16.5" cy="16" r="2.4" fill="currentColor" stroke="none" /></Icon>;
}
export function Baby(p: NothoIconProps) {
  return <Icon {...p}><circle cx="12" cy="6.5" r="3" /><path d="M9 10c1 1.5 5 1.5 6 0" /><path d="M7 14c1.5 2 3 3 5 3s3.5-1 5-3" /><path d="M7 14v4M17 14v4" /></Icon>;
}
export function Sprout(p: NothoIconProps) {
  return <Icon {...p}><path d="M12 20v-8" /><path d="M12 12C12 8 9 6 4 6c0 4 3 6 8 6z" fill="currentColor" stroke="none" /><path d="M12 14c0-3 2.5-5 7-5 0 3.5-2.5 5-7 5z" /></Icon>;
}

/* ═══ Drop-in replacements for lucide-react ════════════════════════════════
   Same export names as lucide so any `from "@/components/icons/NothoIcons"` import can be
   repointed here with no usage changes. Content/brand icons reuse the
   bespoke designs above; the rest are drawn in the same house style.
   ════════════════════════════════════════════════════════════════════════ */

/* Content / brand aliases */
export const BookOpen = NothoLearn;
export const Wallet = NothoBudget;
export const Calculator = NothoCalculate;
export const User = NothoProfile;
export const Brain = NothoBrain;
export const Briefcase = NothoBriefcase;
export const Building2 = NothoBuilding;
export const Landmark = NothoBuilding;
export const CreditCard = NothoCredit;
export const Shield = NothoShield;
export const Umbrella = NothoUmbrella;
export const Flag = NothoFlag;
export const Home = NothoHome;
export const HomeIcon = NothoHome;
export const FileText = NothoDoc;
export const Siren = NothoAlert;
export const TrendingUp = NothoProgress;
export const Trophy = NothoTrophy;
export const Award = NothoTrophy;
export const Flame = NothoStreak;
export const Zap = NothoXP;

export function Heart(p: NothoIconProps) {
  return <NothoHeart filled={false} {...p} />;
}
export function HeartOff(p: NothoIconProps) {
  return (
    <Icon {...p}>
      <path d="M19.6 13.2A4.6 4.6 0 0 0 13 6.4l-.9.9" />
      <path d="M12 20.4 4.4 12.9a4.6 4.6 0 0 1 1.1-7.3" />
      <path d="M3.4 3.8 20.6 20.4" />
    </Icon>
  );
}

/* Glyphs */
export function X(p: NothoIconProps) {
  return <Icon {...p}><path d="M6 6l12 12M18 6 6 18" /></Icon>;
}
export function Plus(p: NothoIconProps) {
  return <Icon {...p}><path d="M12 5v14M5 12h14" /></Icon>;
}
export function Check(p: NothoIconProps) {
  return <Icon {...p}><path d="M5 12.5l4.4 4.4L19 7.2" /></Icon>;
}
export function CheckCircle(p: NothoIconProps) {
  return <Icon {...p}><circle cx="12" cy="12" r="9" /><path d="M8.2 12.3l2.6 2.6 5-5.2" /></Icon>;
}
export const CheckCircle2 = CheckCircle;
export function ChevronDown(p: NothoIconProps) {
  return <Icon {...p}><path d="M6 9l6 6 6-6" /></Icon>;
}
export function ChevronUp(p: NothoIconProps) {
  return <Icon {...p}><path d="M6 15l6-6 6 6" /></Icon>;
}
export function ChevronLeft(p: NothoIconProps) {
  return <Icon {...p}><path d="M15 6l-6 6 6 6" /></Icon>;
}
export function ChevronRight(p: NothoIconProps) {
  return <Icon {...p}><path d="M9 6l6 6-6 6" /></Icon>;
}
export function ArrowLeft(p: NothoIconProps) {
  return <Icon {...p}><path d="M19 12H5" /><path d="M11 6l-6 6 6 6" /></Icon>;
}
export function ArrowLeftRight(p: NothoIconProps) {
  return <Icon {...p}><path d="M4 8h13" /><path d="M14 5l3 3-3 3" /><path d="M20 16H7" /><path d="M10 13l-3 3 3 3" /></Icon>;
}
export function MoreHorizontal(p: NothoIconProps) {
  return <Icon {...p}><circle cx="5.5" cy="12" r="1.5" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" /><circle cx="18.5" cy="12" r="1.5" fill="currentColor" stroke="none" /></Icon>;
}
export function Hash(p: NothoIconProps) {
  return <Icon {...p}><path d="M9.5 4 8 20M16 4l-1.5 16M4.5 8.5h15M4 15.5h15" /></Icon>;
}
export function Play(p: NothoIconProps) {
  return <Icon {...p}><path d="M7 5.3v13.4a1 1 0 0 0 1.5.86l11-6.7a1 1 0 0 0 0-1.72l-11-6.7A1 1 0 0 0 7 5.3z" fill="currentColor" stroke="none" /></Icon>;
}

/* Alerts / info */
export function AlertCircle(p: NothoIconProps) {
  return <Icon {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7.4v5.4" /><circle cx="12" cy="16.4" r="0.6" fill="currentColor" stroke="none" /></Icon>;
}
export function AlertTriangle(p: NothoIconProps) {
  return <Icon {...p}><path d="M10.3 4.9 3.3 17.4a2 2 0 0 0 1.7 3h14a2 2 0 0 0 1.7-3L13.7 4.9a2 2 0 0 0-3.4 0z" /><path d="M12 9.8v4" /><circle cx="12" cy="16.8" r="0.6" fill="currentColor" stroke="none" /></Icon>;
}
export function Info(p: NothoIconProps) {
  return <Icon {...p}><circle cx="12" cy="12" r="9" /><path d="M12 11v5" /><circle cx="12" cy="7.7" r="0.6" fill="currentColor" stroke="none" /></Icon>;
}
export function HelpCircle(p: NothoIconProps) {
  return <Icon {...p}><circle cx="12" cy="12" r="9" /><path d="M9.6 9.3a2.4 2.4 0 0 1 4.7.8c0 1.6-2.3 2-2.3 3.5" /><circle cx="12" cy="16.6" r="0.6" fill="currentColor" stroke="none" /></Icon>;
}
export function Clock(p: NothoIconProps) {
  return <Icon {...p}><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></Icon>;
}
export function Bell(p: NothoIconProps) {
  return <Icon {...p}><path d="M6 16.5v-5a6 6 0 0 1 12 0v5l1.5 2H4.5z" /><path d="M10 18.5a2 2 0 0 0 4 0" /></Icon>;
}
export function Bug(p: NothoIconProps) {
  return <Icon {...p}><rect x="7.5" y="8" width="9" height="10.5" rx="4.5" /><path d="M12 8V5.4" /><path d="M9.6 6.1 8.2 4.7M14.4 6.1l1.4-1.4" /><path d="M7.5 11H4.5M16.5 11h3M7.3 14.5H4M16.7 14.5H20M7.7 17.8 5.6 19.9M16.3 17.8l2.1 2.1" /></Icon>;
}

/* Communication / web */
export function Mail(p: NothoIconProps) {
  return <Icon {...p}><rect x="3" y="5" width="18" height="14" rx="2.6" /><path d="M4 7.2l8 5.4 8-5.4" /></Icon>;
}
export function MessageSquare(p: NothoIconProps) {
  return <Icon {...p}><path d="M5 5h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H9.5L5.5 19.2V16H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z" /></Icon>;
}
export function Share2(p: NothoIconProps) {
  return <Icon {...p}><circle cx="6" cy="12" r="2.6" /><circle cx="17.5" cy="6" r="2.6" /><circle cx="17.5" cy="18" r="2.6" /><path d="M8.3 10.8 15.2 7.2M8.3 13.2l6.9 3.6" /></Icon>;
}
export function Link2(p: NothoIconProps) {
  return <Icon {...p}><path d="M9 12h6" /><path d="M10.5 7.5H8a4.5 4.5 0 0 0 0 9h2.5" /><path d="M13.5 7.5H16a4.5 4.5 0 0 1 0 9h-2.5" /></Icon>;
}
export function ExternalLink(p: NothoIconProps) {
  return <Icon {...p}><path d="M14 4h6v6" /><path d="M20 4l-9 9" /><path d="M18 13.5V18a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4.5" /></Icon>;
}
export function Copy(p: NothoIconProps) {
  return <Icon {...p}><rect x="8.5" y="8.5" width="11" height="11" rx="2.4" /><path d="M5.5 15.5H5A1.5 1.5 0 0 1 3.5 14V5A1.5 1.5 0 0 1 5 3.5h9A1.5 1.5 0 0 1 15.5 5v.5" /></Icon>;
}
export function ClipboardCopy(p: NothoIconProps) {
  return <Icon {...p}><rect x="5" y="5" width="14" height="16" rx="2.4" /><path d="M9 5V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1" /><path d="M9 12h6M9 15.5h4" /></Icon>;
}

/* Account / system */
export function Lock(p: NothoIconProps) {
  return <Icon {...p}><rect x="5" y="10.5" width="14" height="9.5" rx="2.4" /><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" /><circle cx="12" cy="15" r="1.1" fill="currentColor" stroke="none" /></Icon>;
}
export function KeyRound(p: NothoIconProps) {
  return <Icon {...p}><circle cx="8" cy="8" r="4.5" /><path d="M11.2 11.2 19 19M16 16l2-2M19 19l1.4-1.4" /></Icon>;
}
export function LogOut(p: NothoIconProps) {
  return <Icon {...p}><path d="M14 4H6.5A1.5 1.5 0 0 0 5 5.5v13A1.5 1.5 0 0 0 6.5 20H14" /><path d="M17 8l4 4-4 4M21 12H10" /></Icon>;
}
export function Settings(p: NothoIconProps) {
  return <Icon {...p}><path d="M4 7h9M17 7h3" /><circle cx="15" cy="7" r="2.2" /><path d="M4 14h2M11 14h9" /><circle cx="8" cy="14" r="2.2" /></Icon>;
}
export function Search(p: NothoIconProps) {
  return <Icon {...p}><circle cx="11" cy="11" r="6.5" /><path d="M20 20l-4.2-4.2" /></Icon>;
}
export function RefreshCcw(p: NothoIconProps) {
  return <Icon {...p}><path d="M4 5.5v4h4" /><path d="M4.6 11.8A7.5 7.5 0 0 1 17 7.1L20 9.5" /><path d="M20 18.5v-4h-4" /><path d="M19.4 12.2A7.5 7.5 0 0 1 7 16.9L4 14.5" /></Icon>;
}
export function Trash2(p: NothoIconProps) {
  return <Icon {...p}><path d="M4.5 6.5h15" /><path d="M9 6.5V5a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 5v1.5" /><path d="M6.6 6.5 7.4 19a1.6 1.6 0 0 0 1.6 1.5h6a1.6 1.6 0 0 0 1.6-1.5l.8-12.5" /><path d="M10 10.5v6M14 10.5v6" opacity="0.7" /></Icon>;
}
export function Moon(p: NothoIconProps) {
  return <Icon {...p}><path d="M20 14.6A8 8 0 1 1 9.4 4 6.5 6.5 0 0 0 20 14.6z" /><circle cx="15" cy="9" r="0.7" fill="currentColor" stroke="none" /></Icon>;
}
export function Sun(p: NothoIconProps) {
  return <Icon {...p}><circle cx="12" cy="12" r="4" /><path d="M12 2.4v2.2M12 19.4v2.2M21.6 12h-2.2M4.6 12H2.4M18.8 5.2 17.2 6.8M6.8 17.2 5.2 18.8M18.8 18.8 17.2 17.2M6.8 6.8 5.2 5.2" /></Icon>;
}

/* Objects */
export function PiggyBank(p: NothoIconProps) {
  return <Icon {...p}><path d="M3.8 12.6c0-3 2.7-5.2 6.2-5.2h3.5c1.3 0 2.5.4 3.4 1.2l2.3-.7-.6 2.2c.7.8 1.1 1.7 1.1 2.8v2.6c0 .6-.5 1.1-1.1 1.1h-.9l-.6 1.9h-2.1l-.4-1.5h-3.1L11 20.4H8.9l-.5-1.9a5 5 0 0 1-2.3-2.4H4.5c-.6 0-1.1-.5-1.1-1.1z" /><circle cx="15.4" cy="12.2" r="0.9" fill="currentColor" stroke="none" /></Icon>;
}
export function Car(p: NothoIconProps) {
  return <Icon {...p}><path d="M4 13.8l1.6-4.5C5.9 8.6 6.6 8 7.5 8h9c.9 0 1.7.6 1.9 1.4L20 13.8" /><rect x="3" y="13.5" width="18" height="4.2" rx="1.4" /><circle cx="7.5" cy="17.8" r="1.4" fill="currentColor" stroke="none" /><circle cx="16.5" cy="17.8" r="1.4" fill="currentColor" stroke="none" /></Icon>;
}
export function Tv(p: NothoIconProps) {
  return <Icon {...p}><rect x="3" y="6.5" width="18" height="12" rx="2.4" /><path d="M8 3l4 3 4-3" /></Icon>;
}
export function Smartphone(p: NothoIconProps) {
  return <Icon {...p}><rect x="6.5" y="2.5" width="11" height="19" rx="2.8" /><path d="M10.5 18.5h3" /></Icon>;
}
export function ShoppingCart(p: NothoIconProps) {
  return <Icon {...p}><circle cx="9.5" cy="19" r="1.4" fill="currentColor" stroke="none" /><circle cx="17" cy="19" r="1.4" fill="currentColor" stroke="none" /><path d="M3 4h2l2.2 10.2a1.5 1.5 0 0 0 1.5 1.2h8.1a1.5 1.5 0 0 0 1.5-1.2L20 8H6.2" /></Icon>;
}
export function WifiOff(p: NothoIconProps) {
  return <Icon {...p}><path d="M3.4 4 20.6 20.6" /><path d="M5 9.1A11 11 0 0 1 9 7M19 9.1a11 11 0 0 0-3-1.7" /><path d="M8.2 12.4a6 6 0 0 1 6-1" /><circle cx="12" cy="16.6" r="0.6" fill="currentColor" stroke="none" /></Icon>;
}
export function FileUp(p: NothoIconProps) {
  return <Icon {...p}><path d="M7 3h7l5 5v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" /><path d="M14 3v5h5" /><path d="M12 18.5v-5M9.5 15.5l2.5-2.5 2.5 2.5" /></Icon>;
}
export function Upload(p: NothoIconProps) {
  return <Icon {...p}><path d="M12 16V4.5" /><path d="M7 9.5l5-5 5 5" /><path d="M4 17v1.5A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5V17" /></Icon>;
}
export function GraduationCap(p: NothoIconProps) {
  return <Icon {...p}><path d="M3 9.5 12 5.5l9 4-9 4z" /><path d="M7.5 11.4V15c0 1 2 2.2 4.5 2.2s4.5-1.2 4.5-2.2v-3.6" /><path d="M21 9.7V14" /></Icon>;
}
export function Lightbulb(p: NothoIconProps) {
  return <Icon {...p}><path d="M9 14.4a5 5 0 1 1 6 0c-.7.5-1 1.2-1 2v.4h-4v-.4c0-.8-.3-1.5-1-2z" /><path d="M10 20h4M10.4 18h3.2" /></Icon>;
}
export function BarChart2(p: NothoIconProps) {
  return <Icon {...p}><path d="M6 20V10M12 20V4M18 20v-7" /></Icon>;
}
export function TrendingDown(p: NothoIconProps) {
  return <Icon {...p}><path d="M4 7l6 6 3.5-3.5L20 16" /><path d="M20 11.5V16h-4.5" /></Icon>;
}
export function PenLine(p: NothoIconProps) {
  return <Icon {...p}><path d="M4 20.5h16" /><path d="M14.5 5.3l3.2 3.2L8.2 18 5 18.7 5.7 15.5z" /></Icon>;
}
export function Pencil(p: NothoIconProps) {
  return <Icon {...p}><path d="M16.3 4.5l3.2 3.2" /><path d="M5 19l-1 1 1-4L15.4 5.6a1.6 1.6 0 0 1 2.3 0l.7.7a1.6 1.6 0 0 1 0 2.3L8 19z" /></Icon>;
}
export function Sparkles(p: NothoIconProps) {
  return <Icon {...p}><path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6z" fill="currentColor" stroke="none" /><path d="M18.4 14l.6 1.7 1.7.6-1.7.6-.6 1.7-.6-1.7-1.7-.6 1.7-.6z" fill="currentColor" stroke="none" /></Icon>;
}
export function Target(p: NothoIconProps) {
  return <Icon {...p}><circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="12" r="4.6" opacity="0.55" /><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" /></Icon>;
}
