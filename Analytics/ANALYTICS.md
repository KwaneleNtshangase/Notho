# Notho — PostHog Analytics Playbook

Everything you need to know about what is tracked, how funnels are built in PostHog, and what decisions each metric should drive.

---

## Core Principle

Every metric here exists to answer one question: **are users actually becoming more financially literate?** Not just engaged, not just retained. Genuinely learning and changing behaviour. If a metric does not tie back to that, it is noise.

---

## Event Reference

All events live in `src/lib/analytics.ts` and are called via the `analytics.*` helper. Do not call `posthog.capture()` directly anywhere else.

### Onboarding Funnel Events

| Event | When to fire | Key props |
|---|---|---|
| `onboarding_started` | User hits `/` with no session | none |
| `onboarding_goal_selected` | User taps a goal card | `goal` |
| `onboarding_profile_completed` | User submits age range step | `ageRange` |
| `signup_completed` | Supabase auth signup succeeds | `method` |

**Where to fire in code:** in the onboarding page component, after each step transition and after the Supabase `signUp()` call resolves successfully.

### Learning Funnel Events

| Event | When to fire | Key props |
|---|---|---|
| `lesson_started` | User taps "Start" on a lesson card | `courseId`, `lessonId`, `lessonTitle` |
| `lesson_step_viewed` | Each step renders | `stepIndex`, `stepType`, `progressPct` |
| `wrong_answer` | User submits an incorrect answer | `stepIndex`, `stepType` |
| `lesson_abandoned` | User exits mid-lesson | `completionPercent` |
| `lesson_completed` | `completeLesson()` resolves | `xpEarned`, `isPerfect`, `timeSeconds` |
| `first_lesson_completed` | First-ever lesson, calculated from signup | `hoursSinceSignup` |
| `lesson_rated` | User taps thumbs up/down (Phase 1 feature) | `rating` (5=up, 1=down) |
| `course_completed` | All lessons in a course done | `badgeName` |

### Retention Events

| Event | When to fire | Key props |
|---|---|---|
| `streak_updated` | Streak increments after lesson | `streakDays` |
| `streak_broken` | Login detected but streak missed | `previousStreak` |
| `streak_freeze_used` | RPC `use_streak_freeze` returns ok | `freezesRemaining`, `streakDays` |
| `streak_freeze_exhausted` | User tries to freeze with 0 left | `streakDays` |
| `retention_ping` | App open at Day 1, 7, 30 post-signup | `cohort` |

**How to detect retention_ping:** on app load, compare `user.created_at` to `Date.now()`. If the delta is 24h (Day 1), 7d (Day 7), or 30d (Day 30), fire once per cohort (guard with a localStorage flag per cohort key so it only fires once per user per milestone).

### Paywall + Subscription Events

| Event | When to fire | Key props |
|---|---|---|
| `paywall_shown` | Locked lesson card tapped | `lessonId`, `courseId`, `trigger` |
| `paywall_cta_clicked` | "Upgrade" button tapped | `plan` |
| `checkout_started` | Payment sheet opens | `plan`, `priceZar` |
| `subscription_converted` | Webhook confirms payment | `plan`, `priceZar`, `method` |
| `subscription_cancelled` | Cancellation webhook received | `plan`, `daysActive` |

### Behavioural Outcome Events

These are the most important events in the system. They answer "did the lesson lead to a real financial action?"

| Event | When to fire | Key props |
|---|---|---|
| `budget_opened_post_lesson` | Budget tab opened within 10 min of `lesson_completed` | `courseId`, `lessonId` |
| `savings_goal_set` | User sets/updates a savings target | `savingsAmount` |
| `expense_logged` | User adds a budget entry | `category`, `amount` |
| `content_impact_survey` | 30-day in-app survey submitted | `rating`, `daysSinceSignup` |

### PWA Events

| Event | When to fire |
|---|---|
| `pwa_install_prompt_shown` | `beforeinstallprompt` fires |
| `pwa_installed` | `appinstalled` fires |
| `pwa_install_dismissed` | User declines the prompt |

---

## The 5 Funnels to Build in PostHog

Go to PostHog -> Funnels. Create each of these. Set the date range to rolling 30 days. Conversion window: 7 days (except Onboarding which should be 1 hour).

### Funnel 1: Onboarding to First Lesson

Steps:
1. `onboarding_started`
2. `signup_completed`
3. `lesson_started`
4. `lesson_completed`

**Target conversion:** 60% from signup to first lesson within 24 hours.
**Alarm:** if step 2 to 3 drops below 50%, the onboarding-to-lesson bridge is broken. Check the home screen CTA.

### Funnel 2: Learning Habit Formation (Streak)

