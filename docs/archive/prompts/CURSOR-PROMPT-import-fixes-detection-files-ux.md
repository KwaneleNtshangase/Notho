# Cursor Prompt — Import fixes: bank detection, descriptions, multi-file UX, error surfacing

> Real-world testing surfaced five issues in the bank-statement import. Fix all five. No schema change. Commit only the parser/panel/test paths (not `git add -A`), push to `main`.

## 1. Bank mis-detection (FNB detected as Capitec) — confirmed root cause
In `src/lib/budget/parsers/pdfTemplates.ts`, the Capitec detector is `{ id: "capitec", detect: /capitec/i }`. That matches the word "Capitec" **anywhere in the document**, including inside a transaction description on an FNB statement (e.g. `Magtape Credit Capitec K Ntshangase`). So an FNB statement that contains a Capitec payment is mis-detected as Capitec, runs the wrong template, and produces garbage rows + huge descriptions.
Fix:
- **Detect the issuer from the header/branding region only** (e.g. the first ~20 lines / the area above the transaction table), NOT from transaction text.
- Tighten the per-bank patterns to issuer markers: Capitec → `/capitec\s*bank|capitecbank\.co\.za|^\s*Main Account Statement/im`; FNB → `/first\s+national\s+bank|fnb\.co\.za|gold\s+business\s+account/i`. Do not detect a bank from a bare bank name that could appear in a payment description.
- If two banks match, prefer the one whose marker appears in the header/issuer region. Add a regression test: an FNB statement containing the literal word "Capitec" in a transaction line still detects as **FNB**.

## 2. Clean up over-long descriptions
Transaction descriptions are too long/noisy. Normalise them:
- Strip pure noise tokens: phone numbers, branch codes, "Universal Branch Code", long bare digit strings / reference numbers (e.g. `2864469`, `R25853`, `395880`), and address/boilerplate fragments.
- Keep the meaningful payee/merchant text (e.g. `FNB App Payment To Yoco Capital`, `Magtape Credit Capitec K Ntshangase`).
- Cap the stored/displayed description at a sensible length (~80 chars) with an ellipsis; keep the full text available on hover/title if easy.
- Note: fixing #1 removes most of the garbage descriptions already; this is the cleanup for legitimately-parsed rows.

## 3. Multi-file selection should ACCUMULATE, not replace
Currently, selecting a second file in the picker replaces the first. Users want to add files one at a time.
- Change the file input handler to **append** newly chosen files to the existing selection (dedupe by name + size), instead of overwriting.
- The same applies to drag-and-drop: dropped files add to the queue.

## 4. Show a selected-files list with per-file remove
Before parsing (and in the preview), show the **queued file names as chips/rows**, each with a **× remove** control, so a user can drop a file added by mistake without starting over. Removing a file updates the queue and (if already parsed) removes its section from the preview.

## 5. Surface parse errors instead of silently resetting
When a file fails to parse, the modal currently shows "Parsing…" then silently returns to "Preview transactions" with no explanation (a Standard Bank statement does this). Instead:
- Catch parse failures per file and **show a clear inline error for that file** (e.g. "Couldn't read this statement — unsupported layout / no transaction table found"), the same way reconciliation warnings are shown.
- Never silently discard a file or reset the whole modal on one file's failure; other files should still preview.

## Notes / out of scope
- A **Standard Bank template** is still needed (its statements currently fail to parse). That requires a real Standard Bank statement to define the layout — handled separately once a sample is provided. For now, just make its failure show a clear error (#5) rather than a silent reset.
- No schema change. SAST + ZAR cents. Don't touch `useProgress.ts`/XP/sync or the working Capitec/FNB balance-chain logic.
- Tests: bank-detection regression (FNB-with-"Capitec"-in-a-row → FNB), description normalisation, multi-file accumulate + remove. `npx tsc --noEmit` clean; existing tests pass. Commit only import/parser/panel/test paths (not `git add -A`); push to `main`.
