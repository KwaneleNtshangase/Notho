import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/apiAuth";
import { createServiceSupabase } from "@/lib/supabaseServer";
import { reconcileAfterImportSkips } from "@/lib/budget/reconciliation";
import { txnToBudgetEntryFields } from "@/lib/budget/types";
import { sanitiseText } from "@/lib/budget/sanitise";
import type { NormalizedTxn, ReconciliationResult } from "@/lib/budget/types";

type CommitRow = {
  date: string;
  description: string;
  amountZAR: number;
  category: string;
  type: "income" | "expense";
  dedupeHash: string;
  skip?: boolean;
  skipReason?: "existing_import" | "user_removed";
  rememberMerchant?: boolean;
  merchantPattern?: string;
  accountLabel?: string;
  isTransfer?: boolean;
};

const OPTIONAL_COLUMNS = ["account_id", "entry_method"] as const;
const PAGE = 1000;

function isDuplicateError(e: { code?: string; message: string } | null): boolean {
  if (!e) return false;
  return e.code === "23505" || e.message.toLowerCase().includes("duplicate");
}

function isUnknownColumn(e: { code?: string; message: string }): string | null {
  const m = e.message.match(/'([a-z_]+)' column|column [a-z_]+\.([a-z_]+) does not exist/i);
  const named = m?.[1] ?? m?.[2] ?? null;
  if (!named) return null;
  return (OPTIONAL_COLUMNS as readonly string[]).includes(named) ? named : null;
}

async function loadExistingHashes(
  admin: ReturnType<typeof createServiceSupabase>,
  userId: string
): Promise<Set<string>> {
  const hashes = new Set<string>();
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await admin
      .from("budget_entries")
      .select("dedupe_hash")
      .eq("user_id", userId)
      .not("dedupe_hash", "is", null)
      .range(from, from + PAGE - 1);
    if (error) break;
    const rows = data ?? [];
    for (const r of rows) {
      if (r.dedupe_hash) hashes.add(r.dedupe_hash as string);
    }
    if (rows.length < PAGE) break;
  }
  return hashes;
}

async function insertChunk(
  admin: ReturnType<typeof createServiceSupabase>,
  chunk: Record<string, unknown>[]
): Promise<{ error: { code?: string; message: string } | null }> {
  if (chunk.length === 0) return { error: null };
  let { error } = await admin.from("budget_entries").insert(chunk);
  if (error && isUnknownColumn(error)) {
    const stripped = chunk.map((row) => {
      const copy: Record<string, unknown> = { ...row };
      for (const col of OPTIONAL_COLUMNS) delete copy[col];
      return copy;
    });
    ({ error } = await admin.from("budget_entries").insert(stripped));
  }
  if (!error) return { error: null };
  if (isDuplicateError(error)) {
    if (chunk.length === 1) return { error: null };
    const mid = Math.ceil(chunk.length / 2);
    const left = await insertChunk(admin, chunk.slice(0, mid));
    if (left.error && !isDuplicateError(left.error)) return left;
    return insertChunk(admin, chunk.slice(mid));
  }
  return { error };
}

