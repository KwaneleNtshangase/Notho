import React from "react";
import {
  Document,
  Page,
  View,
  Text,
  Image,
  StyleSheet,
  Svg,
  Path,
  Circle,
  Line,
  G,
} from "@react-pdf/renderer";
import { formatZarCurrency } from "@/lib/currency";
import { formatPeriodLabel } from "./period";
import type {
  CategoryGroup,
  ExpenseCategoryRow,
  InsightTone,
  MonthlySpend,
  ReportModel,
} from "./types";

// Brand palette - from the Notho pitch deck (navy / gold / teal).
const C = {
  navy: "#15294B",
  navyDeep: "#0E1C38",
  card: "#1E335A",
  gold: "#E6B84C",
  goldSoft: "#C9A14A",
  teal: "#2AA39A",
  expense: "#E0584E",
  white: "#FFFFFF",
  onNavyMuted: "#9AA7BD",
  text: "#1F2937",
  textMuted: "#6B7280",
  border: "#E6E9EF",
  rowAlt: "#F6F8FB",
  lightBg: "#FFFFFF",
};

const GROUP_META: Record<CategoryGroup, { label: string; color: string }> = {
  needs: { label: "Needs (essentials)", color: "#3B7DD8" },
  wants: { label: "Wants (lifestyle)", color: "#7C4DFF" },
  goals: { label: "Goals (savings & debt payoff)", color: "#00BFA5" },
  business: { label: "Business (side hustle)", color: "#E6B84C" },
  unclassified: { label: "Unclassified", color: "#9E9E9E" },
};

function toneColor(tone: InsightTone): string {
  switch (tone) {
    case "good":
      return C.teal;
    case "warn":
      return C.goldSoft;
    case "bad":
      return C.expense;
    default:
      return C.navy;
  }
}

const styles = StyleSheet.create({
  // Light body pages
  page: {
    paddingTop: 78,
    paddingBottom: 56,
    paddingHorizontal: 40,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: C.text,
  },
  // Cover (navy)
  cover: { fontFamily: "Helvetica", color: C.white, backgroundColor: C.navy, padding: 0 },
  sectionTitle: { fontSize: 13, fontWeight: 700, marginBottom: 10, color: C.navy },
  sectionSub: { fontSize: 8, color: C.textMuted, marginBottom: 8 },

  // Per-page branded header band
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 50,
    backgroundColor: C.navy,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 40,
  },
  headerBrand: { flexDirection: "row", alignItems: "center" },
  headerWordmark: { color: C.white, fontSize: 12, fontWeight: 700, marginLeft: 8 },
  headerTitle: { color: C.gold, fontSize: 10, fontWeight: 700 },
  headerAccent: {
    position: "absolute",
    top: 50,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: C.gold,
  },

  footer: {
    position: "absolute",
    bottom: 22,
    left: 40,
    right: 40,
    fontSize: 8,
    color: C.textMuted,
    textAlign: "center",
    borderTop: `1px solid ${C.border}`,
    paddingTop: 8,
  },

  statCard: {
    flex: 1,
    backgroundColor: C.card,
    borderRadius: 10,
    padding: 12,
    borderLeft: `3px solid ${C.gold}`,
  },
  statLabel: { fontSize: 8, color: C.onNavyMuted, textTransform: "uppercase", marginBottom: 5, letterSpacing: 0.5 },
  statValue: { fontSize: 15, fontWeight: 700 },
  statDelta: { fontSize: 7, marginTop: 4 },

  // Tables
  tableHeader: {
    flexDirection: "row",
    backgroundColor: C.navy,
    paddingVertical: 6,
    paddingHorizontal: 6,
    fontWeight: 700,
    fontSize: 8,
    color: C.white,
    borderRadius: 4,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderBottom: `1px solid ${C.border}`,
    fontSize: 9,
    alignItems: "center",
  },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  toneDot: { width: 6, height: 6, borderRadius: 3, marginRight: 6, marginTop: 3 },

  insightCard: {
    backgroundColor: C.rowAlt,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderLeft: `3px solid ${C.teal}`,
  },
  alertCard: {
    backgroundColor: "#FDF3F2",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    borderLeft: `3px solid ${C.expense}`,
  },
  insightItem: { marginBottom: 5, fontSize: 9 },
  badge: {
    fontSize: 7,
    fontWeight: 700,
    color: C.navy,
    backgroundColor: C.gold,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  actionCard: {
    backgroundColor: C.rowAlt,
    borderRadius: 8,
    padding: 8,
    marginBottom: 6,
    borderLeft: `3px solid ${C.gold}`,
  },
});

function zar(cents: number): string {
  return formatZarCurrency(cents / 100, { decimals: 2 });
}
function zarWhole(cents: number): string {
  return formatZarCurrency(Math.round(cents / 100), { decimals: 0 });
}
function zarSigned(cents: number): string {
  return `${cents < 0 ? "-" : "+"}${zar(Math.abs(cents))}`;
}
function zarShort(cents: number): string {
  const r = cents / 100;
  if (Math.abs(r) >= 1000) return `R${Math.round(r / 1000)}k`;
  return `R${Math.round(r)}`;
}

// ── Branding ───────────────────────────────────────────────────────────────
function Logo({ uri, size }: { uri?: string; size: number }) {
  if (!uri) return null;
  // eslint-disable-next-line jsx-a11y/alt-text -- react-pdf Image has no alt prop
  return <Image src={uri} style={{ width: size, height: size }} />;
}

function PageHeader({ uri, title }: { uri?: string; title: string }) {
  // Each band is its own absolutely-positioned `fixed` element so it anchors to
  // the page's top edge. (A non-positioned wrapper would sit in normal flow and
  // get pushed down by the page's paddingTop, dragging the band over content.)
  return (
    <>
      <View fixed style={styles.header}>
        <View style={styles.headerBrand}>
          <Logo uri={uri} size={26} />
          <Text style={styles.headerWordmark}>Notho</Text>
        </View>
        <Text style={styles.headerTitle}>{title}</Text>
      </View>
      <View fixed style={styles.headerAccent} />
    </>
  );
}

function Footer() {
  return (
    <Text
      style={styles.footer}
      fixed
      render={({ pageNumber, totalPages }) =>
        `Notho · Master Your Money   |   Educational insights based on your own data - not financial advice   |   Page ${pageNumber} of ${totalPages}`
      }
    />
  );
}

/** Small colored bullet + text row, used for highlights / wins / risks. */
function ToneItem({ tone, text, size = 9 }: { tone: InsightTone; text: string; size?: number }) {
  return (
    <View style={{ flexDirection: "row", marginBottom: 5 }}>
      <View style={[styles.toneDot, { backgroundColor: toneColor(tone) }]} />
      <Text style={{ fontSize: size, flex: 1, lineHeight: 1.35 }}>{text}</Text>
    </View>
  );
}

