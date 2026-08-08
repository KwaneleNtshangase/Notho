# Notho — project context brief (as of 2 August 2026)

Paste this into a new Claude chat to bring it up to speed on the app.

---

## What Notho is

**Notho** is a Duolingo-style personal finance learning app built for South Africa. Short
interactive lessons, XP, streaks, hearts, badges, leaderboards — teaching budgeting, tax,
credit, investing, insurance, retirement, scams, crypto, business finance, and biblical
stewardship, all in SA context (SARS, SARB, two-pot, TFSA, Capitec/FNB/TymeBank, black tax).

It's a Progressive Web App — runs in any mobile browser, installable, no app store needed (yet).

- **Live at:** https://www.notho.co.za (lands on `/learn`)
- **Founder:** Kwanele Ntshangase — qualified financial advisor (Liberty Group), founder of
  The Solution Digital, creator @wealth.with.kwanele on TikTok/LinkedIn
- **Tagline:** "Learn to manage money the South African way"
- **AI coach mascot:** Cosmo

### Naming history (important — the names are inconsistent everywhere)
The app was called **Fundi Finance** until July 2026, then rebranded to **Notho**. Leftovers:

- Vercel project is still named **`fundi-finance`**
- GitHub repo is still **`git@github.com:KwaneleNtshangase/fundi-finance.git`**
- Local working folder is **`~/Developer/notho`**
- Old domain **fundiapp.co.za** is still live and still referenced in places

Don't "fix" the Vercel/GitHub names — they're deliberate.

---

## Stack

- **Next.js 16** (App Router) + **React 19** + TypeScript + **Tailwind v4**
- **Supabase** — auth, Postgres, RLS, edge functions (~39 migrations in `supabase/migrations/`)
- **Vercel** hosting; two crons: `/api/cron/lifecycle` (07:30) and `/api/cron/push-triggers` (16:00), UTC
- **PostHog** analytics (playbook in `Analytics/ANALYTICS.md` — all events go through `src/lib/analytics.ts`, never `posthog.capture()` directly)
- **Resend** for transactional + broadcast email; BIMI record configured
- PWA: service worker (`src/lib/sw`), web push via VAPID
- recharts (charts), @react-pdf/renderer + unpdf (PDF report + statement parsing), papaparse, dompurify

---

## What's actually built

**Learn (the core)**
- 22 courses: 17 core (Money Basics, Salary & Payslip, Banking & Debit Orders, Credit & Debt,
  Emergency Fund & Risk, Insurance, Investing Basics, SA Investment Vehicles, Property, Taxes,
  Scams & Fraud, Money & the Bible, Money Psychology, Retirement, The Rand & Your Money, Crypto,
  Business Finance), 4 advanced "level 3" (Advanced Tax, Estate Planning, Advanced Investing,
  Business Finance Advanced), plus a full **RE5 exam prep** course with two 50-question mock exams.
- **Lesson banks**: 119 lessons are bank-backed with 1,428 hand-written question variants across
  ~122 concepts. Each bank lesson = 4 slots × 3 variants, so two users rarely see the same
  questions and replays differ. Non-bank ("legacy") lessons use a seeded 4-of-N rotation.
