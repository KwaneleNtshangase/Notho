# Google — Play Console: every field, in console order

Copy each block straight into the matching field.

**Package name:** `za.co.notho.app` — permanent once uploaded. Must match the Apple bundle ID and your Capacitor config.
**Default language:** English (South Africa)
**App or game:** App · **Free or paid:** Free

---

## 1. Main store listing

| Field | Value |
|---|---|
| App name (30 max) | `Notho: Money Skills SA` |
| Category | Education |
| Tags | Personal finance, Education, Self-improvement |
| Contact email | `support@notho.co.za` |
| Contact website | `https://www.notho.co.za` |
| Privacy Policy | `https://www.notho.co.za/privacy` |

### Short description (80 max)

```
Learn money skills in 3-minute lessons. Built for South Africa. Free.
```

### Full description (4000 max)

```
Notho is the money-skills app built for South Africa. Learn how money actually works here, in rands, with local banks and local costs, through lessons short enough to finish on the ride home.

LEARN IN 3 MINUTES A DAY
Short, interactive lessons on budgeting, saving, debt, credit and the basics of investing. Every lesson ends with a quiz, so what you learn actually sticks.

SEE WHERE YOUR MONEY WENT
Import your bank statement as a PDF, CSV, OFX or QFX file and Notho sorts your transactions into categories for you. Built-in support for Capitec, FNB, Standard Bank and Discovery, with a general reader that handles most other South African banks.

You never give Notho your banking login. You upload your own statement, and that is the only way your transactions ever reach the app.

BUILD A BUDGET YOU WILL ACTUALLY KEEP
Set a target for each category, watch your spending against it through the month, and download a plain-English monthly report that shows what changed and why.

ASK COSMO, YOUR MONEY COACH
Cosmo is an optional AI helper that answers questions about your own budget in everyday language. It explains, it never sells. Cosmo sees only anonymised category totals, never your merchant names, transaction descriptions or personal details, and it is switched off until you turn it on.

STAY MOTIVATED
Earn XP for every lesson, build a daily streak, take on challenges and see where you land on the leaderboard.

BUILT FOR SOUTH AFRICA
Rands, not dollars. South African banks. Examples drawn from how money really moves here, from prepaid electricity and taxi fare to the stretch between payday and month-end.

YOUR PRIVACY
- We never sell your personal information.
- We never ask for your banking login or connect to your bank account.
- We do not collect card numbers, account numbers or ID numbers.
- You can export everything we hold on you, and delete your account and all of your data, from inside the app at any time.
- Built to comply with the Protection of Personal Information Act (POPIA).

IMPORTANT
Notho is a financial education platform. The Solution Org (Pty) Ltd is not a registered financial services provider under the Financial Advisory and Intermediary Services Act (FAIS Act, 2002), and Notho does not provide financial, investment, tax or legal advice. Lessons, calculators, budgets and projections are general and illustrative only. For advice about your own circumstances, speak to an FSCA-registered financial adviser. You can verify any adviser's licence at fsca.co.za.

Questions or feedback: support@notho.co.za
```

### Graphics

| Asset | File |
|---|---|
| App icon (512×512) | `store-launch/03-icons/store/play-store-icon-512.png` |
| Feature graphic (1024×500) | `store-launch/04-graphics/play-feature-graphic-1024x500.png` |
| Phone screenshots (min 2, max 8) | `store-launch/05-screenshots/final/android-phone/` |

---

## 2. Data safety — exact answers

This is where roughly 40% of Play rejections happen. Every row below is traced to actual code, so it will match what Google's scanner sees.

**Overview answers**

| Question | Answer |
|---|---|
| Does your app collect or share any of the required user data types? | **Yes** |
| Is all of the user data collected by your app encrypted in transit? | **Yes** (HTTPS everywhere) |
| Do you provide a way for users to request that their data is deleted? | **Yes** — `https://www.notho.co.za/privacy#data-deletion`, plus in-app Settings → Delete account |