// ── Charts ───────────────────────────────────────────────────────────────
function polarToCartesian(cx: number, cy: number, r: number, angle: number) {
  return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
}
function describeDonutSlice(cx: number, cy: number, outerR: number, innerR: number, a0: number, a1: number): string {
  const so = polarToCartesian(cx, cy, outerR, a0);
  const eo = polarToCartesian(cx, cy, outerR, a1);
  const si = polarToCartesian(cx, cy, innerR, a1);
  const ei = polarToCartesian(cx, cy, innerR, a0);
  const large = a1 - a0 > Math.PI ? 1 : 0;
  return [
    `M ${so.x} ${so.y}`,
    `A ${outerR} ${outerR} 0 ${large} 1 ${eo.x} ${eo.y}`,
    `L ${si.x} ${si.y}`,
    `A ${innerR} ${innerR} 0 ${large} 0 ${ei.x} ${ei.y}`,
    "Z",
  ].join(" ");
}
const SUNBURST_ORDER: CategoryGroup[] = ["needs", "wants", "goals", "business", "unclassified"];

function blendWithWhite(hex: string, f: number): string {
  const n = hex.replace("#", "");
  const ch = (i: number) => parseInt(n.slice(i, i + 2), 16);
  const mix = (v: number) => Math.round(v + (255 - v) * f).toString(16).padStart(2, "0");
  return `#${mix(ch(0))}${mix(ch(2))}${mix(ch(4))}`;
}

/**
 * Outer-ring colors: shades of the parent group's color, so every slice
 * visually belongs to its inner-ring group (category-identity colors made
 * Stokvel/Business/Investments all look green - same dot, different meaning).
 */
function sunburstShades(rows: ExpenseCategoryRow[]): Map<string, string> {
  const map = new Map<string, string>();
  for (const g of SUNBURST_ORDER) {
    const inGroup = rows.filter((r) => r.group === g && r.actualCents > 0).sort((a, b) => b.actualCents - a.actualCents);
    inGroup.forEach((r, i) => {
      map.set(r.categoryId, blendWithWhite(GROUP_META[g].color, Math.min(0.12 + i * 0.16, 0.68)));
    });
  }
  return map;
}

/**
 * Two-ring sunburst: inner ring = needs/wants/goals/business/unclassified
 * groups, outer ring = the categories inside each group. One glance shows
 * both the 50/30/20 picture and what's driving each slice.
 */
function SunburstChart({
  rows,
  groupTotals,
  shades,
  size = 150,
}: {
  rows: ExpenseCategoryRow[];
  groupTotals: Record<CategoryGroup, number>;
  shades: Map<string, string>;
  size?: number;
}) {
  const order = SUNBURST_ORDER;
  const total = order.reduce((s, g) => s + groupTotals[g], 0);
  const cx = size / 2;
  const cy = size / 2;
  const outerR = size / 2 - 2;
  const midR = outerR * 0.62;
  const innerR = outerR * 0.3;
  if (total === 0) {
    return (
      <Svg width={size} height={size}>
        <Path d={describeDonutSlice(cx, cy, outerR, innerR, 0, 2 * Math.PI)} fill={C.border} />
      </Svg>
    );
  }
  const angleAt = (cents: number) => (cents / total) * 2 * Math.PI;
  // Outer ring, per group: keep the meaningful categories as their own slice,
  // but merge everything under 4% into a single "rest of group" slice so the
  // ring isn't a confusing fringe of hair-thin slivers.
  const MIN_SLICE = total * 0.04;
  const outerSlices: { path: string; color: string }[] = [];
  let a = -Math.PI / 2;
  for (const g of order) {
    const inGroup = rows
      .filter((r) => r.group === g && r.actualCents > 0)
      .sort((a, b) => b.actualCents - a.actualCents);
    let restCents = 0;
    for (const r of inGroup) {
      if (r.actualCents >= MIN_SLICE) {
        const a1 = a + angleAt(r.actualCents);
        outerSlices.push({ path: describeDonutSlice(cx, cy, outerR, midR + 1, a, a1), color: shades.get(r.categoryId) ?? r.color });
        a = a1;
      } else {
        restCents += r.actualCents;
      }
    }
    if (restCents > 0) {
      const a1 = a + angleAt(restCents);
      outerSlices.push({ path: describeDonutSlice(cx, cy, outerR, midR + 1, a, a1), color: blendWithWhite(GROUP_META[g].color, 0.72) });
      a = a1;
    }
  }
  const innerSlices: { path: string; color: string }[] = [];
  a = -Math.PI / 2;
  for (const g of order) {
    if (groupTotals[g] <= 0) continue;
    const a1 = a + angleAt(groupTotals[g]);
    innerSlices.push({ path: describeDonutSlice(cx, cy, midR - 1, innerR, a, a1), color: GROUP_META[g].color });
    a = a1;
  }
  return (
    <View style={{ width: size, height: size, position: "relative" }}>
      <Svg width={size} height={size}>
        <G>
          {/* white separators between slices make the boundaries legible */}
          {innerSlices.map((s, i) => (
            <Path key={`i${i}`} d={s.path} fill={s.color} stroke={C.white} strokeWidth={0.8} />
          ))}
          {outerSlices.map((s, i) => (
            <Path key={`o${i}`} d={s.path} fill={s.color} stroke={C.white} strokeWidth={0.8} />
          ))}
        </G>
      </Svg>
      <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ fontSize: 7, color: C.textMuted }}>Spent</Text>
        <Text style={{ fontSize: 11, fontWeight: 700, color: C.navy }}>{zarShort(total)}</Text>
      </View>
    </View>
  );
}

/**
 * Income vs Expenses line chart. Partial months are drawn with dashed
 * connectors and hollow points so a mid-month cut-off never reads as a
 * "spending collapsed" trend.
 */
