# Apple — App Store Connect: every field, in console order

Copy each block straight into the matching field. Nothing here needs rewriting.

**Bundle ID:** `za.co.notho.app` — reverse-DNS of notho.co.za. Permanent once created; change it here *before* you create the App ID if you'd rather use something else.
**SKU:** `NOTHO-IOS-001`
**Primary language:** English (South Africa)

---

## 1. App Information

| Field | Value |
|---|---|
| Name (30 max) | `Notho: Money Skills SA` |
| Subtitle (30 max) | `Learn money, build wealth` |
| Primary category | Education |
| Secondary category | Finance |
| Content rights | Contains no third-party content |
| Age rating | 4+ (see §6) |

> **Why Education first:** your ranking competition in Finance is banking apps with huge budgets. Education is where Notho actually competes, and Apple allows Finance as secondary so you still surface in finance searches.

**Privacy Policy URL:** `https://www.notho.co.za/privacy`
**Support URL:** `https://www.notho.co.za/security`
**Marketing URL:** `https://www.notho.co.za`

---

## 2. Promotional Text (170 max)

```
Import your bank statement and see exactly where your money went last month. Then ask Cosmo, your money coach, what to do about it. Free, and built for South Africa.
```

---

## 3. Description (4000 max)

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

---

## 4. Keywords (100 max, commas, no spaces)

```
budget,savings,debt,expenses,tracker,rands,payday,literacy,coach,invest,wealth,quiz,statement
```

---

## 5. What's New (first release)

```
The first release of Notho. Learn money skills in 3-minute lessons, import your bank statement to see where your money actually went, build a budget you can keep, and ask Cosmo your money questions. Built for South Africa.
```

---

## 6. Age Rating questionnaire — exact answers

Every question, answered for Notho. Result: **4+**

| Question | Answer |
|---|---|
| Cartoon or Fantasy Violence | None |
| Realistic Violence | None |
| Prolonged Graphic or Sadistic Realistic Violence | None |
| Profanity or Crude Humor | None |
| Mature/Suggestive Themes | None |
| Horror/Fear Themes | None |
| Medical/Treatment Information | None |
| Alcohol, Tobacco, or Drug Use or References | None |
| Simulated Gambling | None |
| Sexual Content or Nudity | None |
| Graphic Sexual Content and Nudity | None |
| Contests | None |
| Unrestricted Web Access | **No** — the app does not embed an open browser |
| Gambling and Contests | No |
| **Does your app contain AI-generated content?** | **Yes** — see §7 |
| Age Assurance / Declared Age Range API | Not required at 4+ with no age-restricted content |

---

## 7. AI disclosure — REQUIRED, and the thing most likely to get you rejected

Notho ships an AI feature: **Cosmo**, powered by Google Gemini (`gemini-3.5-flash`) via `/api/coach/chat`. Apple actively checks this in review.

**Declare in App Review Notes:**

```
Notho includes an optional AI chat feature called Cosmo, powered by Google Gemini.

- It is OFF by default and requires explicit in-app consent before any message is sent (user_settings.coach_ai_consent).
- The consent screen and the chat header both state that Cosmo is AI and can make mistakes.
- Only anonymised aggregate budget figures (category totals and monthly income) are sent to the model. No names, emails, merchant names, transaction descriptions or account numbers ever leave our servers.
- A system prompt restricts Cosmo to financial EDUCATION only. It is instructed never to recommend or name specific financial products, providers, funds or shares, and to redirect any such question to a registered financial adviser.
- Usage is capped at 10 messages per user per day, with a 500-character message limit.
- Notho is not a registered financial services provider under the South African FAIS Act, and this is disclosed in-app, in the Privacy Policy and in the App Store description.
```

**In-app requirement:** a user-facing "this is AI" label must be visible where Cosmo is used. This has been added for you — see `src/components/CosmoCoachChat.tsx`.

---

## 8. App Privacy (Privacy Labels) — exact selections

Apple asks, per data type: *is it collected, is it linked to the user, is it used for tracking, and why.* **Nothing in Notho is used for tracking** — answer "No" to tracking on every row.

### Contact Info
| Type | Collected | Linked to user | Tracking | Purposes |
|---|---|---|---|---|
| Email Address | Yes | Yes | No | App Functionality |
| Name | Yes | Yes | No | App Functionality |

