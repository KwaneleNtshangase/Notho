import { NextRequest, NextResponse } from "next/server";
import React from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import { getUserFromRequest } from "@/lib/apiAuth";
import { createServiceSupabase } from "@/lib/supabaseServer";
import {
  assertReportModel,
  buildReport,
  sumDbEntriesCents,
} from "@/lib/budget/report/aggregate";
import { BudgetReportDocument } from "@/lib/budget/report/pdf";
import { countRedacted, redactReportModel } from "@/lib/budget/report/redact";
import { precedingPeriod, previousCalendarMonthPeriod } from "@/lib/budget/report/period";
import { snapshotFingerprint, snapshotMetricsOf } from "@/lib/budget/report/snapshot";
import { sastToday } from "@/lib/dates";
import type {
  BudgetEntryInput,
  BudgetTargetInput,
  CategoryMeta,
  ReportSnapshotMetrics,
} from "@/lib/budget/report/types";

function inPeriodJson(date: string, start: string, end: string): boolean {
  return date >= start && date <= end;
}

export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    periodStart?: string;
    periodEnd?: string;
    savingsCategoryIds?: string[];
    format?: "pdf" | "json";
    /** Mask private counterparties in the PDF. Omitted means true. */
    redactNames?: boolean;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const wantJson = body.format === "json";

  const savingsCategoryIds = Array.isArray(body.savingsCategoryIds)
    ? body.savingsCategoryIds.filter((s): s is string => typeof s === "string").slice(0, 50)
    : undefined;

  const { periodStart, periodEnd } = body;
  if (
    !periodStart ||
    !periodEnd ||
    !/^\d{4}-\d{2}-\d{2}$/.test(periodStart) ||
    !/^\d{4}-\d{2}-\d{2}$/.test(periodEnd) ||
    periodEnd < periodStart
  ) {
    return NextResponse.json({ error: "Invalid period range" }, { status: 400 });
  }

  const admin = createServiceSupabase();

  // Preceding equal-length window - powers the "vs previous period" deltas.
  const prev = precedingPeriod(periodStart, periodEnd);
  // Trailing ~12 months before the period end - used only to detect recurring
  // commitments, so a monthly payment still clears the 3-month threshold even
  // when the report itself covers a single month.
  const [py, pm, pd] = periodEnd.split("-").map(Number);
  const historyStart = `${py - 1}-${String(pm).padStart(2, "0")}-${String(pd).padStart(2, "0")}`;

  const [entriesRes, prevEntriesRes, historyRes, targetsRes, catsRes, profileRes, progressRes] = await Promise.all([
    admin
      .from("budget_entries")
      .select("id, type, category, amount, description, entry_date, is_transfer")
      .eq("user_id", user.id)
      .gte("entry_date", periodStart)
      .lte("entry_date", periodEnd),
    admin
      .from("budget_entries")
      .select("id, type, category, amount, description, entry_date, is_transfer")
      .eq("user_id", user.id)
      .gte("entry_date", prev.periodStart)
      .lte("entry_date", prev.periodEnd),
    admin
      .from("budget_entries")
      .select("type, category, amount, description, entry_date, is_transfer")
      .eq("user_id", user.id)
      .gte("entry_date", historyStart)
      .lte("entry_date", periodEnd),
    admin
      .from("budget_targets")
      .select("category, monthly_limit, month_year")
      .eq("user_id", user.id),
    admin
      .from("custom_budget_categories")
      .select("id, name, color, icon_name, type")
      .eq("user_id", user.id),
    admin
      .from("profiles")
      // NB: profiles has NO display_name column - selecting it made this whole
      // query error (42703) and silently produced the "Notho user" fallback.
      .select("full_name, username")
      .eq("user_id", user.id)
      .maybeSingle(),
    admin
      .from("user_progress")
      .select("display_name")
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

  if (entriesRes.error) {
    return NextResponse.json({ error: entriesRes.error.message }, { status: 500 });
  }
  if (targetsRes.error) {
    return NextResponse.json({ error: targetsRes.error.message }, { status: 500 });
  }
  if (catsRes.error) {
    return NextResponse.json({ error: catsRes.error.message }, { status: 500 });
  }

  type DbEntry = {
    id: string;
    type: "income" | "expense";
    category: string;
    amount: number;
    description: string | null;
    entry_date: string;
    is_transfer?: boolean;
  };
  const mapEntry = (e: DbEntry): BudgetEntryInput => ({
    id: e.id,
    type: e.type,
    category: e.category,
    amount: Number(e.amount),
    description: e.description,
    entry_date: e.entry_date,
    is_transfer: e.is_transfer ?? false,
  });
  const entries = ((entriesRes.data ?? []) as DbEntry[]).map(mapEntry);
  // Comparison data is best-effort: a fetch error just disables the deltas.
  const prevEntries = prevEntriesRes.error
    ? []
    : ((prevEntriesRes.data ?? []) as DbEntry[]).map(mapEntry);
  // History for recurring detection is best-effort too.
  const historyEntries = historyRes.error
    ? entries
    : ((historyRes.data ?? []) as DbEntry[]).map((e) => mapEntry({ ...e, id: "" }));
  const targets = (targetsRes.data ?? []) as BudgetTargetInput[];
  const categories: CategoryMeta[] = (catsRes.data ?? []).map(
    (c: { id: string; name: string; color: string; type: "expense" | "income" }) => ({
      id: c.id,
      name: c.name,
      color: c.color,
      type: c.type,
    })
  );

  const profile = profileRes.data as
    | { full_name?: string; username?: string }
    | null;
  const progress = progressRes.data as { display_name?: string } | null;
  if (profileRes.error) console.error("[budget/report] profile lookup:", profileRes.error.message);

  /** First word only - the report greets by first name, never the full name. */
  const firstNameOf = (s?: string | null) => (s ?? "").trim().split(/\s+/)[0] ?? "";
  const displayName =
    firstNameOf(profile?.full_name) ||
    profile?.username?.trim() ||
    progress?.display_name?.trim() ||
    "Notho user";

  // Fetch the Notho logo (public asset) and inline it as a data URI so the PDF
  // is self-contained. Graceful: if it fails, the report renders without it.
  let logoDataUri: string | undefined;
  try {
    const origin = req.nextUrl.origin;
    const logoRes = await fetch(`${origin}/Logo.png`);
    if (logoRes.ok) {
      const buf = Buffer.from(await logoRes.arrayBuffer());
      logoDataUri = `data:image/png;base64,${buf.toString("base64")}`;
    }
  } catch {
    logoDataUri = undefined;
  }

  const model = buildReport(
    entries,
    targets,
    categories,
    periodStart,
    periodEnd,
    displayName,
    undefined,
    {
      savingsCategoryIds,
      prevEntries,
      prevStart: prev.periodStart,
      prevEnd: prev.periodEnd,
      historyEntries,
      historyStart,
    }
  );

  try {
    assertReportModel(model);
    const dbSums = sumDbEntriesCents(entries, periodStart, periodEnd);
    if (dbSums.incomeCents !== model.totalIncomeCents) {
      throw new Error(
        `DB income mismatch: ${dbSums.incomeCents} !== ${model.totalIncomeCents}`
      );
    }
    if (dbSums.expenseCents !== model.totalExpenseCents) {
      throw new Error(
        `DB expense mismatch: ${dbSums.expenseCents} !== ${model.totalExpenseCents}`
      );
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Report validation failed";
    console.error("[budget/report]", message);
    return NextResponse.json({ error: "Report validation failed" }, { status: 500 });
  }

  // Phase 4: snapshots. Best-effort throughout - failures never block the
  // report itself.
  let prevSnapshot: ReportSnapshotMetrics | null = null;
  try {
    // Persist this period's metrics - but only once the period is FINISHED.
    // An in-progress period's end date advances daily, and (user, start, end)
    // is the unique key, so writing it would mint a junk row per day; its
    // numbers are also still moving, so the snapshot would say nothing.
    if (periodEnd < sastToday()) {
      const metrics = snapshotMetricsOf(model, entries, targets);
      await admin.from("report_snapshots").upsert(
        {
          user_id: user.id,
          period_start: periodStart,
          period_end: periodEnd,
          metrics,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,period_start,period_end" }
      );
    }

    // "Last report's mission": try the exact preceding equal-length window,
    // then fall back to the previous CALENDAR month - the shape snapshots
    // actually exist under (equal-length windows like "Jun 13-30" never get
    // one, so without the fallback the mission card would never appear).
    const prevMonth = previousCalendarMonthPeriod(periodStart);
    const candidates = [prev, prevMonth].filter(
      (c, i, all) => all.findIndex((x) => x.periodStart === c.periodStart && x.periodEnd === c.periodEnd) === i
    );
    for (const c of candidates) {
      const { data } = await admin
        .from("report_snapshots")
        .select("metrics")
        .eq("user_id", user.id)
        .eq("period_start", c.periodStart)
        .eq("period_end", c.periodEnd)
        .maybeSingle();
      const snap = (data?.metrics as ReportSnapshotMetrics | undefined) ?? null;
      if (!snap) continue;
      // Staleness guard: if the underlying entries/targets changed since the
      // snapshot was written, don't compare against it. (The history endpoint
      // rewrites stale months on the next fetch, so this self-heals.)
      const fp = snapshotFingerprint(historyEntries, targets, c.periodStart, c.periodEnd);
      if (snap.fpCount === fp.fpCount && snap.fpSumCents === fp.fpSumCents && snap.fpMix === fp.fpMix) {
        prevSnapshot = snap;
      }
      break;
    }
  } catch (err) {
    console.error("[budget/report] snapshot write/read failed", err);
  }

  // Interactive in-app report: return the computed model + the period's entries
  // (for tap-to-drill by category) instead of rendering a static PDF.
  if (wantJson) {
    const lightEntries = entries
      .filter((e) => !e.is_transfer && inPeriodJson(e.entry_date, periodStart, periodEnd))
      .map((e) => ({
        category: e.category,
        type: e.type,
        amount: e.amount,
        description: e.description ?? null,
        entry_date: e.entry_date,
      }));
    return NextResponse.json({ ok: true, model, entries: lightEntries, prevSnapshot });
  }

  // Counterparty masking. Defaults ON: the PDF is a shareable file, and the
  // names in it belong to third parties who never agreed to be in it. Only an
  // explicit `redactNames: false` from the client turns it off, so a caller
  // that forgets the field gets the safe behaviour rather than the leaky one.
  // The JSON branch above returns the UNREDACTED model on purpose - that feeds
  // the on-screen report, which is the user's own data on their own device.
  const redactNames = body.redactNames !== false;
  const redactedCount = redactNames ? countRedacted(model) : 0;
  const pdfModel = redactNames ? redactReportModel(model) : model;

  // Server-side @react-pdf render: element is constructed here, outside the
  // try, because renderToBuffer rejects on failure - no error boundary exists.
  const reportDoc = (
    <BudgetReportDocument model={pdfModel} logoDataUri={logoDataUri} redactedCount={redactedCount} />
  );
  try {
    const buffer = await renderToBuffer(reportDoc);
    const filename = `notho-budget-report-${periodStart}_${periodEnd}.pdf`;
    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("[budget/report] PDF render failed", err);
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
  }
}
