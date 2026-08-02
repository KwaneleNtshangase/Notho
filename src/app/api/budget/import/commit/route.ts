import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/apiAuth";
import { createServiceSupabase } from "@/lib/supabaseServer";
import { reconcileAfterImportSkips } from "@/lib/budget/reconciliation";
import { txnToBudgetEntryFields } from "@/lib/budget/types";
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

  const { data: existingRows } = await admin
    .from("budget_entries")
    .select("dedupe_hash")
    .eq("user_id", user.id)
    .not("dedupe_hash", "is", null);

  const existingHashes = new Set(
    (existingRows ?? []).map((r) => r.dedupe_hash as string).filter(Boolean)
  );

  const rowsToInsert = allRows.filter(
    (r) => !r.skip && !r.skipReason && !existingHashes.has(r.dedupeHash)
  );

  if (rowsToInsert.length === 0) {
    return NextResponse.json({ error: "No new transactions to import" }, { status: 400 });
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

  // Block PDF import when statement reconciliation failed
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

  // Account attribution handling
  let accountId: string | null = null;
  const institutionName = body.accountLabel || "Unknown Bank";
  
  if (institutionName) {
    // 1. Try to find an existing bank account by name
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
      // 2. If it doesn't exist, create it
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

  // Fetch valid custom categories to prevent rogue UUIDs (like file/batch IDs) from being saved as categories
  const { data: customCats } = await admin
    .from("custom_budget_categories")
    .select("id")
    .eq("user_id", user.id);
  const validCustomCatIds = new Set((customCats ?? []).map(c => c.id));
  const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  const inserts = rowsToInsert.map((row) => {
    const { type, amount } = txnToBudgetEntryFields({ amountZAR: row.amountZAR });
    
    // Prevent file names or UUID-like strings (like batch IDs) that end in extensions from being saved as categories
    let safeCategory = row.category;
    if (safeCategory && (safeCategory.toLowerCase().endsWith(".pdf") || safeCategory.toLowerCase().endsWith(".csv") || safeCategory.toLowerCase().endsWith(".ofx"))) {
      safeCategory = type === "income" ? "other-income" : "other";
    }
    
    // Prevent raw UUIDs that don't match a custom category ID (e.g. batch_id or file_id)
    if (safeCategory && UUID_REGEX.test(safeCategory) && !validCustomCatIds.has(safeCategory)) {
      safeCategory = type === "income" ? "other-income" : "other";
    }

    return {
      user_id: user.id,
      type: row.type ?? type,
      category: safeCategory,
      amount,
      description: row.description,
      entry_date: row.date,
      source: "import",
      import_batch_id: batch.id,
      dedupe_hash: row.dedupeHash,
      account_label: row.accountLabel ?? body.accountLabel ?? null,
      is_transfer: row.isTransfer ?? false,
      account_id: accountId,
      entry_method: "imported",
    };
  });

  /**
   * Schema-drift tolerance. This is not defensive programming for its own sake:
   * migration 20260706122040_account_attribution.sql sat unapplied on
   * production for four weeks, and because this insert named account_id and
   * entry_method unconditionally, PostgREST rejected the ENTIRE batch. Every
   * statement import in production failed at the final step, after parsing
   * hundreds of rows correctly. The reads in BudgetPlanner already degraded
   * gracefully for exactly this reason; the write did not, so the write is
   * what broke.
   *
   * Account attribution is a nice-to-have. The transactions are the point. If
   * the columns are missing we drop them and save the money, rather than
   * throwing away a correct parse over metadata.
   */
  const OPTIONAL_COLUMNS = ["account_id", "entry_method"] as const;

  const isUnknownColumn = (e: { code?: string; message: string }): string | null => {
    // PGRST204 on write, 42703 from Postgres directly. Both name the column.
    const m = e.message.match(/'([a-z_]+)' column|column [a-z_]+\.([a-z_]+) does not exist/i);
    const named = m?.[1] ?? m?.[2] ?? null;
    if (!named) return null;
    return (OPTIONAL_COLUMNS as readonly string[]).includes(named) ? named : null;
  };

  let insertError = (await admin.from("budget_entries").insert(inserts)).error;

  if (insertError && isUnknownColumn(insertError)) {
    const missing = isUnknownColumn(insertError);
    console.error(
      `[schema-drift] budget_entries is missing '${missing}'. ` +
        `Apply supabase/migrations/20260706122040_account_attribution.sql. ` +
        `Saving ${inserts.length} entries without account attribution.`
    );
    const stripped = inserts.map((row) => {
      const copy: Record<string, unknown> = { ...row };
      for (const col of OPTIONAL_COLUMNS) delete copy[col];
      return copy;
    });
    insertError = (await admin.from("budget_entries").insert(stripped)).error;
  }

  if (insertError) {
    const isDuplicate =
      insertError.code === "23505" ||
      insertError.message.toLowerCase().includes("duplicate");
    return NextResponse.json(
      {
        error: isDuplicate
          ? "A transaction in this import already exists (dedupe conflict). Re-upload to refresh skips."
          : insertError.message,
      },
      { status: isDuplicate ? 409 : 500 }
    );
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