Steps:
1. `first_lesson_completed`
2. `lesson_completed` (Day 3 — use PostHog's "within N days" filter)
3. `streak_updated` where `streakDays >= 7`
4. `streak_updated` where `streakDays >= 30`

**Target:** 15% of users reach a 7-day streak. 5% reach 30 days.
**Alarm:** if 7-day streak rate drops below 10%, check whether `streak_broken` events cluster around a specific day (e.g. always breaks at Day 4 — that is your friction point).

### Funnel 3: Paywall Conversion

Steps:
1. `paywall_shown`
2. `paywall_cta_clicked`
3. `checkout_started`
4. `subscription_converted`

**Target:** 8% of users who hit the paywall convert within 14 days.
**Alarm:** if step 1 to 2 is below 20%, the paywall design is not compelling enough. If step 3 to 4 drops off, there is a payment friction issue (check PayFast vs Stripe split).

### Funnel 4: Content to Behaviour Bridge

Steps:
1. `lesson_completed` (filter: courseId = any budget-related course)
2. `budget_opened_post_lesson` (within 10 minutes)
3. `budget_entry_added` or `savings_goal_set`

**Target:** 25% of users who complete a budget lesson open the planner within 10 minutes.
**Why this matters:** this is the single strongest predictor of whether Notho is actually changing financial behaviour, not just teaching it. If this is low, the lesson-to-action bridge needs work: stronger CTA on the completion screen, or better placement of the budget tool.

### Funnel 5: 30-Day Content Impact

Steps:
1. `signup_completed`
2. `lesson_completed` (at least 10 total — use "completed at least N times" filter)
3. `content_impact_survey` where `rating >= 4`

**Target:** 40% of users who complete 10+ lessons and reach Day 30 rate the content 4 or 5 out of 5.
**Alarm:** if this drops below 30%, run a breakdown by `lessonId` on `lesson_rated` events to find which specific lessons are rated poorly. Those get rewritten first.

---

## Dashboards to Build

### Dashboard: Daily Health

- DAU (unique users with any event, rolling 1d)
- Lesson completions today
- `streak_broken` count (daily spike = something went wrong)
- `paywall_shown` count
- `subscription_converted` count

### Dashboard: Weekly Retention

- D1 / D7 / D30 retention curves (cohort analysis on `signup_completed` as the start event, any event as the return event)
- Streak length distribution (histogram on `streak_updated.streakDays`)
- `streak_freeze_used` vs `streak_broken` ratio (if broken >> freeze_used, users do not know freeze exists)

### Dashboard: Content Quality

- Lesson completion rate per lesson (completions / starts, bar chart sorted ascending — the short bars need attention)
- Wrong answer rate per lesson (sorted descending — the tall bars need easier questions or better explanations)
- `lesson_rated` average per course
- `budget_opened_post_lesson` rate (content-to-behaviour bridge metric)

---

## Identify Calls

In the PostHog provider or after login, call:

```typescript
posthog.identify(user.id, {
  platform: "web",
});
```

The distinct id is the Supabase user id. Do not send email, name, username, phone, statement text, or raw rand amounts. `identifyProperties` drops those keys, and sign-in also unsets them if an older build stored them.

---

## Feature Flags to Create Now

Create these in PostHog before you need them. They are free to add and make future rollouts risk-free.

| Flag key | Default | Use |
|---|---|---|
| `paywall_enabled` | `false` | Gates the freemium wall. Flip to true at launch. |
| `streak_freeze_enabled` | `true` | Kill-switch if the freeze mechanic has a bug. |
| `pwa_install_prompt_enabled` | `false` | Enable after testing install flow. |
| `d7_email_enabled` | `false` | Enable after Resend D+7 template is published. |
| `d14_email_enabled` | `false` | Enable after Resend D+14 template is published. |
| `d30_email_enabled` | `false` | Enable after Resend D+30 template is published. |
| `content_impact_survey_enabled` | `false` | Show 30-day survey only to users with 10+ lessons. |
| `session-replay-enabled` | on if missing | Kill switch for masked session replay. An explicit `false` stops recording. If the flag does not exist or flags fail to load, recording stays on and `POSTHOG_SESSION_REPLAY=off` is the hard stop. |

---

## The "Delete Before Adding" Rule

Before shipping any new feature, check its WAU in PostHog. If a feature has been live for 30+ days and its core event appears in fewer than 5% of weekly active users, remove it from the UI. Do not add complexity that most users never touch.

Run this query monthly:
- Event: any feature-specific event
- Filter: distinct users, last 7 days
- Divide by DAU
- Flag anything below 5%

This keeps the app fast, focused, and genuinely useful.