### Financial Info
| Type | Collected | Linked to user | Tracking | Purposes |
|---|---|---|---|---|
| Other Financial Info | Yes | Yes | No | App Functionality |

> Covers budget entries and transactions parsed from statements the user uploads. **Do not** tick *Payment Info* or *Credit Info* — Notho collects neither.

### User Content
| Type | Collected | Linked to user | Tracking | Purposes |
|---|---|---|---|---|
| Other User Content | Yes | Yes | No | App Functionality |

> Covers Cosmo chat messages (`coach_ai_logs`), custom categories, merchant rules and feedback.

### Identifiers
| Type | Collected | Linked to user | Tracking | Purposes |
|---|---|---|---|---|
| User ID | Yes | Yes | No | App Functionality |
| Device ID | Yes | No | No | Analytics |

### Usage Data
| Type | Collected | Linked to user | Tracking | Purposes |
|---|---|---|---|---|
| Product Interaction | Yes | Yes | No | Analytics, App Functionality |

### Diagnostics
| Type | Collected | Linked to user | Tracking | Purposes |
|---|---|---|---|---|
| Crash Data | Yes | No | No | App Functionality |
| Performance Data | Yes | No | No | App Functionality |

### Explicitly NOT collected — leave every one of these unticked
Location (any), Health & Fitness, Payment Info, Credit Info, Physical Address, Phone Number, Contacts, Photos or Videos, Audio Data, Search History, Browsing History, Sensitive Info, Purchase History, Emails or Text Messages.

> **Uploaded statement files:** parsed in memory server-side and never written to storage — only the extracted transactions are saved. That's already covered by *Other Financial Info*; there is no separate Apple category to tick.

---

## 9. Account deletion — Apple guideline 5.1.1(v)

Already satisfied. Notho has in-app deletion at **Settings → Delete account**, wired to `POST /api/account/delete`, which clears every user-scoped table explicitly before removing the auth record. Data export lives at `/api/account/export`.

**Put this in App Review Notes:**
```
Account deletion: sign in, then Settings > Delete account. This permanently erases the account and all associated data (budget entries, imported transactions, learning progress, coach logs, push subscriptions). Users can also export all their data from the same screen.
```

---

## 10. Pricing and Availability

| Field | Value |
|---|---|
| Price | Free |
| In-App Purchases | None |
| Availability | All territories (or South Africa only — your call) |
| Pre-orders | No |

> No payment SDK exists in the codebase, so "Free, no IAP" is the accurate answer. If you add subscriptions later, digital content **must** go through Apple In-App Purchase.

---

## 11. App Review Notes — paste this whole block

```
Notho is a financial-literacy education app for South African users.

DEMO ACCOUNT
Email: hello@notho.co.za
Password: Nomandla13
The demo account has sample lessons completed and a sample budget already imported, so every feature is reachable without uploading a real bank statement.

AI FEATURE (Cosmo)
Optional AI coach powered by Google Gemini. Off by default, requires explicit in-app consent. Only anonymised category totals are sent to the model. Restricted by system prompt to financial education, never product recommendations. 10 messages per user per day.

BANK STATEMENT IMPORT
Users upload their own statement file (PDF, CSV, OFX, QFX). Notho does NOT connect to any bank, does not use screen scraping, and never requests banking credentials. Files are parsed in memory and never stored.

REGULATORY
Notho is a financial EDUCATION platform. The Solution Org (Pty) Ltd is not a registered financial services provider under the South African FAIS Act. This is disclosed in-app, in the Privacy Policy, and in the App Store description. The app gives no financial advice and recommends no products.

ACCOUNT DELETION
Settings > Delete account. Erases the account and all associated data.

Support: support@notho.co.za
```

---

## 12. Screenshots

Upload from `store-launch/05-screenshots/final/ios-6.9/` (required). The `ios-6.5/` set is optional and only needed if you want to control how it looks on older devices.

---

## Checklist

- [ ] Apple Developer Program paid ($99/yr) and 2FA on
- [ ] App ID created with bundle `za.co.notho.app`
- [ ] Name, subtitle, categories set (§1)
- [ ] Promotional text, description, keywords (§2–4)
- [ ] Age rating questionnaire (§6)
- [ ] AI content declared (§7)
- [ ] Privacy Labels set exactly as §8
- [ ] Demo account created and added to Review Notes (§11)
- [ ] Screenshots uploaded (§12)
- [ ] Build uploaded from Xcode and selected
- [ ] Submit