function LineChart({ data, width = 515, height = 150 }: { data: MonthlySpend[]; width?: number; height?: number }) {
  const leftPad = 42;
  const plotW = width - leftPad - 8;
  const plotH = height;
  const max = Math.max(...data.flatMap((d) => [d.incomeCents, d.expenseCents]), 1);
  const n = data.length;
  const xAt = (i: number) => (n <= 1 ? plotW / 2 : (i / (n - 1)) * plotW);
  const yAt = (v: number) => plotH - (v / max) * plotH;
  const hasPartial = data.some((d) => d.isPartial);

  const series: { key: "incomeCents" | "expenseCents"; color: string }[] = [
    { key: "expenseCents", color: C.expense },
    { key: "incomeCents", color: C.teal },
  ];

  return (
    <View>
      {/* legend */}
      <View style={{ flexDirection: "row", marginBottom: 6, gap: 16 }}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View style={{ width: 12, height: 3, backgroundColor: C.teal, marginRight: 5 }} />
          <Text style={{ fontSize: 8, color: C.textMuted }}>Income</Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View style={{ width: 12, height: 3, backgroundColor: C.expense, marginRight: 5 }} />
          <Text style={{ fontSize: 8, color: C.textMuted }}>Expenses</Text>
        </View>
        {hasPartial && (
          <Text style={{ fontSize: 8, color: C.textMuted }}>Dashed = partial month</Text>
        )}
      </View>
      <View style={{ flexDirection: "row" }}>
        <View style={{ width: leftPad, height: plotH, justifyContent: "space-between", paddingRight: 6 }}>
          <Text style={{ fontSize: 7, color: C.textMuted, textAlign: "right" }}>{zarShort(max)}</Text>
          <Text style={{ fontSize: 7, color: C.textMuted, textAlign: "right" }}>{zarShort(max / 2)}</Text>
          <Text style={{ fontSize: 7, color: C.textMuted, textAlign: "right" }}>R0</Text>
        </View>
        <Svg width={plotW} height={plotH}>
          {/* gridlines */}
          <Line x1={0} y1={0} x2={plotW} y2={0} stroke={C.border} strokeWidth={1} />
          <Line x1={0} y1={plotH / 2} x2={plotW} y2={plotH / 2} stroke={C.border} strokeWidth={1} />
          <Line x1={0} y1={plotH - 1} x2={plotW} y2={plotH - 1} stroke={C.border} strokeWidth={1} />
          {series.map((s) => (
            <G key={s.key}>
              {data.slice(1).map((d, i) => {
                const prev = data[i];
                const dashed = d.isPartial || prev.isPartial;
                return (
                  <Line
                    key={i}
                    x1={xAt(i)}
                    y1={yAt(prev[s.key])}
                    x2={xAt(i + 1)}
                    y2={yAt(d[s.key])}
                    stroke={s.color}
                    strokeWidth={1.6}
                    strokeDasharray={dashed ? "3 3" : undefined}
                  />
                );
              })}
              {data.map((d, i) =>
                d.isPartial ? (
                  <Circle key={i} cx={xAt(i)} cy={yAt(d[s.key])} r={2.4} fill={C.white} stroke={s.color} strokeWidth={1.2} />
                ) : (
                  <Circle key={i} cx={xAt(i)} cy={yAt(d[s.key])} r={2} fill={s.color} />
                )
              )}
            </G>
          ))}
        </Svg>
      </View>
      <View style={{ flexDirection: "row", paddingLeft: leftPad, marginTop: 4 }}>
        {data.map((d, i) => (
          <Text key={i} style={{ fontSize: 7, color: C.textMuted, width: plotW / Math.max(n, 1), textAlign: "center" }}>
            {d.isPartial ? `${d.label}*` : d.label}
          </Text>
        ))}
      </View>
      {hasPartial && (
        <Text style={{ fontSize: 7, color: C.textMuted, marginTop: 3, paddingLeft: leftPad }}>
          {`* ${data
            .filter((d) => d.isPartial)
            .map((d) => `${d.label}: ${d.daysCovered} of ${d.daysInMonth} days`)
            .join(" · ")} - shown for reference, not a trend.`}
        </Text>
      )}
    </View>
  );
}

/** Single stacked bar: needs / wants / goals / business / unclassified. */
function GroupBar({ totals, totalCents }: { totals: Record<CategoryGroup, number>; totalCents: number }) {
  const order: CategoryGroup[] = ["needs", "wants", "goals", "business", "unclassified"];
  if (totalCents <= 0) return null;
  return (
    <View>
      <View style={{ flexDirection: "row", height: 14, borderRadius: 3, overflow: "hidden", marginBottom: 6 }}>
        {order.map((g) =>
          totals[g] > 0 ? (
            <View key={g} style={{ width: `${(totals[g] / totalCents) * 100}%`, backgroundColor: GROUP_META[g].color }} />
          ) : null
        )}
      </View>
      {/* Single-line legend so it can never orphan onto the next page. */}
      <View style={{ flexDirection: "row", alignItems: "center", flexWrap: "wrap" }}>
        {order
          .filter((g) => totals[g] > 0)
          .map((g, i, arr) => (
            <View key={g} style={{ flexDirection: "row", alignItems: "center" }}>
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: GROUP_META[g].color, marginRight: 3 }} />
              <Text style={{ fontSize: 7, color: C.textMuted }}>
                {GROUP_META[g].label.split(" (")[0]} {zarWhole(totals[g])} ({Math.round((totals[g] / totalCents) * 100)}%)
                {i < arr.length - 1 ? "   " : ""}
              </Text>
            </View>
          ))}
      </View>
    </View>
  );
}

/** Cover health score card: big number, band, score bar, component chips. */
function HealthScoreCard({ model }: { model: ReportModel }) {
  const { healthScore, healthBand, healthComponents } = model.insights;
  const bandColor = healthScore >= 60 ? C.teal : healthScore >= 40 ? C.gold : C.expense;
  return (
    <View style={{ backgroundColor: C.card, borderRadius: 10, padding: 14, borderLeft: `3px solid ${bandColor}`, marginBottom: 12 }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <View>
          <Text style={styles.statLabel}>Financial health</Text>
          <View style={{ flexDirection: "row", alignItems: "flex-end" }}>
            <Text style={{ fontSize: 28, fontWeight: 700, color: bandColor }}>{healthScore}</Text>
            <Text style={{ fontSize: 11, color: C.onNavyMuted, marginBottom: 3, marginLeft: 3 }}>/100</Text>
          </View>
        </View>
        <Text style={{ fontSize: 14, fontWeight: 700, color: bandColor }}>{healthBand}</Text>
      </View>
      <View style={{ height: 6, backgroundColor: C.navyDeep, borderRadius: 3, marginBottom: 10 }}>
        <View style={{ width: `${healthScore}%`, height: 6, backgroundColor: bandColor, borderRadius: 3 }} />
      </View>
      {healthComponents.map((c) => (
        <View key={c.label} style={{ flexDirection: "row", alignItems: "center", marginBottom: 3 }}>
          <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: toneColor(c.tone), marginRight: 5 }} />
          <Text style={{ fontSize: 7.5, color: C.white, width: 108 }}>
            {c.label} {c.score}/{c.max}
          </Text>
          <Text style={{ fontSize: 7, color: C.onNavyMuted, flex: 1 }}>{c.note}</Text>
        </View>
      ))}
      {model.insights.healthCapNote && (
        <Text style={{ fontSize: 7, color: C.gold, marginTop: 6, lineHeight: 1.35 }}>
          {model.insights.healthCapNote}
        </Text>
      )}
    </View>
  );
}

function DeltaText({ deltaPct, goodWhenUp }: { deltaPct: number | null; goodWhenUp: boolean }) {
  if (deltaPct == null) return null;
  const up = deltaPct >= 0;
  const good = up === goodWhenUp;
  return (
    <Text style={[styles.statDelta, { color: good ? C.teal : C.expense }]}>
      {up ? "+" : ""}
      {deltaPct}% vs previous period
    </Text>
  );
}