### Data types — collected / shared / purpose

Nothing is **shared** in Google's sense (no third party uses it for their own purposes) — service providers acting on your instructions don't count as sharing. Answer **"Collected: Yes / Shared: No"** on every row.

| Category | Data type | Collected | Processed ephemerally | Required or optional | Purposes |
|---|---|---|---|---|---|
| Personal info | Name | Yes | No | Required | App functionality, Account management |
| Personal info | Email address | Yes | No | Required | App functionality, Account management |
| Personal info | User IDs | Yes | No | Required | App functionality, Account management |
| Financial info | Other financial info | Yes | No | Optional | App functionality |
| Messages | Other in-app messages | Yes | No | Optional | App functionality |
| Files and docs | Files and docs | Yes | **Yes** | Optional | App functionality |
| App activity | App interactions | Yes | No | Required | Analytics, App functionality |
| App activity | Other user-generated content | Yes | No | Optional | App functionality |
| App info and performance | Crash logs | Yes | No | Required | App functionality |
| App info and performance | Diagnostics | Yes | No | Required | App functionality |
| Device or other IDs | Device or other IDs | Yes | No | Required | Analytics |

**Row-by-row justification** (keep this for your own records):

- **Name / Email / User IDs** — Supabase auth, plus Google and Facebook OAuth sign-in.
- **Other financial info** — budget entries and transactions parsed from user-uploaded statements (`budget_entries`, `budget_targets`, `bank_accounts`). **Do not** tick *User payment info*, *Purchase history* or *Credit score*; Notho collects none of them.
- **Other in-app messages** — Cosmo chat messages stored in `coach_ai_logs`. Optional, because the coach is off until the user consents.
- **Files and docs** — the statement file the user uploads. Tick **"Processed ephemerally"**: `/api/budget/import/parse` parses it in memory with a 5 MB cap and never writes it to storage. Only the extracted transactions are saved.
- **App interactions** — PostHog product analytics and `feature_events`.
- **Other user-generated content** — custom categories, merchant rules, feedback.
- **Crash logs / Diagnostics** — `/api/errors/report`.
- **Device or other IDs** — PostHog distinct ID and the push subscription endpoint.

### Explicitly NOT collected — leave unticked
Location (approximate or precise), Health and fitness, Photos, Videos, Audio, Contacts, Calendar, SMS or call log, Web browsing history, Installed apps, Payment info, Purchase history, Credit score, Race and ethnicity, Political or religious beliefs, Sexual orientation.

---

## 3. AI-generated content declaration — REQUIRED

Play's Generative AI policy applies: Notho ships Cosmo, powered by Google Gemini.

Answer **Yes** to "Does your app use generative AI?" and provide:

```
Notho includes Cosmo, an optional AI chat coach powered by Google Gemini (gemini-3.5-flash).

Safeguards:
- Off by default. Requires explicit in-app consent before any message is sent.
- A user-facing label states that Cosmo is AI and can make mistakes.
- Only anonymised aggregate budget figures (category totals, monthly income) are sent to the model. No names, emails, merchant names, transaction descriptions or account numbers.
- A system prompt restricts output to financial EDUCATION. Cosmo is instructed never to name or recommend specific financial products, providers, funds or shares, and to redirect such questions to a registered financial adviser.
- Rate limited to 10 messages per user per day, 500 characters per message.
- All conversations are logged server-side for abuse review.
- Users can report a problematic response via in-app feedback (support@notho.co.za).
```

---

## 4. Content rating questionnaire

Category: **Reference, News, or Educational**

| Question | Answer |
|---|---|
| Violence of any kind | No |
| Sexuality / nudity | No |
| Language (profanity) | No |
| Controlled substances | No |
| Gambling or simulated gambling | No |
| Crude humour | No |
| Horror or fear themes | No |
| Does the app allow users to interact or exchange content? | **Yes** — leaderboard displays other users' display names and XP |
| Can users share their location with others? | No |
| Does the app allow purchase of digital goods? | No |
| Does the app contain user-generated content shared with others? | No — budgets and chats are private to each user |
| Does the app share personal info with third parties? | No |

