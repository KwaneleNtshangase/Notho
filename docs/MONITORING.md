# Monitoring Notho

What is watching the app, what each layer can and cannot catch, and what to do
when one of them goes red.

---

## Why more than one layer

No single check tells you the app is healthy, and it is worth being precise
about why, because this repo has already been burned by assuming otherwise.

Until 3 Aug 2026 the health check contained this fallback: if the sign-in form
never appeared, pass anyway as long as `document.title` contained "notho". That
title is server-rendered. It is present when Supabase is down, when the client
bundle 404s, when React never mounts. **The check could not fail for the one
condition it existed to detect.** Every green run was evidence of nothing.

So the layers below are chosen to fail for *different* reasons. If they all pass,
that means something.

| Layer | Runs | Catches | Blind to |
|---|---|---|---|
| **External uptime monitor** | every 1–5 min | host down, TLS expired, DNS gone, Supabase unreachable | anything client-side |
| **Health Check workflow** | every 30 min + on push | app fails to boot in a real browser, JS errors, backend degraded | anything past the landing screen |
| **E2E tests** | on push + daily 05:00 | sign-in, lessons, budget, calculator actually work | performance, slow regressions |
| **CI** | every push and PR | type errors, failing unit tests, build breakage | anything only visible at runtime |
| **Lighthouse** | on push + Mondays | performance and accessibility regressions | correctness |

The gap worth understanding: **the health check only tests the signed-out
landing screen.** Everything behind auth — lessons, budget import, the
calculator — is covered by E2E, which runs far less often. A bug that only
affects signed-in users can be live for up to a day before E2E notices.

---

## Layer 1 — external uptime monitor (you need to set this up)

GitHub's scheduled workflows are best-effort. Under load GitHub delays or drops
scheduled runs, so `*/30 * * * *` means "roughly every 30 minutes", not a
guarantee. It also cannot tell you the site is down while GitHub Actions itself
is having an incident. An external monitor is the only layer with a hard floor
on detection time, and it is the only one that reaches your phone.

### What to point it at

**`https://www.notho.co.za/api/health`** — not the homepage.

The homepage returns 200 with correct branding even when the app is broken.
`/api/health` checks the dependencies the app cannot work without and returns
**503** when one is down. It returns:

```json
{
  "status": "ok",
  "deployment": "dpl_xxx",
  "commit": "b5e04ef",
  "checkedAt": "2026-08-03T18:40:00.000Z",
  "totalMs": 142,
  "checks": {
    "config":   { "ok": true, "ms": 0 },
    "supabase": { "ok": true, "ms": 141 }
  }
}
```

It deliberately reports only *whether* a dependency answered, never what it
said — no row counts, no schema, no env values, no upstream error bodies. It is
a public endpoint, so it is safe to expose but not to make chatty.

### Setup — UptimeRobot (free tier, 5-minute checks)

1. Sign up at **uptimerobot.com**.
2. **Add New Monitor**:
   - Monitor Type: `HTTP(s)`
   - Friendly Name: `Notho — API health`
   - URL: `https://www.notho.co.za/api/health`
   - Monitoring Interval: `5 minutes` (1 minute needs a paid plan)
3. **Advanced → Alert if status code is NOT** `200`.
   This is the setting that matters. Left at the default the monitor treats any
   response as "up", which would ignore the 503 the endpoint returns when
   Supabase is down — the exact case you are paying attention for.
4. **Alert Contacts:** install the UptimeRobot mobile app and enable push. Email
   alone will not reach you, on the evidence of the inbox this was meant to
   land in.
5. Add a second monitor on `https://www.notho.co.za/` with keyword type
   `Notho`, as a plain "is the site serving" signal.

### Setup — BetterStack (free tier, 3-minute checks, nicer alerting)

Same URL and the same "expect 200" rule. BetterStack's free tier includes phone
call escalation, which UptimeRobot charges for. Either is fine; the important
part is that it is not GitHub Actions and it reaches your phone.

---

## Layer 2 — the Health Check workflow

`.github/workflows/health-check.yml`, running `scripts/health-check.js` in a
real Chromium browser every 30 minutes.

What it asserts, in the order that matters:

1. **HTTP status is not an error**, and the redirect chain is reported. Any
   redirect is a warning — `BASE_URL` should already be the canonical host.
2. **The page is not blank.**
3. **The app booted.** Requires an interactive control rendered by React: the
   landing screen's buttons, a complete auth form, or `.app-container` for a
   live session. **Nothing here is satisfied by static HTML.** This is the
   check that replaced the branding fallback, and the one to read first when
   the workflow goes red.
4. **Branding is correct** — catches serving the wrong app entirely.
5. **No unexpected console errors.** Only analytics, favicon, realtime
   reconnects and push permissions are ignored, each with a stated reason.
   `Failed to load resource`, `404` and CSP violations now **fail**, because
   that is what a missing JS chunk and a broken CSP look like.
6. **Backend dependencies**, via `/api/health`.

Load time is a **warning**, not a failure (`SLOW_MS`, default 8000). A cold
Vercel lambda on a shared runner is slow without being broken, and an alert that
fires at 03:00 for that is an alert you will learn to ignore.

### Alerting behaviour

One rolling incident issue, labelled `health-check-failure`:

- First failure **opens** an issue.
- Later failures **comment** on it.
- The first passing run **closes** it.

So an open `health-check-failure` issue means the app is broken *right now*.
Do not close one by hand while the check is still red — it will just reopen,
and you will have taught yourself to ignore it again.

### Running it yourself

```bash
npm run test:health                              # against www.notho.co.za
BASE_URL=http://localhost:3000 npm run test:health   # against local dev
SLOW_MS=15000 npm run test:health                # looser timing budget
```

---

## Layer 3 — E2E

41 Playwright tests across Desktop Chrome, Mobile Safari and Mobile Chrome,
covering auth, lesson flow, budget, gamification, profile and the calculator.

These sign in as a **real Supabase account** (`TEST_EMAIL` / `TEST_PASSWORD`).
When E2E fails and the health check passes, suspect that account before
suspecting the app: a rotated password or a changed onboarding state fails every
spec at the sign-in step and looks like a total outage.

```bash
npm run test:smoke     # auth + lesson flow, Desktop Chrome only, fast
npm test               # everything, all three browsers, slow
npm run test:report    # open the HTML report from the last run
```

---

## Layer 4 — CI

Runs on every push and PR: typecheck, **unit tests**, dependency audit, build.

The audit step is `continue-on-error` and writes to the job summary. A new
advisory can land against a dependency with no change on your side, and a
blocking gate there turns main red for something no commit caused — which
trains people to ignore a red main. Read the summary; act deliberately.

The unit tests are **blocking**. When running them locally, pass no extra
arguments:

```bash
npm run test:unit        # correct — all ~30 files
npm run test:unit # note  # WRONG: "note" becomes a filename filter
```

Vitest treats positional arguments as filename filters. A stray trailing word
silently runs a subset and still reports green. This has already caused a false
all-clear once.

---

## When something goes red

**Health check red, site loads fine in your browser.**
Read which check failed. `App booted` failing while you can use the site
usually means a deploy landed mid-run, or a chunk 404 that only affects cold
loads. Re-run the workflow. If it fails twice, believe it — try a hard reload
in a private window, which is closer to what the check sees.

**Health check red, `/api/health` returns 503.**
Check `checks.supabase.ok`. If false, look at status.supabase.com and your
project's dashboard. If `checks.config.ok` is false, an environment variable is
missing in Vercel — that is a deploy configuration problem, not an outage.

**E2E red, health check green.**
Almost always the test account or a changed selector, not an outage. Open the
Playwright HTML report artifact from the run; it has a screenshot and video of
the exact moment of failure.

**Everything red at once.**
Suspect shared configuration before suspecting the app. That is what happened on
3 Aug 2026: all three workflows shared one stale `BASE_URL` default pointing at
a domain that had started redirecting.

---

## Known gaps

Worth stating plainly rather than discovering later.

- **Signed-in surface is only checked daily.** The health check stops at the
  landing screen. A bug behind auth can live for up to a day.
- **No alert when the health check itself stops running.** If the workflow is
  disabled, or GitHub silently drops the schedule, nothing tells you. The
  external monitor is the mitigation — it is the only layer that does not
  depend on GitHub Actions.
- **No performance budget enforcement in the health check.** Load time is a
  warning only. Lighthouse covers this properly, but weekly.
- **`/api/health` does not check Resend.** Outbound email can be broken while
  everything here is green. Watch the Resend dashboard after any change to
  `MAIL_FROM_ADDRESS` — see `docs/EMAIL-MIGRATION-NOTHO.md`.

---

## Open question: unbounded question re-queue

Not a monitoring gap — a product decision that hasn't been made. Recorded here
because it was found while fixing the E2E suite and would otherwise be lost.

`src/app/(app)/lesson/[courseId]/[lessonId]/page.tsx`, in the wrong-answer branch:

```ts
mistakenQids,                                  // deduplicated
steps: [...prev.steps, requeuedCopy(step)],    // not
```

A missed question is appended to the end of the lesson so it comes back. Good:
that is mastery-based repetition working as intended. But the append is not
gated on `mistakenQids`, so **a question missed three times is appended three
times**. There is no cap.

For most users this is invisible — they get a question wrong once, see it again,
get it right. The person it affects is the one who keeps missing the same
concept, whose lesson keeps growing while they are already struggling. In an app
whose purpose is building financial confidence, that is worth deciding on
deliberately rather than by default.

It is also what made the lesson E2E specs unfixable for four attempts. They
answered by clicking the first option, wrong roughly three times in four, so the
lesson grew faster than the tests consumed it — `stepIndex` was observed passing
102 inside a single lesson. No iteration budget could ever be large enough. The
specs now learn the correct answer from the app's own feedback and replay it
when a question returns (`answerCurrentQuestion` in `e2e/helpers.ts`), which
sidesteps the issue without changing app behaviour.

**Three options, if you decide to act:**

1. **Leave it.** Repetition until mastery is the point. Accept that a struggling
   user gets a longer lesson — arguably the correct outcome.
2. **One pending copy per question.** Append only if that `qid` is not already
   queued. A missed question returns once per pass rather than once per mistake.
3. **Cap total re-queues per lesson.** Bounds worst-case length regardless of
   how the mistakes are distributed.

Whichever you pick, the reducer is unit-testable without a browser, so this
belongs in `src/lib/__tests__/` rather than in E2E.