function ExpenseTable({
  rows,
  positiveIsGood = false,
}: {
  rows: ExpenseCategoryRow[];
  /** For savings vehicles: contributing MORE than planned is good (teal). */
  positiveIsGood?: boolean;
}) {
  if (rows.length === 0) return <Text style={{ fontSize: 9, color: C.textMuted }}>No expense data for this period.</Text>;
  const varColor = (r: ExpenseCategoryRow) => {
    if (!r.hasBudget) return C.textMuted;
    if (positiveIsGood) return r.varianceCents >= 0 ? C.teal : C.goldSoft;
    if (r.overBudget) return C.expense;
    return r.varianceCents < 0 ? C.teal : C.textMuted;
  };
  return (
    <View>
      <View style={styles.tableHeader}>
        <Text style={{ width: "28%" }}>Category</Text>
        <Text style={{ width: "16%", textAlign: "right" }}>Budgeted</Text>
        <Text style={{ width: "16%", textAlign: "right" }}>Actual</Text>
        <Text style={{ width: "16%", textAlign: "right" }}>Variance</Text>
        <Text style={{ width: "12%", textAlign: "right" }}>Var %</Text>
        <Text style={{ width: "12%", textAlign: "right" }}>Share</Text>
      </View>
      {rows.map((r, idx) => (
        <View key={r.categoryId} style={[styles.tableRow, idx % 2 === 1 ? { backgroundColor: C.rowAlt } : {}]}>
          <View style={{ width: "28%", flexDirection: "row", alignItems: "center" }}>
            <View style={[styles.dot, { backgroundColor: r.color }]} />
            <Text>{r.categoryName}</Text>
          </View>
          {r.hasBudget ? (
            <Text style={{ width: "16%", textAlign: "right" }}>{zar(r.budgetedCents)}</Text>
          ) : (
            <Text style={{ width: "16%", textAlign: "right", fontSize: 7, color: C.textMuted }}>No budget</Text>
          )}
          <Text style={{ width: "16%", textAlign: "right" }}>{zar(r.actualCents)}</Text>
          <Text style={{ width: "16%", textAlign: "right", color: varColor(r) }}>
            {r.hasBudget ? zarSigned(r.varianceCents) : "-"}
          </Text>
          <Text style={{ width: "12%", textAlign: "right", color: varColor(r) }}>
            {r.variancePct != null ? `${r.variancePct}%` : "-"}
          </Text>
          <Text style={{ width: "12%", textAlign: "right" }}>{r.sharePct}%</Text>
        </View>
      ))}
    </View>
  );
}

function MonthTable({ months }: { months: MonthlySpend[] }) {
  const anySetAside = months.some((m) => m.setAsideCents > 0);
  // Columns reconcile: Income - Day-to-day - Set aside = Net. The Day-to-day
  // column matches the headline "day-to-day spending" basis exactly.
  const w = anySetAside
    ? { month: "24%", inc: "19%", day: "19%", set: "17%", net: "21%" }
    : { month: "26%", inc: "24%", day: "24%", set: "0%", net: "26%" };
  return (
    <View>
      <View style={styles.tableHeader}>
        <Text style={{ width: w.month }}>Month</Text>
        <Text style={{ width: w.inc, textAlign: "right" }}>Income</Text>
        <Text style={{ width: w.day, textAlign: "right" }}>Day-to-day</Text>
        {anySetAside && <Text style={{ width: w.set, textAlign: "right" }}>Set aside</Text>}
        <Text style={{ width: w.net, textAlign: "right" }}>Net</Text>
      </View>
      {months.map((m, idx) => (
        <View key={m.monthYear} style={[styles.tableRow, idx % 2 === 1 ? { backgroundColor: C.rowAlt } : {}]}>
          <View style={{ width: w.month, flexDirection: "row", alignItems: "center" }}>
            <View style={[styles.dot, { width: 7, height: 7, backgroundColor: m.netCents >= 0 ? C.teal : C.expense }]} />
            <Text>
              {m.label} {m.monthYear.slice(0, 4)}
              {m.isPartial ? ` (1-${m.daysCovered})` : ""}
            </Text>
          </View>
          <Text style={{ width: w.inc, textAlign: "right" }}>{zarWhole(m.incomeCents)}</Text>
          <Text style={{ width: w.day, textAlign: "right" }}>{zarWhole(m.consumptionCents)}</Text>
          {anySetAside && (
            <Text style={{ width: w.set, textAlign: "right", color: C.gold }}>{zarWhole(m.setAsideCents)}</Text>
          )}
          <Text style={{ width: w.net, textAlign: "right", fontWeight: 700, color: m.netCents >= 0 ? C.teal : C.expense }}>
            {zarSigned(m.netCents)}
          </Text>
        </View>
      ))}
    </View>
  );
}