- Spaced repetition + a Duolingo-style mastery loop (lesson isn't done until everything is right).
- Gamification: XP, streaks (with freezes + streak repair), hearts, badges, daily challenges,
  quests/goals, leaderboard, stokvel feature, cross-device Supabase sync.

**Budget (the second pillar)**
- Bank statement import: CSV, OFX and PDF, with SA-specific parsers (Capitec, FNB, Discovery, generic)
- Auto-categorisation, merchant rules, apply-to-similar recategorisation, cross-statement dupe
  detection, transfer/refund handling, reconciliation
- Interactive in-app financial report: executive summary, health score + history/trend, behavioural
  patterns, money personality, what-if sliders, snapshots, missions

**Other**
- Cosmo AI coach chat, compound-interest calculator, investor profile quiz
- Admin: bug reports, email broadcast with dedupe ledger + retry, DNS tooling
- Legal/compliance: privacy, terms, security pages, POPIA consent, account data export + delete

---

## Where it's at right now (2 Aug 2026)

**Last production deploy:** 30 July 2026, commit `9afaada` (service worker unhandled-rejection fix).
Recent Vercel deploys are green; one Error on 20 July (`0c8042f`, CI health-check branding
assertion) which was fixed by `9fa50d9`.

**Uncommitted work in the tree — the fundiapp → notho domain cutover.** Four files changed,
not yet committed or deployed:
- `src/app/layout.tsx` — `metadataBase` moved to `https://notho.co.za`
- `src/lib/emails/lifecycle.ts` — sending address moved to `hello@notho.co.za`
- `next.config.ts` — `fundiapp.co.za` removed from CSP `connect-src` / `form-action`
- `vercel.json` — permanent 301 redirects `fundiapp.co.za` → `notho.co.za`

Two things to raise before that ships:
1. `docs/REBRAND-NOTHO.md` prescribes an order: stand up the new domain, verify SPF/DKIM/DMARC,
   allowlist both in CSP, switch FROM/APP_URL, 301 the old domain, keep it alive ~12 months,
   and **only then** drop the old domain from CSP. This diff does the redirect and the CSP
   removal in the same change.
2. The live site still serves `og:image` and `twitter:image` from `https://fundiapp.co.za/notho-logo.png`.
   Those need moving too or social previews break once the old domain is retired.

**Open work stream:** roughly **84 "extra" lessons still need premium lesson banks**. They work
today via legacy rotation but aren't premium quality. `money-basics` extras are done
(`src/data/banks/money-basics-extra.ts`). Full per-course to-do list and the exact authoring
recipe are in **`HANDOFF-NEXT-CHAT.md`** in the repo root — read that before touching content.

**Testing:** vitest 240/240 passing, Playwright e2e suite, plus a content-quality test
(`src/data/__tests__/contentQuality.test.ts`) enforcing unique slot/variant IDs, valid conceptIds,
≥2 variants per slot, >3 questions per lesson. Note: `npm run build` and `npx vitest` OOM in
sandboxes — they get run locally / in Cursor.

**Not launched on app stores.** `Notho-Pre-Launch-Checklist.html` still says fundiapp.co.za and
is partly stale (it flags a 10,600-line `page.tsx` that has since been split — `page.tsx` is 7
lines now, views live in `src/components/views/`). Real remaining blockers from it: Play Store
TWA via Bubblewrap + `assetlinks.json`, Google Play + Apple developer accounts, maskable icon,
mobile Lighthouse performance, Google and Facebook OAuth still in testing mode, and a prominent
"educational content, not financial advice" FSCA disclaimer.

---

## Working conventions to respect

**SA figures are source-controlled.** `docs/SA-REGULATORY-FIGURES.md` (web-verified July 2026,
2026/27 tax year) is the source of truth. Never invent a number. Current key values: TFSA
R46,000/yr and R500,000 lifetime; RA deduction 27.5% capped at **R430,000**; income tax threshold
R99,000 (under 65); CGT 40% inclusion, R50,000 annual exclusion, R3m primary residence; estate
duty 20% to R30m then 25%, R3.5m abatement; two-pot minimum withdrawal R2,000 once per tax year;
company tax 27%; VAT 15%, compulsory registration above R1m turnover; debit-order dispute window
60 days; the ombud is the **National Financial Ombud (NFO)**, not the old separate ombudsmen.
The SBC tax table is flagged unverified — describe it, don't quote the bands.

**Writing voice for lesson content:** plain, concrete, South African, empathetic. Real rands, real
local examples. Plausible distractors, exactly one defensible answer. No AI filler. **No em dashes
anywhere in the app** — that was swept out deliberately. See `docs/QUESTION-VOICE-GUIDE.md`.

**Brand colours** (measured, not guessed — from `docs/REBRAND-NOTHO.md`):
`--brand-teal #01A0AA` graphics only, never text on white · `--color-primary #007A85` body text and
buttons · `--color-primary-hover #005F68` · `--brand-gold #EFB343` decorative only · `--brand-navy
#0D368D` headings · dark-mode primary `#20D3CF`. The app icon is the **N mark**, not the wordmark.

**Careful with the word "fund".** "funding" contains "fundi" — a naive rebrand replace turns
`funding` into `nothong`. Any renaming script must be word-boundary anchored.

**Division of labour on this repo:** the content agent authors `src/data/banks/**` and
`src/data/concepts.ts`; **Cursor owns `src/lib/**`**, tests, and has the working build environment;
a separate agent does read-only QA. Don't edit `src/lib/lessonBank.ts` or `lessonMastery.ts`.

---

## Business model (from the March 2026 plan, `Business/Notho-business-plan.docx`)

Free at the core, monetised at the edges:
- **Notho Pro** — R79/month or R699/year (unlimited hearts, advanced courses, monthly wellness report). Year 1 target 500 subscribers.
- **B2B corporate financial wellness** — R200/employee/year, min 50 seats.
- **Advisor lead generation** — R500–R2,500 per qualified referral.
- **Branded content partnerships** — R15,000–R50,000 per module (year 2 onwards).

Seed ask **R300,000**, negotiable up to 15% equity or 10% of gross revenue for 3 years.
Beachhead market: black South African first-salary earners, 21–30, metros, R10,000–R35,000/month.

---

## Repo map (quick reference)

```
src/app/(app)/          learn, lesson, course, budget, calculator, quests, leaderboard, profile, settings
src/app/api/            budget import/report, coach chat, crons, admin broadcast, account export/delete
src/components/         BudgetPlanner, CosmoCoachChat, StokvelDashboard, InteractiveReportModal, ...
src/components/views/   LearnView, LessonView, CourseView, OnboardingView, QuestsView
src/data/               content*.ts (lesson source), banks/ (premium question banks), concepts.ts
src/lib/                lessonBank, lessonMastery, budget/ (parsers + report), coach/, emails/, push/
supabase/migrations/    ~39 migrations; edge functions for email, push, account deletion
docs/                   SA-REGULATORY-FIGURES, REBRAND-NOTHO, LESSON-BANK-ARCHITECTURE, DNS-NOTHO, ...
Business/               business plan, pitch deck, build playbook, app store guide
HANDOFF-NEXT-CHAT.md    the live work stream: remaining lesson banks
```
