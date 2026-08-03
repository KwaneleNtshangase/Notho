"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, ArrowLeftRight, CheckCircle2, FileUp, Plus, Shield, Upload, X } from "@/components/icons/NothoIcons";
import { supabase } from "@/lib/supabaseClient";
import { formatRand } from "@/lib/viewHelpers";
import type { PreviewTxn } from "@/lib/budget/types";
import { normaliseDescription } from "@/lib/budget/dedupe";
import { detectTransferPairs, type TransferPair } from "@/lib/budget/transfers";
import { reportClientError } from "@/lib/errorReporting";

type PreviewRow = PreviewTxn & {
  categoryEdited?: boolean;
  rememberMerchant?: boolean;
};

type FileMeta = {
  fileName: string;
  fileType?: string;
  bankHint?: string;
  accountLabel: string;
  reconciliation?: { ok: boolean; warnings: string[] };
  statementReconciliation?: ParseResponse["statementReconciliation"];
  lowConfidence?: boolean;
};

type CustomBudgetCategory = {
  id: string;
  name: string;
  type: "income" | "expense";
};

const ADD_CATEGORY_VALUE = "__add_category__";

type ParseResponse = {
  ok: boolean;
  bankHint?: string;
  accountLabel?: string;
  fileType?: string;
  needsPassword?: boolean;
  /** Masked layout signature returned when no transaction table was found. */
  diagnostics?: string;
  customCategories?: CustomBudgetCategory[];
  reconciliation?: {
    ok: boolean;
    warnings: string[];
    parsedCount: number;
  };
  statementReconciliation?: {
    ok: boolean;
    warnings: string[];
    parsedCount: number;
    parsedSignedSumCents: number;
  };
  transactions?: PreviewTxn[];
  importedCount?: number;
  skippedCount?: number;
  lowConfidence?: boolean;
  error?: string;
};

const EXPENSE_CATS = [
  { id: "food", label: "Food & Groceries" },
  { id: "transport", label: "Transport" },
  { id: "housing", label: "Housing/Rent" },
  { id: "debt", label: "Debt" },
  { id: "savings", label: "Savings" },
  { id: "entertainment", label: "Entertainment" },
  { id: "airtime", label: "Airtime & Data" },
  { id: "healthcare", label: "Healthcare" },
  { id: "education", label: "Education" },
  { id: "other", label: "Other" },
];

const INCOME_CATS = [
  { id: "salary", label: "Salary" },
  { id: "freelance", label: "Freelance" },
  { id: "business", label: "Business" },
  { id: "other-income", label: "Other Income" },
];

const MAX_FILE_BYTES = 5 * 1024 * 1024;
const ACCEPTED_EXT = [".csv", ".ofx", ".qfx", ".pdf"];

function isAcceptedFile(file: File): boolean {
  const lower = file.name.toLowerCase();
  return ACCEPTED_EXT.some((ext) => lower.endsWith(ext));
}

function selectiveNeedsReview(row: PreviewRow, fileMeta?: FileMeta): boolean {
  if (fileMeta?.reconciliation?.ok === false) return true;
  if (row.needsReview) return true;
  const cat = row.categorisation.category;
  if (cat === "other" || cat === "other-income") return true;
  return false;
}

function validateIncomingFiles(incoming: File[]): { files: File[] } | { error: string } {
  if (incoming.length === 0) {
    return { error: "No files selected." };
  }
  const rejected = incoming.filter((f) => !isAcceptedFile(f));
  if (rejected.length > 0) {
    return { error: `Unsupported file type: ${rejected.map((f) => f.name).join(", ")}. Use CSV, OFX, or PDF.` };
  }
  const tooLarge = incoming.filter((f) => f.size > MAX_FILE_BYTES);
  if (tooLarge.length > 0) {
    return { error: `File too large (max 5 MB): ${tooLarge.map((f) => f.name).join(", ")}` };
  }
  return { files: incoming };
}

