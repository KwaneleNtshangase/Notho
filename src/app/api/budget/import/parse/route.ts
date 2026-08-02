import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/apiAuth";
import { createServiceSupabase } from "@/lib/supabaseServer";
import { parseStatement, inferFileType } from "@/lib/budget/parsers";
import { parsePdfStatement, SCANNED_MESSAGE } from "@/lib/budget/parsers/pdf";
import {
  assignDedupeHashes,
  applyExistingImportSkips,
  flagPossibleDuplicates,
  type ExistingTxnKey,
} from "@/lib/budget/dedupe";
import { reconcileAfterImportSkips } from "@/lib/budget/reconciliation";
import { isRefundLikeCredit } from "@/lib/budget/refunds";
import { categorise } from "@/lib/categorisation";
import type { PreviewTxn, UserMerchantRule } from "@/lib/budget/types";

const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB

export type CustomBudgetCategory = {
  id: string;
  name: string;
  type: "income" | "expense";
  color?: string;
  icon_name?: string;
};

function buildPreview(
  parsed: {
    transactions: import("@/lib/budget/types").NormalizedTxn[];
    reconciliation: import("@/lib/budget/types").ReconciliationResult;
    bankHint?: string;
    accountLabel?: string;
    fileType: import("@/lib/budget/types").StatementFileType;
    lowConfidence?: boolean;
  },
  userRules: UserMerchantRule[],
  existingHashes: Set<string>,
  existingKeys: ExistingTxnKey[],
  fileName: string,
  accountLabelOverride?: string,
  customCategories: CustomBudgetCategory[] = []
) {
  const accountLabel = accountLabelOverride ?? parsed.accountLabel ?? parsed.bankHint ?? fileName;

  const txnsWithAccount = parsed.transactions.map((t) => ({
    ...t,
    accountLabel: t.accountLabel ?? accountLabel,
  }));

  const dedupeHashes = assignDedupeHashes(txnsWithAccount);

  let preview: PreviewTxn[] = txnsWithAccount.map((txn, i) => {
    const cat = categorise(txn, userRules, customCategories);
    const uncertain =
      parsed.reconciliation.ok === false ||
      cat.category === "other" ||
      cat.category === "other-income";
    return {
      ...txn,
      id: `preview-${fileName}-${i}`,
      dedupeHash: dedupeHashes[i],
      categorisation: cat,
      refundLike: isRefundLikeCredit(txn),
      sourceFileName: fileName,
      needsReview: uncertain,
    };
  });

  preview = applyExistingImportSkips(preview, existingHashes);
  // Second, softer pass: same date+amount+type as an existing entry but a
  // different exact hash (overlapping statements / previously-missed rows).
  preview = flagPossibleDuplicates(preview, existingKeys);

  const reconciliation = reconcileAfterImportSkips(
    txnsWithAccount,
    preview,
    parsed.reconciliation
  );

  return {
    bankHint: parsed.bankHint,
    accountLabel,
    fileType: parsed.fileType,
    reconciliation,
    statementReconciliation: parsed.reconciliation,
    transactions: preview,
    importedCount: preview.filter((t) => !t.skipReason).length,
    skippedCount: preview.filter((t) => t.skipReason === "existing_import" && !t.possibleDuplicate).length,
    possibleDuplicateCount: preview.filter((t) => t.possibleDuplicate).length,
    lowConfidence: parsed.lowConfidence,
    customCategories,
  };
}

export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }

    if (file.size > MAX_FILE_BYTES) {
      return NextResponse.json({ error: "File too large (max 5 MB)" }, { status: 400 });
    }

    const fileType = inferFileType(file.name, file.type);
    if (!fileType) {
      return NextResponse.json({ error: "Unsupported file type. Use CSV, OFX, or PDF." }, { status: 400 });
    }

    const password = (form.get("password") as string | null) ?? undefined;
    const accountLabelOverride = (form.get("accountLabel") as string | null)?.trim() || undefined;

    const admin = createServiceSupabase();

    const { data: userRules } = await admin
      .from("user_merchant_rules")
      .select("merchant_pattern, category, type")
      .eq("user_id", user.id);

    const { data: existingRows } = await admin
      .from("budget_entries")
      .select("dedupe_hash")
      .eq("user_id", user.id)
      .not("dedupe_hash", "is", null);

    // For fuzzy duplicate detection we need each existing entry's date/amount/
    // type/description - not just its hash. Exclude transfers (they legitimately
    // mirror another leg).
    const { data: existingEntryRows } = await admin
      .from("budget_entries")
      .select("entry_date, amount, type, description, is_transfer")
      .eq("user_id", user.id);

    const existingKeys: ExistingTxnKey[] = (existingEntryRows ?? [])
      .filter((r) => !r.is_transfer)
      .map((r) => ({
        entry_date: r.entry_date as string,
        amountCents: Math.round(Number(r.amount) * 100),
        type: r.type as "income" | "expense",
        description: (r.description as string | null) ?? null,
      }));

    const { data: customCatRows } = await admin
      .from("custom_budget_categories")
      .select("id, name, type, color, icon_name")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });

    const customCategories = (customCatRows ?? []) as CustomBudgetCategory[];

    const existingHashes = new Set(
      (existingRows ?? []).map((r) => r.dedupe_hash as string).filter(Boolean)
    );

    if (fileType === "pdf") {
      const buffer = new Uint8Array(await file.arrayBuffer());
      const pdfResult = await parsePdfStatement(buffer, {
        password,
        fileName: file.name,
      });

      if (!pdfResult.ok) {
        if (pdfResult.kind === "needsPassword") {
          return NextResponse.json({ needsPassword: true }, { status: 422 });
        }
        if (pdfResult.kind === "scanned") {
          return NextResponse.json({ error: SCANNED_MESSAGE }, { status: 400 });
        }
        // Pass the masked layout fingerprint back to the client so it rides
        // along with the automatic bug report. It contains no statement data -
        // bank column headings verbatim, transaction rows masked to x/9. This
        // is what lets an unsupported layout be fixed without ever asking the
        // user to send us their statement.
        return NextResponse.json(
          {
            error: pdfResult.kind === "error" ? pdfResult.message : SCANNED_MESSAGE,
            diagnostics: pdfResult.kind === "error" ? pdfResult.diagnostics : undefined,
            bankHint: pdfResult.kind === "error" ? pdfResult.bankHint : undefined,
          },
          { status: 400 }
        );
      }

      const result = buildPreview(
        pdfResult,
        userRules ?? [],
        existingHashes,
        existingKeys,
        file.name,
        accountLabelOverride,
        customCategories
      );

      return NextResponse.json({ ok: true, ...result });
    }

    const text = await file.text();
    const parsed = parseStatement(text, fileType);
    const result = buildPreview(
      parsed,
      userRules ?? [],
      existingHashes,
      existingKeys,
      file.name,
      accountLabelOverride,
      customCategories
    );

    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