export function BudgetReportDocument({
  model,
  logoDataUri,
  redactedCount = 0,
}: {
  model: ReportModel;
  logoDataUri?: string;
  /** How many counterparties the caller masked before passing the model in.
   *  Drives the footnote under the merchant tables - a reader who sees
   *  "Housing · person A" should be told that is a deliberate mask, not a
   *  parsing failure. Zero means nothing was hidden and no note is shown. */
  redactedCount?: number;
}) {
  const periodLabel = formatPeriodLabel(model.periodStart, model.periodEnd);
  const generated = new Date(model.generatedAt).toLocaleString("en-ZA", {
    timeZone: "Africa/Johannesburg",
    dateStyle: "medium",
    timeStyle: "short",
  });
  const ins = model.insights;

  const consumptionRows = model.expenseCategories.filter((r) => !r.isSavingsVehicle && r.actualCents > 0);
  const setAsideRows = model.expenseCategories.filter((r) => r.isSavingsVehicle && r.actualCents > 0);
  const burstShades = sunburstShades(model.expenseCategories);
  // One-line story for the sunburst: biggest group + what drives it.
  const topGroup = SUNBURST_ORDER.filter((g) => model.groupTotals[g] > 0).sort(
    (a, b) => model.groupTotals[b] - model.groupTotals[a]
  )[0];
  const topGroupRow = topGroup
    ? model.expenseCategories
        .filter((r) => r.group === topGroup && r.actualCents > 0)
        .sort((a, b) => b.actualCents - a.actualCents)[0]
    : undefined;
  const topGroupPct =
    topGroup && model.totalExpenseCents > 0
      ? Math.round((model.groupTotals[topGroup] / model.totalExpenseCents) * 100)
      : 0;
  const topGroupUnbudgeted =
    topGroup && !["unclassified"].includes(topGroup)
      ? model.expenseCategories
          .filter((r) => r.group === topGroup && r.actualCents > 0 && !r.hasBudget && !r.isSavingsVehicle)
          .reduce((s, r) => s + r.actualCents, 0)
      : 0;
  // A real insight, not a restated legend: flag when the dominant slice is
  // unclassified (blind), business (skews personal ratios), or a big
  // unbudgeted block (running unmanaged).
  const sunburstStory: { tone: InsightTone; text: string } | null = (() => {
    if (!topGroup || !topGroupRow || model.totalExpenseCents <= 0) return null;
    if (topGroup === "unclassified") {
      return {
        tone: "bad",
        text: `The biggest slice (${topGroupPct}%) is unclassified - until it's categorised, this chart can't tell you where that money really went.`,
      };
    }
    if (topGroup === "business") {
      return {
        tone: "info",
        text: `Business is ${topGroupPct}% of all outflows (${zarWhole(model.groupTotals.business)}). If these are side-hustle costs that earn income, they're closer to investment than lifestyle spending - the personal ratios below exclude them.`,
      };
    }
    if (topGroupUnbudgeted >= model.groupTotals[topGroup] * 0.7 && topGroupUnbudgeted > 100000) {
      return {
        tone: "warn",
        text: `${GROUP_META[topGroup].label.split(" (")[0]} is your biggest area at ${topGroupPct}% (${zarWhole(model.groupTotals[topGroup])}) - and mostly unbudgeted, so it isn't being actively managed.`,
      };
    }
    return {
      tone: "info",
      text: `${GROUP_META[topGroup].label.split(" (")[0]} took the biggest share at ${topGroupPct}%, led by ${topGroupRow.categoryName} (${zarWhole(topGroupRow.actualCents)}).`,
    };
  })();

  // Day-to-day only: a stokvel/savings contribution above plan is extra money
  // set aside, not an overspend - it must never appear in this list.
  const overspendSorted = [...model.expenseCategories]
    .filter((r) => r.hasBudget && !r.isSavingsVehicle)
    .sort((a, b) => b.varianceCents - a.varianceCents);

  const unbudgetedCount = model.expenseCategories.filter(
    (r) => !r.hasBudget && !r.isSavingsVehicle && r.actualCents > 0
  ).length;
  const recurringNames = new Set(model.recurringCommitments.map((r) => r.description));
  const totalRecurringMonthly = model.recurringCommitments.reduce((s, r) => s + r.typicalCents, 0);

  return (
    <Document title="Notho - Budget Report" author="Notho">
      {/* ── Page 1 - Cover: verdict first ─────────────────────────────── */}
      <Page size="A4" style={styles.cover}>
        {logoDataUri && (
          // eslint-disable-next-line jsx-a11y/alt-text -- react-pdf Image has no alt prop
          <Image
            src={logoDataUri}
            style={{ position: "absolute", width: 320, height: 320, bottom: -40, right: -50, opacity: 0.06 }}
          />
        )}
        <View style={{ height: 6, backgroundColor: C.gold }} />
        <View style={{ paddingHorizontal: 48, paddingTop: 40 }}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 28 }}>
            <Logo uri={logoDataUri} size={42} />
            <View style={{ marginLeft: 10 }}>
              <Text style={{ fontSize: 17, fontWeight: 700, color: C.white }}>Notho</Text>
              <Text style={{ fontSize: 9, color: C.teal, fontWeight: 700 }}>Master Your Money</Text>
            </View>
          </View>

          <Text style={{ fontSize: 12, color: C.gold, fontWeight: 700, letterSpacing: 1, marginBottom: 6 }}>
            BUDGET REPORT
          </Text>
          <Text style={{ fontSize: 26, fontWeight: 700, color: C.white, marginBottom: 10 }}>{periodLabel}</Text>
          <Text style={{ fontSize: 10, color: C.onNavyMuted }}>
            Prepared for <Text style={{ color: C.teal, fontWeight: 700 }}>{model.displayName}</Text> · Generated {generated} (SAST)
          </Text>

          {/* One-line verdict - answers "how did I do?" before any number. */}
          <Text style={{ fontSize: 13, color: C.white, fontWeight: 700, lineHeight: 1.4, marginTop: 18 }}>
            {ins.verdict}
          </Text>

          <View style={{ marginTop: 16 }}>
            <HealthScoreCard model={model} />
          </View>

          <View style={{ flexDirection: "row", gap: 10, marginBottom: 10 }}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Income</Text>
              <Text style={[styles.statValue, { color: C.teal }]}>{zar(model.totalIncomeCents)}</Text>
              <DeltaText deltaPct={model.comparison?.incomeDeltaPct ?? null} goodWhenUp={true} />
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Day-to-day spending</Text>
              <Text style={[styles.statValue, { color: C.expense }]}>{zar(model.consumptionCents)}</Text>
              <DeltaText deltaPct={model.comparison?.expenseDeltaPct ?? null} goodWhenUp={false} />
            </View>
          </View>
          <View style={{ flexDirection: "row", gap: 10, marginBottom: 18 }}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Set aside (savings & stokvel)</Text>
              <Text style={[styles.statValue, { color: C.gold }]}>{zar(model.setAsideCents)}</Text>
              <Text style={styles.statDelta}>
                <Text style={{ color: C.onNavyMuted }}>{model.savingsRatePct}% of income · guideline 20%</Text>
              </Text>
            </View>
            {(() => {
              // Reframe: a shortfall caused purely by saving more than the
              // surplus is an allocation choice, not overspending - show it in
              // gold (neutral) with context, not alarm red.
              const afterLiving = model.totalIncomeCents - model.consumptionCents;
              const allocationDeficit = model.netCents < 0 && afterLiving >= 0;
              const label = model.netCents >= 0 ? "Surplus" : allocationDeficit ? "After saving" : "Shortfall";
              const color = model.netCents >= 0 ? C.teal : allocationDeficit ? C.gold : C.expense;
              return (
                <View style={styles.statCard}>
                  <Text style={styles.statLabel}>{label}</Text>
                  <Text style={[styles.statValue, { color }]}>
                    {model.netCents >= 0 ? "+" : ""}
                    {zar(model.netCents)}
                  </Text>
                  {allocationDeficit && (
                    <Text style={[styles.statDelta, { color: C.onNavyMuted }]}>from saving, not overspending</Text>
                  )}
                </View>
              );
            })()}
          </View>
          {model.comparison && (
            <Text style={{ fontSize: 7, color: C.onNavyMuted, marginTop: -12, marginBottom: 14 }}>
              Previous period = {formatPeriodLabel(model.comparison.prevStart, model.comparison.prevEnd)} (the equal-length window before this one).
            </Text>
          )}

          {ins.highlights.length > 0 && (
            <View style={{ backgroundColor: C.card, borderRadius: 10, padding: 14, borderLeft: `3px solid ${C.teal}` }}>
              <Text style={[styles.statLabel, { marginBottom: 8 }]}>At a glance</Text>
              {ins.highlights.map((h, i) => (
                <View key={i} style={{ flexDirection: "row", marginBottom: 5 }}>
                  <View style={[styles.toneDot, { backgroundColor: toneColor(h.tone) }]} />
                  <Text style={{ fontSize: 9, color: C.white, flex: 1, lineHeight: 1.35 }}>{h.text}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </Page>

      {/* ── Page 2 - Cosmo: what happened & what to do ───────────── */}
      <Page size="A4" style={styles.page}>
        <PageHeader uri={logoDataUri} title="What Cosmo noticed" />
        <Text style={styles.sectionTitle}>What your money did</Text>
        <View style={styles.insightCard}>
          {ins.coachParagraphs.map((p, i) => (
            <Text key={i} style={{ fontSize: 9.5, lineHeight: 1.45, marginBottom: i < ins.coachParagraphs.length - 1 ? 7 : 0 }}>
              {p}
            </Text>
          ))}
        </View>

        {ins.dataQualityAlert && (
          <View style={styles.alertCard}>
            <Text style={{ fontSize: 8, fontWeight: 700, color: C.expense, marginBottom: 4, textTransform: "uppercase" }}>
              Data quality alert
            </Text>
            <Text style={{ fontSize: 9, lineHeight: 1.4 }}>{ins.dataQualityAlert}</Text>
          </View>
        )}

        <View style={{ flexDirection: "row", gap: 12, marginBottom: 10 }}>
          <View style={{ flex: 1 }}>
            <Text style={styles.sectionTitle}>Wins</Text>
            {ins.wins.length === 0 ? (
              <Text style={{ fontSize: 9, color: C.textMuted }}>None recorded this period.</Text>
            ) : (
              ins.wins.map((w, i) => <ToneItem key={i} tone="good" text={w} />)
            )}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.sectionTitle}>Risks</Text>
            {ins.risks.length === 0 ? (
              <Text style={{ fontSize: 9, color: C.textMuted }}>Nothing flagged - keep it up.</Text>
            ) : (
              ins.risks.map((r, i) => <ToneItem key={i} tone="bad" text={r} />)
            )}
          </View>
        </View>

        <Text style={styles.sectionTitle}>Your next moves</Text>
        {ins.actions.map((a, i) => (
          <View key={i} style={[styles.actionCard, a.isTopPriority ? { borderLeft: `3px solid ${C.expense}` } : {}]}>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 3 }}>
              <Text style={{ fontSize: 9.5, fontWeight: 700, flex: 1 }}>
                {i + 1}. {a.title}
              </Text>
              {a.isTopPriority && (
                <Text
                  style={{
                    fontSize: 6.5,
                    fontWeight: 700,
                    color: C.white,
                    backgroundColor: C.expense,
                    paddingHorizontal: 5,
                    paddingVertical: 2,
                    borderRadius: 3,
                  }}
                >
                  DO THIS FIRST
                </Text>
              )}
            </View>
            <Text style={{ fontSize: 8.5, lineHeight: 1.4, color: C.text }}>{a.detail}</Text>
            {(a.impact || a.lesson) && (
              <View style={{ flexDirection: "row", marginTop: 4, gap: 10, flexWrap: "wrap" }}>
                {a.impact && (
                  <Text style={{ fontSize: 7.5, fontWeight: 700, color: C.teal }}>Impact: {a.impact}</Text>
                )}
                {a.lesson && (
                  <Text style={{ fontSize: 7.5, color: C.textMuted }}>{`In the app: "${a.lesson.title}" lesson`}</Text>
                )}
              </View>
            )}
          </View>
        ))}

        <Footer />
      </Page>

      {/* ── Page 3 - Monthly performance ──────────────────────────────── */}
      <Page size="A4" style={styles.page}>
        <PageHeader uri={logoDataUri} title="Monthly performance" />
        <Text style={styles.sectionTitle}>Budget vs actual (day-to-day, like-for-like)</Text>
        <Text style={styles.sectionSub}>
          Only day-to-day categories with a budget are compared here. Savings-vehicle contributions have their own plan below - putting more than planned into a stokvel is not overspending.
        </Text>
        {model.budgetIsEstimate && <Text style={styles.badge}>Budget figures prorated for the partial month - estimate</Text>}
        {model.dayToDayBudgetedCents > 0 ? (
          <View
            style={{
              flexDirection: "row",
              backgroundColor: C.rowAlt,
              borderRadius: 8,
              padding: 14,
              marginBottom: 8,
              justifyContent: "space-between",
            }}
          >
            {[
              { label: "Budgeted", value: zar(model.dayToDayBudgetedCents), color: C.text },
              { label: "Spent (budgeted cats)", value: zar(model.budgetedActualCents), color: C.expense },
              {
                label: "Variance",
                value: zarSigned(model.budgetVarianceCents),
                color: model.budgetVarianceCents > 0 ? C.expense : C.teal,
              },
              { label: "% used", value: model.budgetUsedPct != null ? `${model.budgetUsedPct}%` : "-", color: C.navy },
            ].map((c) => (
              <View key={c.label}>
                <Text style={{ fontSize: 8, color: C.textMuted, textTransform: "uppercase", marginBottom: 4 }}>{c.label}</Text>
                <Text style={{ fontSize: 13, fontWeight: 700, color: c.color }}>{c.value}</Text>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.insightCard}>
            <Text style={{ fontSize: 9 }}>
              {"No budgets are set yet, so there's nothing to compare against. Setting one limit per category turns this page into your monthly scoreboard."}
            </Text>
          </View>
        )}
        {model.unbudgetedActualCents > 0 && model.dayToDayBudgetedCents > 0 && (
          <ToneItem
            tone={model.unbudgetedActualCents > model.budgetedActualCents ? "bad" : "warn"}
            size={8.5}
            text={`Reality check: budgets only manage ${zarWhole(model.budgetedActualCents)} of your ${zarWhole(model.consumptionCents)} day-to-day spending (${Math.round((model.budgetedActualCents / Math.max(model.consumptionCents, 1)) * 100)}%). ${zarWhole(model.unbudgetedActualCents)} across ${unbudgetedCount} ${unbudgetedCount === 1 ? "category" : "categories"} runs outside any budget - staying "under budget" says nothing about that money.`}
          />
        )}
        {model.setAsidePlannedCents > 0 && (
          <Text style={{ fontSize: 8, color: C.textMuted, marginBottom: 12 }}>
            Set-aside plan: {zar(model.setAsidePlannedCents)} planned into savings vehicles · {zar(model.setAsideCents)} actually set aside
            {model.setAsideCents >= model.setAsidePlannedCents ? " - plan beaten." : "."}
          </Text>
        )}

        {overspendSorted.filter((r) => r.varianceCents > 0).length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Where the overspend came from</Text>
            <View style={{ marginBottom: 14 }}>
              {overspendSorted
                .filter((r) => r.varianceCents > 0)
                .slice(0, 4)
                .map((r) => (
                  <ToneItem
                    key={r.categoryId}
                    tone="bad"
                    text={`${r.categoryName}: ${zarSigned(r.varianceCents)} (${r.variancePct}% of budget used)`}
                  />
                ))}
            </View>
          </>
        )}

        {model.monthlySpend.length >= 2 && (
          <>
            <Text style={styles.sectionTitle}>Income vs expenses over time</Text>
            <View style={{ marginBottom: 16 }}>
              <LineChart data={model.monthlySpend} />
            </View>
          </>
        )}

        <Text style={styles.sectionTitle}>Month by month</Text>
        <MonthTable months={model.monthlySpend} />
        {model.projection.annualisedExpenseCents != null && model.projection.monthsUsed >= 2 && (
          <Text style={{ fontSize: 8, color: C.textMuted, marginTop: 8 }}>
            Average over {model.projection.monthsUsed} complete months: {zarWhole(model.projection.avgMonthlyExpenseCents!)}/month
            - roughly {zarWhole(model.projection.annualisedExpenseCents)} a year at this pace.
          </Text>
        )}
        <Footer />
      </Page>

      {/* ── Page 4 - Where the money went ─────────────────────────────── */}
      <Page size="A4" style={styles.page}>
        <PageHeader uri={logoDataUri} title="Where the money went" />
        <Text style={styles.sectionTitle}>Needs, wants & goals</Text>
        <Text style={styles.sectionSub}>
          The 50/30/20 guideline: about half on needs, under a third on wants, the rest to savings and debt payoff.
        </Text>
        <View style={{ marginBottom: 14 }}>
          <GroupBar totals={model.groupTotals} totalCents={model.totalExpenseCents} />
        </View>

        <Text style={styles.sectionTitle}>Where every rand went</Text>
        <Text style={styles.sectionSub}>
          The inner ring is your money grouped into needs, wants, goals &amp; business. The outer ring breaks each group into its categories (same colour family). The legend below is grouped the same way, so you can see exactly which category sits where.
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
          <SunburstChart rows={model.expenseCategories} groupTotals={model.groupTotals} shades={burstShades} size={150} />
          <View style={{ flex: 1, paddingLeft: 20 }}>
            {SUNBURST_ORDER.filter((g) => model.groupTotals[g] > 0).map((g) => {
              const cats = model.expenseCategories
                .filter((r) => r.group === g && r.actualCents > 0)
                .sort((a, b) => b.actualCents - a.actualCents);
              const gPct = model.totalExpenseCents > 0 ? Math.round((model.groupTotals[g] / model.totalExpenseCents) * 100) : 0;
              return (
                <View key={g} style={{ marginBottom: 5 }}>
                  {/* group header - the inner-ring colour */}
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <View style={{ width: 9, height: 9, borderRadius: 2, backgroundColor: GROUP_META[g].color, marginRight: 5 }} />
                    <Text style={{ fontSize: 8.5, fontWeight: 700, flex: 1 }}>{GROUP_META[g].label.split(" (")[0]}</Text>
                    <Text style={{ fontSize: 8.5, fontWeight: 700 }}>{zar(model.groupTotals[g])}</Text>
                    <Text style={{ fontSize: 7.5, color: C.textMuted, width: 30, textAlign: "right" }}>{gPct}%</Text>
                  </View>
                  {/* categories in this group - outer-ring shades */}
                  {cats.slice(0, 4).map((r) => (
                    <View key={r.categoryId} style={{ flexDirection: "row", alignItems: "center", paddingLeft: 14, marginTop: 1.5 }}>
                      <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: burstShades.get(r.categoryId) ?? r.color, marginRight: 5 }} />
                      <Text style={{ fontSize: 7.5, color: C.text, flex: 1 }}>{r.categoryName}</Text>
                      <Text style={{ fontSize: 7.5, color: C.textMuted }}>{zar(r.actualCents)}</Text>
                    </View>
                  ))}
                  {cats.length > 4 && (
                    <Text style={{ fontSize: 7, color: C.textMuted, paddingLeft: 14, marginTop: 1 }}>
                      +{cats.length - 4} more
                    </Text>
                  )}
                </View>
              );
            })}
          </View>
        </View>
        {sunburstStory && (
          <View style={{ marginBottom: 10 }}>
            <ToneItem tone={sunburstStory.tone} size={8.5} text={sunburstStory.text} />
          </View>
        )}

        <Text style={styles.sectionTitle}>Expenses by category</Text>
        <ExpenseTable rows={consumptionRows} />
        {setAsideRows.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { marginTop: 10 }]}>Money set aside</Text>
            <Text style={styles.sectionSub}>
              Savings, stokvel and investment contributions - building assets, not consumption. A positive variance here means you set aside MORE than planned.
            </Text>
            <ExpenseTable rows={setAsideRows} positiveIsGood />
          </>
        )}
        <Footer />
      </Page>

      {/* ── Page 5 - Income & transactions ────────────────────────────── */}
      <Page size="A4" style={styles.page}>
        <PageHeader uri={logoDataUri} title="Income & transactions" />
        <Text style={styles.sectionTitle}>Income by source</Text>
        {model.incomeCategories.length === 0 ? (
          <Text style={{ fontSize: 9, color: C.textMuted, marginBottom: 16 }}>No income data for this period.</Text>
        ) : (
          <View style={{ marginBottom: 6 }}>
            <View style={styles.tableHeader}>
              <Text style={{ width: "55%" }}>Source</Text>
              <Text style={{ width: "25%", textAlign: "right" }}>Amount</Text>
              <Text style={{ width: "20%", textAlign: "right" }}>Share</Text>
            </View>
            {model.incomeCategories.map((r, idx) => (
              <View key={r.categoryId} style={[styles.tableRow, idx % 2 === 1 ? { backgroundColor: C.rowAlt } : {}]}>
                <Text style={{ width: "55%" }}>{r.categoryName}</Text>
                <Text style={{ width: "25%", textAlign: "right", color: C.teal }}>{zar(r.actualCents)}</Text>
                <Text style={{ width: "20%", textAlign: "right" }}>{r.sharePct}%</Text>
              </View>
            ))}
          </View>
        )}
        {model.incomeCategories.length > 0 && (
          <Text style={{ fontSize: 8, color: C.textMuted, marginBottom: 10 }}>
            {model.incomeCategories[0].sharePct >= 80
              ? `${model.incomeCategories[0].sharePct}% of income comes from one source - a second stream, even a small one, softens the risk of a bad month.`
              : `Income is spread across ${model.incomeCategories.length} source${model.incomeCategories.length === 1 ? "" : "s"}.`}
          </Text>
        )}

        {model.recurringCommitments.length === 0 && (
          <>
            <Text style={styles.sectionTitle}>Recurring commitments</Text>
            <Text style={{ fontSize: 8.5, color: C.textMuted, marginBottom: 14 }}>
              None detected yet - a payment shows up here once it repeats at a similar amount for three months or more.
            </Text>
          </>
        )}
        {model.recurringCommitments.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Recurring commitments</Text>
            <Text style={styles.sectionSub}>
              Payments that repeat monthly at a similar amount - your fixed base of {zarWhole(totalRecurringMonthly)}/month before any day-to-day choices.
            </Text>
            <View style={{ marginBottom: 10 }}>
              <View style={styles.tableHeader}>
                <Text style={{ width: "40%" }}>Payment</Text>
                <Text style={{ width: "22%" }}>Category</Text>
                <Text style={{ width: "19%", textAlign: "right" }}>Typical / month</Text>
                <Text style={{ width: "19%", textAlign: "right" }}>Total</Text>
              </View>
              {model.recurringCommitments.map((r, idx) => (
                <View key={r.description} style={[styles.tableRow, idx % 2 === 1 ? { backgroundColor: C.rowAlt } : {}]}>
                  <Text style={{ width: "40%", fontSize: 8.5 }}>{r.description}</Text>
                  {r.group === "unclassified" ? (
                    <Text style={{ width: "22%", fontSize: 8, color: C.expense, fontWeight: 700 }}>
                      Needs a category
                    </Text>
                  ) : (
                    <Text style={{ width: "22%", fontSize: 8, color: C.textMuted }}>{r.categoryName}</Text>
                  )}
                  <Text style={{ width: "19%", textAlign: "right", fontWeight: 700, fontSize: 8.5 }}>
                    {zarWhole(r.typicalCents)}
                  </Text>
                  <Text style={{ width: "19%", textAlign: "right", fontSize: 8.5 }}>
                    {zarWhole(r.totalCents)} (x{r.count})
                  </Text>
                </View>
              ))}
            </View>
            {model.recurringCommitments.some((r) => r.group === "unclassified") && (
              <Text style={{ fontSize: 7.5, color: C.expense, marginTop: -8, marginBottom: 6 }}>
                A repeating payment is a known commitment - categorise it once in the app and every future import is fixed too.
              </Text>
            )}
          </>
        )}

        <View style={{ flexDirection: "row", gap: 12, marginBottom: 4 }}>
          <View style={{ flex: 1 }}>
            <Text style={styles.sectionTitle}>Top merchants</Text>
            <View style={styles.insightCard}>
              {model.topMerchants.length === 0 ? (
                <Text style={{ fontSize: 9, color: C.textMuted }}>No merchants.</Text>
              ) : (
                model.topMerchants.map((m, i) => (
                  <View key={i} style={{ marginBottom: 6 }}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                      <Text style={{ fontSize: 8.5, flex: 1, marginRight: 6 }}>
                        {i + 1}. {m.description}
                      </Text>
                      <Text style={{ fontSize: 8.5, fontWeight: 700 }}>{zar(m.totalCents)}</Text>
                    </View>
                    <Text style={{ fontSize: 7, color: C.textMuted, marginLeft: 10 }}>
                      {m.count} transaction{m.count === 1 ? "" : "s"}
                      {recurringNames.has(m.description) ? " · recurring monthly" : ""}
                    </Text>
                  </View>
                ))
              )}
            </View>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.sectionTitle}>Largest transactions</Text>
            <View style={styles.insightCard}>
              {model.largestTransactions.length === 0 ? (
                <Text style={{ fontSize: 9, color: C.textMuted }}>None.</Text>
              ) : (
                model.largestTransactions.map((t, i) => (
                  <View key={i} style={{ marginBottom: 6 }}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                      <Text style={{ fontSize: 8.5, flex: 1, marginRight: 6 }}>
                        {i + 1}. {t.description}
                      </Text>
                      <Text style={{ fontSize: 8.5, fontWeight: 700 }}>{zar(t.cents)}</Text>
                    </View>
                    <Text style={{ fontSize: 7, color: C.textMuted, marginLeft: 10 }}>
                      {t.categoryName} · {t.date}
                    </Text>
                  </View>
                ))
              )}
            </View>
          </View>
        </View>

        {redactedCount > 0 && (
          <Text style={{ fontSize: 7.5, color: C.textMuted, marginTop: -2, marginBottom: 6 }}>
            {redactedCount} {redactedCount === 1 ? "counterparty is" : "counterparties are"} shown by category
            instead of by name, so this report can be shared without naming people you pay. Amounts and totals
            are unchanged. Names are always visible to you in the app.
          </Text>
        )}

        <View style={{ flexDirection: "row", gap: 12, marginBottom: 4 }}>
          <View style={{ flex: 1 }}>
            <Text style={styles.sectionTitle}>Over budget</Text>
            {model.topOverBudget.length === 0 ? (
              <Text style={{ fontSize: 9, color: C.textMuted }}>None - nicely done.</Text>
            ) : (
              model.topOverBudget.map((r) => (
                <Text key={r.categoryId} style={[styles.insightItem, { color: C.expense }]}>
                  {r.categoryName} {zarSigned(r.varianceCents)} ({r.variancePct}%)
                </Text>
              ))
            )}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.sectionTitle}>Under budget</Text>
            {model.topUnderBudget.length === 0 ? (
              <Text style={{ fontSize: 9, color: C.textMuted }}>None.</Text>
            ) : (
              model.topUnderBudget.map((r) => (
                <Text key={r.categoryId} style={[styles.insightItem, { color: C.teal }]}>
                  {r.categoryName} {zarSigned(r.varianceCents)} ({r.variancePct}%)
                </Text>
              ))
            )}
          </View>
        </View>

        <Text style={styles.sectionTitle}>How you compare to common guidelines</Text>
        <View>
          <View style={styles.tableHeader}>
            <Text style={{ width: "40%" }}>Measure</Text>
            <Text style={{ width: "30%", textAlign: "right" }}>You</Text>
            <Text style={{ width: "30%", textAlign: "right" }}>Guideline</Text>
          </View>
          {ins.benchmarks.map((b, idx) => (
            <View key={b.label} style={[styles.tableRow, idx % 2 === 1 ? { backgroundColor: C.rowAlt } : {}]}>
              <View style={{ width: "40%", flexDirection: "row", alignItems: "center" }}>
                <View style={[styles.dot, { width: 7, height: 7, backgroundColor: toneColor(b.tone) }]} />
                <Text style={{ fontSize: 8.5 }}>{b.label}</Text>
              </View>
              <Text style={{ width: "30%", textAlign: "right", fontWeight: 700, color: toneColor(b.tone), fontSize: 8.5 }}>
                {b.value}
              </Text>
              <Text style={{ width: "30%", textAlign: "right", color: C.textMuted, fontSize: 8.5 }}>{b.target}</Text>
            </View>
          ))}
        </View>
        {model.dataQuality.unclassifiedExpenseSharePct >= 20 && (
          <Text style={{ fontSize: 7.5, color: C.textMuted, marginTop: 5 }}>
            Caveat: with {model.dataQuality.unclassifiedExpenseSharePct}% of spending unclassified, the true Needs and Wants shares are likely higher.
          </Text>
        )}
        <Footer />
      </Page>
    </Document>
  );
}