export function BudgetImportPanel({ onImported }: { onImported: () => void }) {
  const [open, setOpen] = useState(false);
  const [consent, setConsent] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [fileMetas, setFileMetas] = useState<FileMeta[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<PreviewRow[]>([]);
  const [committing, setCommitting] = useState(false);
  const [pdfPassword, setPdfPassword] = useState("");
  const [needsPasswordFile, setNeedsPasswordFile] = useState<string | null>(null);
  const [confirmedTransfers, setConfirmedTransfers] = useState<Set<string>>(new Set());
  const [dragActive, setDragActive] = useState(false);
  const [customCategories, setCustomCategories] = useState<CustomBudgetCategory[]>([]);
  const [addingCategoryFor, setAddingCategoryFor] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [savingCategory, setSavingCategory] = useState(false);

  // Escape closes the import dialog (unless a parse/import is mid-flight)
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading && !committing) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, loading, committing]);

  const loadCustomCategories = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("custom_budget_categories")
      .select("id, name, type")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });
    if (data) setCustomCategories(data as CustomBudgetCategory[]);
  }, []);

  const categoriesForRow = useCallback(
    (row: PreviewRow) => {
      const isIncome = row.categorisation.type === "income";
      const statics = isIncome ? INCOME_CATS : EXPENSE_CATS;
      const fallbackId = isIncome ? "other-income" : "other";
      const custom = customCategories
        .filter((c) => c.type === row.categorisation.type)
        .map((c) => ({ id: c.id, label: c.name }));
      const core = statics.filter((c) => c.id !== fallbackId);
      const fallback = statics.find((c) => c.id === fallbackId)!;
      return [...core, ...custom, fallback];
    },
    [customCategories]
  );

  const applyValidatedFiles = (incoming: File[]) => {
    const validated = validateIncomingFiles(incoming);
    if ("error" in validated) {
      setError(validated.error);
      return;
    }
    setError(null);
    // Accumulate across multiple selections/drops (dedupe by name + size) so a
    // second pick adds to the queue instead of replacing it.
    setFiles((prev) => {
      const byKey = new Map(prev.map((f) => [`${f.name}:${f.size}`, f]));
      for (const f of validated.files) byKey.set(`${f.name}:${f.size}`, f);
      return Array.from(byKey.values());
    });
    setNeedsPasswordFile(null);
    setPdfPassword("");
  };

  const removeFile = (name: string, size: number) => {
    setFiles((prev) => prev.filter((f) => !(f.name === name && f.size === size)));
    setFileMetas((prev) => prev.filter((m) => m.fileName !== name));
    setRows((prev) => prev.filter((r) => r.sourceFileName !== name));
  };

  const handleFileInputChange = (fileList: FileList | null) => {
    if (!fileList?.length) return;
    applyValidatedFiles(Array.from(fileList));
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!dragActive) setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget === e.target) setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (!consent) {
      setError("Please accept the consent checkbox before uploading files.");
      return;
    }
    applyValidatedFiles(Array.from(e.dataTransfer.files));
  };

  const transferPairs = useMemo(() => detectTransferPairs(rows), [rows]);

  const rowsWithTransfers = useMemo(() => {
    return rows.map((r) => {
      const pair = transferPairs.find((p) => p.debitId === r.id || p.creditId === r.id);
      if (!pair) return r;
      const confirmed = confirmedTransfers.has(pair.pairId);
      return { ...r, transferPairId: pair.pairId, transferConfirmed: confirmed, isTransfer: confirmed };
    });
  }, [rows, transferPairs, confirmedTransfers]);

  const groupedByFile = useMemo(() => {
    const map = new Map<string, PreviewRow[]>();
    for (const r of rowsWithTransfers) {
      const key = r.sourceFileName ?? "unknown";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(r);
    }
    return map;
  }, [rowsWithTransfers]);

  const allReconciled = fileMetas.every((m) => m.reconciliation?.ok !== false);
  const hasPdfFailure = fileMetas.some(
    (m) => m.fileType === "pdf" && m.statementReconciliation && !m.statementReconciliation.ok
  );

  const reset = () => {
    setFiles([]);
    setFileMetas([]);
    setRows([]);
    setError(null);
    setConsent(false);
    setPdfPassword("");
    setNeedsPasswordFile(null);
    setConfirmedTransfers(new Set());
    setCustomCategories([]);
    setAddingCategoryFor(null);
    setNewCategoryName("");
  };

  /**
   * Every import failure must reach the bug inbox, with enough detail to fix it
   * WITHOUT going back to the user - they have already told us it is broken and
   * asking them to re-explain is how a report dies.
   *
   * So we send the bank hint, the file type and the size. We deliberately do
   * NOT send the file, the file name, or any transaction: statements are
   * processed in memory only and that promise is on the panel above. The bank
   * and the layout are enough to reproduce it from a fixture.
   */
  const reportImportFailure = async (
    area: string,
    reason: string,
    file: File,
    json?: Partial<ParseResponse>
  ): Promise<string> => {
    // Short, sayable reference the user can quote and we can grep for. Not a
    // UUID: someone reading it off a phone screen to a WhatsApp message needs
    // it to be six characters, not thirty-six.
    const ref = Math.random().toString(36).slice(2, 8).toUpperCase();
    await reportClientError(area, new Error(reason), {
      ref,
      bankHint: json?.bankHint ?? "unknown",
      fileType: json?.fileType ?? file.name.split(".").pop()?.toLowerCase() ?? "unknown",
      fileSizeKb: Math.round(file.size / 1024),
      // Distinguishes "we could not read the file at all" from "we read it and
      // it was empty" - completely different fixes.
      parsedOk: json?.ok ?? false,
      lowConfidence: json?.lowConfidence ?? null,
      // The masked layout signature. No statement content - see
      // src/lib/budget/parsers/pdfFingerprint.ts.
      diagnostics: json?.diagnostics ?? null,
    });
    return ref;
  };

  const parseOneFile = async (
    file: File,
    token: string,
    password?: string,
    accountLabel?: string
  ): Promise<ParseResponse> => {
    const form = new FormData();
    form.append("file", file);
    if (password) form.append("password", password);
    if (accountLabel) form.append("accountLabel", accountLabel);
    const res = await fetch("/api/budget/import/parse", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });
    const json = (await res.json()) as ParseResponse & { needsPassword?: boolean };
    if (res.status === 422 && json.needsPassword) {
      return { ok: false, needsPassword: true };
    }
    if (!res.ok) {
      return {
        ok: false,
        error: json.error ?? "Parse failed",
        diagnostics: json.diagnostics,
        bankHint: json.bankHint,
      };
    }
    return json;
  };

  const handleParse = async (passwordForFile?: string) => {
    if (files.length === 0 || !consent) return;
    setLoading(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) {
        setError("Please sign in to import statements.");
        return;
      }

      const allRows: PreviewRow[] = [];
      const metas: FileMeta[] = [];
      const failed: { name: string; error: string }[] = [];
      let rowOffset = 0;

      let latestCustomCategories: CustomBudgetCategory[] | undefined;

      for (const file of files) {
        const existingLabel = fileMetas.find((m) => m.fileName === file.name)?.accountLabel;
        const pwd = passwordForFile && needsPasswordFile === file.name ? passwordForFile : undefined;
        const json = await parseOneFile(file, token, pwd, existingLabel);

        if (json.needsPassword) {
          setNeedsPasswordFile(file.name);
          setError(`"${file.name}" is password-protected. Enter the PDF password below.`);
          setLoading(false);
          return;
        }
        // `!json.transactions` is NOT enough: an empty array is truthy. The
        // parse route returns `{ ok: true, transactions: [] }` when it
        // recognises the bank but reads no rows out of the table - which is
        // exactly what a Discovery "CertifiedStatements.pdf" did. That fell
        // through every guard below, produced no rows and no error, and the
        // button simply returned to its idle label. To the user, pressing
        // Preview did nothing at all. Check the LENGTH.
        if (!json.ok || !json.transactions?.length) {
          const reason = json.error
            ?? "We recognised this statement but couldn't read any transactions from it.";
          // Report first so the user's message can carry the reference code.
          const ref = await reportImportFailure(
            json.ok ? "import-parse-empty" : "import-parse-failed",
            reason,
            file,
            json
          );
          // Tell them what happened, that it is already logged, and that they
          // do not need to do anything. Nobody should have to guess whether a
          // failure was noticed.
          failed.push({
            name: file.name,
            error: `${reason} We've automatically logged this and we're on it - your statement was not sent to us, only the layout. Reference ${ref}.`,
          });
          continue;
        }

        setNeedsPasswordFile(null);
        setPdfPassword("");

        // Parsed, but generically. The rows are usable so the user carries on,
        // and we quietly report the layout so it can be supported properly.
        // Without this, an unsupported bank looks healthy right up until
        // someone notices their salary counted as spending.
        if (json.lowConfidence && json.diagnostics) {
          void reportImportFailure(
            "import-parse-low-confidence",
            "Parsed with the generic fallback - layout not supported yet",
            file,
            json
          );
        }

        const accountLabel = json.accountLabel ?? file.name.replace(/\.[^.]+$/, "");
        metas.push({
          fileName: file.name,
          fileType: json.fileType,
          bankHint: json.bankHint,
          accountLabel,
          reconciliation: json.reconciliation,
          statementReconciliation: json.statementReconciliation,
          lowConfidence: json.lowConfidence,
        });

        const fileRows = json.transactions.map((t, i) => ({
          ...t,
          id: `preview-${file.name}-${rowOffset + i}`,
          accountLabel: t.accountLabel ?? accountLabel,
          sourceFileName: file.name,
        }));
        allRows.push(...fileRows);
        rowOffset += fileRows.length;
        if (json.customCategories?.length) {
          latestCustomCategories = json.customCategories;
        }
      }

      setFileMetas(metas);
      setRows(allRows);
      if (failed.length > 0) {
        setError(failed.map((f) => `${f.name}: ${f.error}`).join("  ·  "));
      } else if (allRows.length === 0 && files.length > 0) {
        // Belt and braces. Every known route to zero rows is handled above, so
        // reaching here means a path we have not thought of - which is the most
        // important kind to hear about. Never leave the user with a button that
        // silently returns to idle.
        const ref = await reportImportFailure(
          "import-parse-no-rows",
          "Parse returned no rows across all files",
          files[0]
        );
        setError(
          `We couldn't find any transactions in these files. This has been logged automatically and we're looking into it - you don't need to do anything. Reference ${ref}.`
        );
      }
      if (latestCustomCategories?.length) {
        setCustomCategories(latestCustomCategories);
      } else {
        await loadCustomCategories();
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Parse failed";
      if (files[0]) {
        const ref = await reportImportFailure("import-parse-threw", msg, files[0]);
        setError(`${msg} - this has been logged automatically and we're on it. Reference ${ref}.`);
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const updateAccountLabel = (fileName: string, label: string) => {
    setFileMetas((prev) =>
      prev.map((m) => (m.fileName === fileName ? { ...m, accountLabel: label } : m))
    );
    setRows((prev) =>
      prev.map((r) =>
        r.sourceFileName === fileName ? { ...r, accountLabel: label } : r
      )
    );
  };

  const toggleTransfer = (pairId: string) => {
    setConfirmedTransfers((prev) => {
      const next = new Set(prev);
      if (next.has(pairId)) next.delete(pairId);
      else next.add(pairId);
      return next;
    });
  };

  const handleCommit = async () => {
    setCommitting(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) return;

      let committedAny = false;
      const failed: string[] = [];

      for (const meta of fileMetas) {
        const fileRows = rowsWithTransfers.filter((r) => r.sourceFileName === meta.fileName);
        // Skip files where every row is already imported / removed - sending them
        // would error ("No new transactions") and abort the whole batch.
        if (fileRows.every((r) => r.skipReason)) continue;
        const commitRows = fileRows.map((r) => ({
          date: r.date,
          description: r.description,
          amountZAR: r.amountZAR,
          category: r.categorisation.category,
          type: r.categorisation.type,
          dedupeHash: r.dedupeHash,
          skipReason: r.skipReason,
          rememberMerchant: r.rememberMerchant,
          merchantPattern: r.rememberMerchant
            ? normaliseDescription(r.rawMerchant || r.description)
            : undefined,
          accountLabel: r.accountLabel,
          isTransfer: r.isTransfer ?? false,
        }));

        const res = await fetch("/api/budget/import/commit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            fileName: meta.fileName,
            fileType: meta.fileType,
            accountLabel: meta.accountLabel,
            reconciled: meta.reconciliation?.ok ?? false,
            reconciliationNote: meta.reconciliation?.warnings?.join(" ") ?? null,
            statementReconciliation: meta.statementReconciliation,
            allTransactions: fileRows.map((r) => ({
              date: r.date,
              description: r.description,
              amountZAR: r.amountZAR,
              rawMerchant: r.rawMerchant,
              lineIndex: r.lineIndex,
              balanceAfter: r.balanceAfter,
              externalId: r.externalId,
              accountLabel: r.accountLabel,
            })),
            rows: commitRows,
          }),
        });
        const json = await res.json();
        if (!res.ok) {
          // Keep importing the other files; report failures at the end.
          const reason = json.error ?? "Import failed";
          failed.push(`${meta.fileName}: ${reason}`);
          void reportClientError("import-commit-failed", new Error(reason), {
            bankHint: meta.bankHint ?? "unknown",
            fileType: meta.fileType,
            status: res.status,
            rowCount: commitRows.length,
          });
          continue;
        }
        committedAny = true;
      }

      if (failed.length > 0) {
        setError(failed.join("  ·  "));
      }
      if (!committedAny) {
        if (failed.length === 0) {
          setError("Nothing new to import - these transactions are already in your budget.");
        }
        return;
      }

      setOpen(false);
      reset();
      onImported();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Import failed";
      setError(msg);
      void reportClientError("import-commit-threw", new Error(msg), {
        fileCount: fileMetas.length,
        bankHints: fileMetas.map((m) => m.bankHint ?? "unknown").join(","),
      });
    } finally {
      setCommitting(false);
    }
  };

  const updateRow = (id: string, patch: Partial<PreviewRow>) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };

  const handleCategoryChange = (row: PreviewRow, category: string) => {
    updateRow(row.id, {
      categorisation: { ...row.categorisation, category },
      categoryEdited: true,
    });
    setAddingCategoryFor(null);
  };

  const handleCategorySelect = (row: PreviewRow, value: string) => {
    if (value === ADD_CATEGORY_VALUE) {
      setAddingCategoryFor(row.id);
      setNewCategoryName("");
      return;
    }
    handleCategoryChange(row, value);
  };

  const handleSaveNewCategory = async (row: PreviewRow) => {
    const name = newCategoryName.trim();
    if (!name) return;
    setSavingCategory(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data, error } = await supabase
        .from("custom_budget_categories")
        .insert({
          user_id: user.id,
          name,
          color: "#007A85",
          icon_name: "MoreHorizontal",
          type: row.categorisation.type,
        })
        .select("id, name, type")
        .single();
      if (error || !data) return;
      const created = data as CustomBudgetCategory;
      setCustomCategories((prev) => [...prev, created]);
      handleCategoryChange(row, created.id);
      setNewCategoryName("");
    } finally {
      setSavingCategory(false);
    }
  };

  const importableCount = rowsWithTransfers.filter((r) => !r.skipReason && !r.isTransfer).length;
  const transferCount = rowsWithTransfers.filter((r) => r.isTransfer).length;
  const possibleDuplicateCount = rowsWithTransfers.filter((r) => r.possibleDuplicate).length;

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          display: "flex", alignItems: "center", gap: 6,
          background: "var(--color-surface)", color: "var(--color-primary)",
          border: "1.5px solid var(--color-primary)", borderRadius: 10,
          padding: "8px 14px", fontWeight: 700, fontSize: 14, cursor: "pointer",
        }}
      >
        <Upload size={16} aria-hidden /> Import statement
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-[450] flex items-end justify-center bg-black/60" role="dialog" aria-modal="true">
      <div style={{
        background: "var(--color-surface)",
        borderRadius: "20px 20px 0 0",
        width: "100%",
        maxWidth: 820,
        height: rows.length > 0 ? "92vh" : "auto",
        maxHeight: "92vh",
        display: "flex",
        flexDirection: "column",
        overflow: rows.length > 0 ? "hidden" : "auto",
      }}>
        <div style={{ flexShrink: 0, padding: rows.length > 0 ? "20px 20px 0" : "24px 20px 0" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: rows.length > 0 ? 12 : 16 }}>
            <h3 style={{ fontWeight: 900, fontSize: 18 }}>Import bank statement(s)</h3>
            <button type="button" onClick={() => { setOpen(false); reset(); }} style={{ background: "none", border: "none", cursor: "pointer" }}>
              <X size={20} />
            </button>
          </div>
        </div>

        {rows.length === 0 ? (
          <div style={{ padding: "0 20px 36px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 16, fontSize: 13, color: "var(--color-text-secondary)" }}>
          <Shield size={16} style={{ flexShrink: 0, marginTop: 2 }} />
          <span>
            Files are processed <strong>in memory only</strong> - raw PDFs, CSVs, and passwords are never stored.
            Only categorised transactions and account labels are saved.
          </span>
        </div>

        <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, fontSize: 13 }}>
          <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
          I consent to processing these statement(s) for budget tracking (POPIA), including PDF and multi-file uploads.
        </label>

            <div
              role="button"
              tabIndex={0}
              onDragEnter={handleDragEnter}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  document.getElementById("budget-import-file-input")?.click();
                }
              }}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
                padding: 24,
                border: `2px dashed ${dragActive ? "var(--color-primary)" : "var(--color-border)"}`,
                borderRadius: 12,
                cursor: "pointer",
                marginBottom: 16,
                background: dragActive ? "rgba(0,122,133,0.08)" : "transparent",
                transition: "border-color 0.15s ease, background 0.15s ease",
              }}
            >
              <label
                htmlFor="budget-import-file-input"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 8,
                  cursor: "pointer",
                  width: "100%",
                }}
              >
                <FileUp size={32} style={{ color: dragActive ? "var(--color-primary)" : "var(--color-text-secondary)" }} />
                <span style={{ fontWeight: 600 }}>
                  {dragActive
                    ? "Drop files here"
                    : files.length > 0
                      ? `${files.length} file${files.length > 1 ? "s" : ""} selected`
                      : "Choose or drop CSV, OFX, or PDF files"}
                </span>
                <span style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>
                  Multiple files OK · Max 5 MB each
                </span>
              </label>
              <input
                id="budget-import-file-input"
                type="file"
                accept=".csv,.ofx,.qfx,.pdf"
                multiple
                style={{ display: "none" }}
                onChange={(e) => {
                  handleFileInputChange(e.target.files);
                  e.currentTarget.value = "";
                }}
              />
            </div>

            {files.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
                {files.map((f) => (
                  <div
                    key={`${f.name}:${f.size}`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "5px 8px 5px 10px",
                      borderRadius: 8,
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid var(--color-border)",
                      fontSize: 12,
                      maxWidth: "100%",
                    }}
                  >
                    <span
                      style={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        maxWidth: 220,
                      }}
                    >
                      {f.name}
                    </span>
                    <button
                      type="button"
                      aria-label={`Remove ${f.name}`}
                      onClick={() => removeFile(f.name, f.size)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "var(--color-text-secondary)",
                        display: "flex",
                        padding: 0,
                      }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {needsPasswordFile && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-secondary)", marginBottom: 6 }}>
                  PDF password for {needsPasswordFile}
                </div>
                <input
                  type="password"
                  value={pdfPassword}
                  onChange={(e) => setPdfPassword(e.target.value)}
                  placeholder="Enter PDF password"
                  style={{
                    width: "100%", padding: "10px 14px", borderRadius: 10,
                    border: "1px solid var(--color-border)", fontSize: 14,
                    background: "var(--color-bg)", boxSizing: "border-box" as const,
                  }}
                />
              </div>
            )}

            {error && <p style={{ color: "#E03C31", fontSize: 13, marginBottom: 12 }}>{error}</p>}
            <button
              type="button"
              className="btn btn-primary"
              style={{ width: "100%" }}
              disabled={files.length === 0 || !consent || loading}
              onClick={() => handleParse(needsPasswordFile ? pdfPassword : undefined)}
            >
              {loading ? "Parsing…" : "Preview transactions"}
            </button>
          </div>
        ) : (
          <>
            <div style={{ flexShrink: 0, padding: "0 20px 12px" }}>
              {fileMetas.map((meta) => (
                meta.reconciliation?.ok ? (
                  <div key={`${meta.fileName}-ok`} style={{ background: "rgba(0,122,133,0.08)", border: "1px solid rgba(0,122,133,0.25)", borderRadius: 10, padding: 12, marginBottom: 8, fontSize: 13 }}>
                    <div style={{ display: "flex", gap: 8, fontWeight: 700, color: "var(--color-primary)" }}>
                      <CheckCircle2 size={16} /> {meta.fileName} - Balance reconciles ✓
                    </div>
                  </div>
                ) : meta.reconciliation ? (
                  <div key={meta.fileName} style={{ background: "rgba(255,152,0,0.1)", border: "1px solid rgba(255,152,0,0.3)", borderRadius: 10, padding: 12, marginBottom: 8, fontSize: 13 }}>
                    <div style={{ display: "flex", gap: 8, fontWeight: 700, color: "#F57C00", marginBottom: 4 }}>
                      <AlertTriangle size={16} /> {meta.fileName} - reconciliation warning
                    </div>
                    {meta.reconciliation.warnings.map((w) => <div key={w}>{w}</div>)}
                  </div>
                ) : null
              ))}
              <p style={{ fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 0, lineHeight: 1.5 }}>
                Edit a category below and tick <strong>Remember</strong> to teach future imports how to categorise that merchant.
              </p>
            </div>

            <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "12px 20px 0", WebkitOverflowScrolling: "touch" }}>

            {transferPairs.length > 0 && (
              <div style={{ background: "rgba(0,122,133,0.06)", border: "1px solid rgba(0,122,133,0.25)", borderRadius: 10, padding: 14, marginBottom: 16 }}>
                <div style={{ display: "flex", gap: 8, fontWeight: 700, color: "var(--color-primary)", marginBottom: 10, fontSize: 13 }}>
                  <ArrowLeftRight size={16} />
                  These look like transfers between your own accounts - exclude from spending?
                </div>
                {transferPairs.map((pair: TransferPair) => {
                  const debit = rowsWithTransfers.find((r) => r.id === pair.debitId);
                  const credit = rowsWithTransfers.find((r) => r.id === pair.creditId);
                  if (!debit || !credit) return null;
                  const checked = confirmedTransfers.has(pair.pairId);
                  return (
                    <label key={pair.pairId} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 10, fontSize: 12, cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleTransfer(pair.pairId)}
                        style={{ marginTop: 3 }}
                      />
                      <span>
                        <strong>{formatRand(pair.amountCents / 100)}</strong> - {pair.debitAccount} → {pair.creditAccount}
                        <span style={{ display: "block", color: "var(--color-text-secondary)", marginTop: 2 }}>
                          {debit.date}: {debit.description.slice(0, 40)} ↔ {credit.description.slice(0, 40)}
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>
            )}

            {[...groupedByFile.entries()].map(([fileName, fileRows]) => {
              const meta = fileMetas.find((m) => m.fileName === fileName);
              return (
                <div key={fileName} style={{ marginBottom: 20 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, flexWrap: "wrap" }}>
                    <span style={{ fontWeight: 800, fontSize: 13 }}>{fileName}</span>
                    {meta?.bankHint && (
                      <span style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>({meta.bankHint})</span>
                    )}
                    <input
                      type="text"
                      value={meta?.accountLabel ?? ""}
                      onChange={(e) => updateAccountLabel(fileName, e.target.value)}
                      placeholder="Bank / account label"
                      style={{
                        fontSize: 12, padding: "4px 8px", borderRadius: 6,
                        border: "1px solid var(--color-border)", maxWidth: 160,
                      }}
                    />
                  </div>
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}>
                      <thead>
                        <tr style={{ textAlign: "left", borderBottom: "1px solid var(--color-border)" }}>
                          <th style={{ padding: 8 }}>Date</th>
                          <th style={{ padding: 8 }}>Description</th>
                          <th style={{ padding: 8 }}>Amount</th>
                          <th style={{ padding: 8 }}>Category</th>
                          <th style={{ padding: 8 }} title="Save this merchant's category for next time.">Remember</th>
                        </tr>
                      </thead>
                      <tbody>
                        {fileRows.map((r) => (
                          <tr key={r.id} style={{ opacity: r.skipReason || r.isTransfer ? 0.45 : 1 }}>
                            <td style={{ padding: 8 }}>{r.date}</td>
                            <td style={{ padding: 8, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis" }}>
                              {r.description}
                              {r.possibleDuplicate ? (
                                <span style={{ display: "block", fontSize: 10, color: "#F57C00", marginTop: 2 }}>
                                  ⚠ Possible duplicate{r.duplicateOfDescription ? ` of "${r.duplicateOfDescription}"` : ""}
                                  <label style={{ display: "inline-flex", alignItems: "center", gap: 4, marginLeft: 6, color: "var(--color-text-secondary)", cursor: "pointer" }}>
                                    <input
                                      type="checkbox"
                                      checked={!r.skipReason}
                                      onChange={(e) => updateRow(r.id, { skipReason: e.target.checked ? undefined : "existing_import" })}
                                    />
                                    Import anyway
                                  </label>
                                </span>
                              ) : r.skipReason === "existing_import" ? (
                                <span style={{ display: "block", fontSize: 10, color: "#9E9E9E" }}>Already imported</span>
                              ) : null}
                              {r.isTransfer && (
                                <span style={{ display: "block", fontSize: 10, color: "var(--color-primary)" }}>Transfer - excluded</span>
                              )}
                              {selectiveNeedsReview(r, meta) && !r.skipReason && !r.possibleDuplicate && (
                                <span style={{ display: "block", fontSize: 10, color: "#F57C00" }}>Needs review</span>
                              )}
                            </td>
                            <td
                              style={{
                                padding: 8,
                                fontWeight: 700,
                                whiteSpace: "nowrap",
                                color: r.isTransfer
                                  ? "var(--color-text-secondary)"
                                  : r.amountZAR < 0
                                    ? "#E03C31"
                                    : "#22C55E",
                              }}
                            >
                              {r.amountZAR < 0 ? "-" : "+"}
                              {formatRand(Math.abs(r.amountZAR))}
                            </td>
                            <td style={{ padding: 8 }}>
                              {!r.skipReason && !r.isTransfer && (
                                <div>
                                  <select
                                    value={
                                      addingCategoryFor === r.id
                                        ? ADD_CATEGORY_VALUE
                                        : r.categorisation.category
                                    }
                                    onChange={(e) => handleCategorySelect(r, e.target.value)}
                                    style={{ fontSize: 12, padding: 4, borderRadius: 6, maxWidth: 160, width: "100%" }}
                                  >
                                    {categoriesForRow(r).map((c) => (
                                      <option key={c.id} value={c.id}>{c.label}</option>
                                    ))}
                                    <option value={ADD_CATEGORY_VALUE}>+ Add category</option>
                                  </select>
                                  {addingCategoryFor === r.id && (
                                    <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                                      <input
                                        type="text"
                                        value={newCategoryName}
                                        onChange={(e) => setNewCategoryName(e.target.value)}
                                        placeholder="Category name"
                                        style={{
                                          flex: 1, fontSize: 12, padding: "6px 8px", borderRadius: 6,
                                          border: "1px solid var(--color-border)",
                                        }}
                                        onKeyDown={(e) => {
                                          if (e.key === "Enter") void handleSaveNewCategory(r);
                                        }}
                                      />
                                      <button
                                        type="button"
                                        className="btn btn-primary"
                                        style={{ padding: "6px 10px", fontSize: 11 }}
                                        disabled={savingCategory || !newCategoryName.trim()}
                                        onClick={() => void handleSaveNewCategory(r)}
                                      >
                                        <Plus size={12} aria-hidden />
                                      </button>
                                    </div>
                                  )}
                                </div>
                              )}
                            </td>
                            <td style={{ padding: 8, textAlign: "center" }}>
                              {!r.skipReason && !r.isTransfer && r.categoryEdited && (
                                <input
                                  type="checkbox"
                                  checked={r.rememberMerchant ?? false}
                                  onChange={(e) => updateRow(r.id, { rememberMerchant: e.target.checked })}
                                  aria-label={`Remember merchant for ${r.description}`}
                                />
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}

            {error && <p style={{ color: "#E03C31", fontSize: 13, marginBottom: 12 }}>{error}</p>}
            </div>

            <div style={{
              flexShrink: 0,
              background: "var(--color-surface)",
              borderTop: "1px solid var(--color-border)",
              padding: "16px 20px max(20px, env(safe-area-inset-bottom))",
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}>
              {possibleDuplicateCount > 0 && (
                <div style={{ fontSize: 12, color: "#F57C00", background: "rgba(245,124,0,0.08)", border: "1px solid rgba(245,124,0,0.3)", borderRadius: 8, padding: "8px 10px" }}>
                  ⚠ {possibleDuplicateCount} possible duplicate{possibleDuplicateCount !== 1 ? "s" : ""} found (same date &amp; amount as existing transactions). Skipped by default - tick &ldquo;Import anyway&rdquo; on any that are genuinely new.
                </div>
              )}
              <div style={{ display: "flex", gap: 10 }}>
              <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={reset}>Back</button>
              <button
                type="button"
                className="btn btn-primary"
                style={{ flex: 2 }}
                disabled={
                  committing
                  || importableCount + transferCount === 0
                  || hasPdfFailure
                  || !allReconciled
                }
                onClick={handleCommit}
              >
                {committing ? "Importing…" : (
                  <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                    <CheckCircle2 size={16} />
                    Import {importableCount} transaction{importableCount !== 1 ? "s" : ""}
                    {transferCount > 0 ? ` (+ ${transferCount} transfers)` : ""}
                  </span>
                )}
              </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