export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as {
    fileName?: string;
    fileType?: "csv" | "ofx" | "pdf";
    accountLabel?: string;
    reconciled?: boolean;
    reconciliationNote?: string;
    statementReconciliation?: ReconciliationResult;
    allTransactions?: NormalizedTxn[];
    rows?: CommitRow[];
  };

  const allRows = body.rows ?? [];
  const admin = createServiceSupabase();
  const existingHashes = await loadExistingHashes(admin, user.id);

  const rowsToInsert: CommitRow[] = [];
  const batchHashes = new Set<string>();
  for (const r of allRows) {
    if (r.skip || r.skipReason) continue;
    if (!r.dedupeHash) continue;
    if (existingHashes.has(r.dedupeHash) || batchHashes.has(r.dedupeHash)) continue;
    batchHashes.add(r.dedupeHash);
    rowsToInsert.push(r);
  }

  if (rowsToInsert.length === 0) {
    return NextResponse.json({
      ok: true,
      importedCount: 0,
      skippedCount: allRows.length,
    });
  }

  if (body.statementReconciliation && body.allTransactions) {
    const postDedupe = reconcileAfterImportSkips(
      body.allTransactions,
      allRows,
      body.statementReconciliation
    );
    if (!postDedupe.ok) {
      return NextResponse.json(
        {
          error: "Reconciliation failed after dedupe - import blocked.",
          reconciliation: postDedupe,
        },
        { status: 409 }
      );
    }
  }

  if (body.fileType === "pdf" && body.statementReconciliation && !body.statementReconciliation.ok) {
    return NextResponse.json(
      {
        error: "PDF statement failed reconciliation - review and fix before importing.",
        reconciliation: body.statementReconciliation,
      },
      { status: 409 }
    );
  }

  const { data: batch, error: batchError } = await admin
    .from("budget_import_batches")
    .insert({
      user_id: user.id,
      file_name: body.fileName ?? null,
      file_type: body.fileType ?? "csv",
      account_label: body.accountLabel ?? null,
      txn_count: allRows.length,
      imported_count: 0,
      skipped_count: allRows.length - rowsToInsert.length,
      reconciled: body.reconciled ?? false,
      reconciliation_note: body.reconciliationNote ?? null,
    })
    .select("id")
    .single();

  if (batchError || !batch) {
    return NextResponse.json({ error: batchError?.message ?? "Failed to create batch" }, { status: 500 });
  }

  let accountId: string | null = null;
  const institutionName = body.accountLabel || "Unknown Bank";

  if (institutionName) {
    const { data: bankAccounts, error: findError } = await admin
      .from("bank_accounts")
      .select("id")
      .eq("user_id", user.id)
      .eq("institution_name", institutionName)
      .limit(1);

    if (findError) {
      console.error("Error finding bank account:", findError);
    }

    if (bankAccounts && bankAccounts.length > 0) {
      accountId = bankAccounts[0].id;
    } else {
      const { data: newBank, error: createError } = await admin
        .from("bank_accounts")
        .insert({
          user_id: user.id,
          institution_name: institutionName,
          custom_label: body.accountLabel ?? null,
        })
        .select("id")
        .single();

      if (createError) {
        console.error("Error creating bank account:", createError);
      } else if (newBank) {
        accountId = newBank.id;
      }
    }
  }

  const { data: customCats } = await admin
    .from("custom_budget_categories")
    .select("id")
    .eq("user_id", user.id);
  const validCustomCatIds = new Set((customCats ?? []).map((c) => c.id));
  const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  const inserts = rowsToInsert.map((row) => {
    const { type, amount } = txnToBudgetEntryFields({ amountZAR: row.amountZAR });

    let safeCategory = row.category;
    if (
      safeCategory &&
      (safeCategory.toLowerCase().endsWith(".pdf") ||
        safeCategory.toLowerCase().endsWith(".csv") ||
        safeCategory.toLowerCase().endsWith(".ofx"))
    ) {
      safeCategory = type === "income" ? "other-income" : "other";
    }

    if (safeCategory && UUID_REGEX.test(safeCategory) && !validCustomCatIds.has(safeCategory)) {
      safeCategory = type === "income" ? "other-income" : "other";
    }

    const label = sanitiseText(row.accountLabel ?? body.accountLabel ?? "");
    return {
      user_id: user.id,
      type: row.type ?? type,
      category: safeCategory,
      amount,
      description: sanitiseText(row.description),
      entry_date: row.date,
      source: "import",
      import_batch_id: batch.id,
      dedupe_hash: row.dedupeHash,
      account_label: label || null,
      is_transfer: row.isTransfer ?? false,
      account_id: accountId,
      entry_method: "imported",
    };
  });

  const { error: insertError } = await insertChunk(
    admin,
    inserts as unknown as Record<string, unknown>[]
  );

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  const merchantRules = rowsToInsert
    .filter((r) => r.rememberMerchant && r.merchantPattern?.trim() && !r.isTransfer)
    .map((r) => {
      const { type } = txnToBudgetEntryFields({ amountZAR: r.amountZAR });
      return {
        user_id: user.id,
        merchant_pattern: r.merchantPattern!.trim().toLowerCase(),
        category: r.category,
        type: r.type ?? type,
      };
    });

  if (merchantRules.length > 0) {
    const { error: rulesError } = await admin
      .from("user_merchant_rules")
      .upsert(merchantRules, { onConflict: "user_id,merchant_pattern" });
    if (rulesError) {
      return NextResponse.json({ error: rulesError.message }, { status: 500 });
    }
  }

  await admin
    .from("budget_import_batches")
    .update({ imported_count: rowsToInsert.length })
    .eq("id", batch.id);

  return NextResponse.json({
    ok: true,
    batchId: batch.id,
    importedCount: rowsToInsert.length,
    skippedCount: allRows.length - rowsToInsert.length,
  });
}