Expected result: **PEGI 3 / ESRB Everyone / rated for 3+**

---

## 5. App access (for the review team)

Notho requires sign-in, so Google needs credentials or it will reject on "cannot access".

Select **"All or some functionality is restricted"** and add:

| Field | Value |
|---|---|
| Name of instructions | Full app access |
| Username | *[create a demo account and put it here]* |
| Password | *[password]* |
| Any other instructions | See block below |

```
Sign in with the email and password above. The demo account already has lessons completed and a sample budget imported, so every feature is reachable without uploading a real bank statement.

To test the AI coach: open Budget > Cosmo, accept the consent prompt, then ask a question.
To test account deletion: Settings > Delete account.
```

---

## 6. Target audience and content

| Field | Value |
|---|---|
| Target age groups | 13–15, 16–17, 18+ |
| Appeals to children? | No |
| Is your app a "News" app? | No |
| Does your app have ads? | **No** |
| Contains ads declaration | No |

> Selecting 13+ keeps you out of the Families policy programme, which carries much heavier requirements. Notho's content and the sign-in requirement make 13+ the honest answer.

---

## 7. Financial features declaration

Play asks apps in the finance space to declare what they do. Notho is **education**, not a financial product.

| Question | Answer |
|---|---|
| Does your app provide personal loans? | No |
| Is your app a banking or e-money app? | No |
| Does your app facilitate investments or trading? | No |
| Does your app provide financial advice? | **No** — education only, explicitly non-FSP under FAIS |
| Does your app aggregate bank account data via an API or credentials? | **No** — users upload their own statement files; no bank connection, no credentials, no screen scraping |
| Does your app handle payments? | No |

> That "no bank connection" answer matters. Apps that aggregate account data need extra licensing evidence; Notho does not, because the user does the exporting.

---

## 8. The 14-day closed test — plan for this now

Any Play developer account opened after **13 November 2023** must run a closed test with **at least 12 testers who stay opted in for 14 consecutive days** before production access unlocks. There is no way around it and it is the single longest item on your timeline.

**Start this on day one of the launch process, not at the end.**

- [ ] Create a closed test track
- [ ] Upload the `.aab`
- [ ] Recruit 12+ real people with real Google accounts (family, friends, colleagues, early users)
- [ ] Send them the opt-in link — they must **install and stay opted in for 14 straight days**
- [ ] Watch Android Vitals for crashes and ANRs during the window
- [ ] After 14 days, apply for production access

---

## 9. Technical requirements

| Requirement | Value |
|---|---|
| Format | Android App Bundle (`.aab`) — APK not accepted for new apps |
| Target API level | **36** (mandatory from 31 August 2026 — you are past this date, so 36 it is) |
| Min SDK | 24 (Android 7.0) — Capacitor 7 default |
| Signing | Play App Signing enabled; keep your upload keystore backed up |

> Losing the upload keystore means you can never update the app under this package name. Back it up somewhere that is not your laptop.

---

## Checklist

- [ ] Play Console account paid ($25) and identity verified (government ID + address proof — allow 48h)
- [ ] App created with package `za.co.notho.app`
- [ ] Store listing complete (§1)
- [ ] Icon, feature graphic, ≥2 screenshots uploaded
- [ ] Data safety form completed exactly as §2
- [ ] Generative AI declared (§3)
- [ ] Content rating questionnaire done (§4)
- [ ] Demo account added under App access (§5)
- [ ] Target audience set to 13+ (§6)
- [ ] Financial features declared (§7)
- [ ] Closed test running with 12+ testers (§8) ← **start this first**
- [ ] 14 days elapsed → apply for production
- [ ] Submit
