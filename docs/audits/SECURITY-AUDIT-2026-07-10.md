# Notho — Security Audit

**Date:** 10 July 2026
**Scope:** Full codebase — Next.js app (`src/`), API routes, Supabase migrations & edge functions, config, dependencies.
**Stack:** Next.js 16.1.6 · React 19 · Supabase (Postgres + Auth + Edge Functions) · Resend · deployed on Vercel.

## Summary

Overall the app follows good patterns: RLS is enabled on user tables, API routes verify the caller's Supabase JWT and scope every query by the authenticated `user.id`, security headers are strong, and lesson HTML is sanitised with DOMPurify. No hardcoded private secrets are committed (the values in `.env.local` are the Supabase anon key and PostHog public key, both public by design, and the file is gitignored).

The issues below are ranked by real-world risk. The two worth acting on first are the **outdated Next.js version** (many known CVEs) and the **unauthenticated error-report endpoint**.

---

## High

### H1 — Outdated Next.js with multiple known CVEs
`package.json` pins `next@16.1.6`. `npm audit` reports **1 high + 1 moderate** vulnerability, and the advisory list includes several App-Router issues directly relevant to this app: middleware/proxy bypass, DoS via Server Components / Image Optimization, SSRF via WebSocket upgrades, cache poisoning, and XSS in CSP-nonce apps.

- **Impact:** Auth/route-protection bypass, denial of service, cache poisoning against production users.
- **Fix:** Upgrade to the latest patched Next.js (`npm audit fix --force` proposes 16.2.10) and re-run the e2e suite. Add `npm audit` to CI so this is caught automatically.

### H2 — `/api/errors/report` is unauthenticated, unthrottled, and writes via the service role
`src/app/api/errors/report/route.ts` treats the user as optional (`getUserFromRequest(...).catch(() => null)`), then uses the **service-role** client to `INSERT` into `feedback` and sends an alert email via Resend. There is no rate limiting and no origin check.

- **Impact:**
  - **Abuse / cost DoS:** anyone on the internet can flood the `feedback` table and burn Resend send quota (and money) by POSTing repeatedly.
  - **Email HTML injection:** attacker-controlled `area`, `message`, and `url` are interpolated **unescaped** into the alert email HTML sent to the admin inbox (`kwanelebc031@gmail.com`), allowing crafted markup/links in the team's inbox.
- **Fix:** Require an authenticated session (or a signed token), add rate limiting per IP/user, cap payload volume, and HTML-escape all user-supplied fields before putting them in email markup. The 24h throttle only limits duplicate *identical* subjects, so varying the message defeats it.

### H3 — Leaderboard RPC leaks real names to anonymous callers
`supabase/migrations/20260414000000_leaderboard_rpc.sql` defines `get_leaderboard()` as `SECURITY DEFINER` (bypasses RLS) and `GRANT EXECUTE ... TO anon, authenticated`. It returns `full_name` and `age_range` for **every** registered user.

- **Impact:** An unauthenticated caller can enumerate the full names and age ranges of all users — a personal-data exposure and a POPIA concern for a South African finance app.
- **Fix:** Restrict execution to `authenticated` only, and return a display handle (username) rather than `full_name`, or have users opt into showing their real name on the leaderboard.

---

## Medium

### M1 — CSP allows both `'unsafe-inline'` and `'unsafe-eval'` for scripts
`next.config.ts` sets `script-src 'self' 'unsafe-inline' 'unsafe-eval' ...`. This substantially weakens the CSP's value as an XSS backstop — an injected inline script would execute. The file documents this as a deliberate tradeoff for inline bootstrapping and PostHog.

- **Fix (longer-term):** Move to nonce/`strict-dynamic` CSP and drop `unsafe-eval` if nothing genuinely needs it. Even removing only `unsafe-eval` is a meaningful hardening.

### M2 — Admin authorization relies on an email allowlist with a hardcoded fallback
`src/lib/admin.ts` grants admin access purely by matching the authenticated user's email against `ADMIN_EMAILS`, falling back to a **hardcoded list** if that env var is unset. All `/api/admin/*` routes (broadcast to all users, list all emails, DNS/Resend data) depend on this single check.

- **Impact:** No defence-in-depth beyond the email match; if the env var is ever unset in an environment, the fallback silently applies. The broadcast route can email up to 20,000 users.
- **Fix:** Store an explicit `is_admin` flag/role in the database (checked server-side) rather than an email list, and remove the hardcoded fallback so a misconfiguration fails closed, not open.

---

## Medium (continued)

### M3 — Push edge function trusts `user_id` from the request body
`supabase/functions/send-push-notifications/index.ts` (`budget-alert` mode) sends a push to whatever `user_id` is in the body. The Next.js wrapper (`/api/budget-alert`) does verify `user_id === user.id`, but the edge function itself does no such check. If the function is deployed with JWT verification disabled (or callable with any valid anon JWT), a user could trigger pushes to another user's devices.

- **Fix:** Confirm the function is deployed with `verify_jwt` enabled, and derive `user_id` from the verified JWT inside the function rather than from the request body.

---

## Low / Hygiene

- **L1 — Dead XSS sink:** `src/app/pageViews.old.tsx` uses `dangerouslySetInnerHTML` **without** DOMPurify (unlike `LessonView.tsx`, which sanitises). It is not imported anywhere (confirmed — only `pageViews.types` is used), so it is dead code. Delete it so it can't be reintroduced into a route.
- **L2 — Repo litter / potential info leak:** test scripts with test credentials (`check_auth.js`, `test-insert.js`, `test-query.js`), scratch files (`temp.tsx` ~219 KB, `page_content.html`, `scratch_query_categories.ts`), and large screenshots are committed. These bloat the repo and shouldn't ship. Move to a gitignored scratch area or delete.
- **L3 — `postcss` transitive XSS advisory** surfaced by `npm audit`; resolved by the same Next.js upgrade in H1.
- **L4 — SECURITY DEFINER functions:** the streak/leaderboard functions correctly set `search_path = public`. Keep that on every future `SECURITY DEFINER` function to prevent search-path hijacking.
- **L5 — Verify `.env.local` was never committed historically.** It's gitignored now (good); confirm it isn't present anywhere in git history. If in doubt, rotating the anon key is cheap insurance (though the anon key is not itself a secret).

---

## What's solid (no action needed)

- RLS enabled and correctly scoped on `user_progress`, `profiles` (challenge tables), `custom_budget_categories`, `user_settings`, `budget_import_batches`, `user_merchant_rules`, `bank_accounts`, and the stokvel tables (`auth.uid() = user_id` / membership checks).
- API routes consistently verify the Supabase JWT via `getUserFromRequest` and filter every service-role query by `user.id` (`account/export`, `account/delete`, `budget/*`, `progress/sync-streak`, `feedback-email`). No missing user-scope filters found.
- Cron route (`/api/cron/lifecycle`) is protected by a `CRON_SECRET` bearer check.
- File upload (`budget/import/parse`) enforces a 5 MB cap and a file-type allowlist (CSV/OFX/PDF).
- Strong security headers: HSTS w/ preload, `frame-ancestors 'none'`, `X-Content-Type-Options: nosniff`, restrictive `Permissions-Policy`, `object-src 'none'`.
- Delete-account edge function re-verifies the caller's JWT before using the service role.
