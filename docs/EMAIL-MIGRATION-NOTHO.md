# Email migration: fundiapp.co.za → notho.co.za

**Status:** not started. The app still sends from `hello@fundiapp.co.za` on purpose.
Work through this doc in order. Do **not** flip the sender until Step 4 passes.

---

## Why the order matters

There are two completely separate email systems, and people conflate them constantly:

| | **Mailboxes** (human mail) | **Resend** (app mail) |
|---|---|---|
| What it does | Lets you *receive* mail at hello@notho.co.za and reply as a person | Lets the *app* send welcome/streak/milestone emails automatically |
| Lives where | Truehost cPanel | resend.com |
| Breaks if wrong | You miss emails | Every lifecycle email silently stops |

They share one DNS zone, and they can fight over it — **a domain may only have one SPF
record.** Two SPF records is not "extra safe", it is invalid, and mail providers treat a
domain with two as unauthenticated. This is the single most common way people break their
own mail. Resend avoids the clash by putting its records on a `send.notho.co.za`
subdomain, which is why the values below look oddly nested. Leave them nested.

---

## What is already true (verified 2 Aug 2026)

```
notho.co.za        MX   0 mail.notho.co.za        → 102.212.247.93   ✅ Truehost mail zone live
notho.co.za        TXT  v=spf1 +mx +ip4:102.212.247.90 ~all          ✅ SPF exists
notho.co.za        NS   ns1.cloudoon.com / ns2.cloudoon.net / ns3.cloudoon.org
resend._domainkey.notho.co.za                                        ❌ missing
send.notho.co.za                                                     ❌ missing
```

So: the mail zone is **already provisioned and healthy**. You are not building from
scratch. You are adding mailboxes to a zone that already works, then adding Resend.

Worth knowing: `fundiapp.co.za`'s MX points at `76.76.21.21`, which is **Vercel, not a
mail server**. Inbound mail to `hello@fundiapp.co.za` is therefore probably already
bouncing. Outbound still works because that goes through Resend, which is why nobody
noticed. Another reason to finish this migration rather than sit on it.

---

## Step 1 — Create the mailbox (Truehost cPanel, ~5 min)

1. Log in to Truehost → **cPanel** for `notho.co.za`.
2. **Email → Email Accounts → Create**.
3. Fill in:
   - Domain: `notho.co.za`
   - Username: `hello`
   - Password: generate a strong one, save it to your password manager
   - Storage: 2 GB is plenty
4. **Create**.

Only this one is a real mailbox. The other three are free forwarders — see Step 2.

## Step 2 — Create the three forwarders (~3 min)

**Email → Forwarders → Add Forwarder**, three times:

| Address | Forwards to |
|---|---|
| `support@notho.co.za` | `hello@notho.co.za` |
| `privacy@notho.co.za` | `hello@notho.co.za` |
| `legal@notho.co.za` | `hello@notho.co.za` |

Forwarders are unlimited and cost nothing. Any of them can be promoted to a real mailbox
later without touching app code — the addresses in the code stay identical either way.

## Step 3 — Forward the old domain so nothing is lost (~3 min)

In the **fundiapp.co.za** cPanel, add forwarders so anyone mailing the old addresses still
reaches you:

| Old address | Forwards to |
|---|---|
| `hello@fundiapp.co.za` | `hello@notho.co.za` |
| `support@fundiapp.co.za` | `hello@notho.co.za` |
| `privacy@fundiapp.co.za` | `hello@notho.co.za` |
| `legal@fundiapp.co.za` | `hello@notho.co.za` |

Keep these alive for **at least 12 months**. Old emails, screenshots and the App Store
listing will point at the old addresses for a long time.

> ⚠️ If fundiapp.co.za's MX still points at Vercel (76.76.21.21), these forwarders will not
> fire, because mail never reaches Truehost in the first place. Fix the MX record first:
> **Zone Editor → MX → point to `mail.fundiapp.co.za`**, and make sure `mail.fundiapp.co.za`
> has an A record to the Truehost mail IP, not to Vercel.

## Step 4 — Verify notho.co.za in Resend (~10 min + DNS wait)

This is the step that lets the app send. Nothing here touches your mailboxes.

1. Log in to [resend.com](https://resend.com) → **Domains → Add Domain**.
2. Enter `notho.co.za`. Region: pick the same one already used for fundiapp
   (`us-east-1` — you can see it in the existing `send.fundiapp.co.za` MX record).
3. Resend shows **three** records. They look roughly like this — **use the values Resend
   actually shows you, not these**:

   | Type | Name | Value |
   |---|---|---|
   | MX | `send` | `feedback-smtp.us-east-1.amazonses.com` (priority 10) |
   | TXT | `send` | `v=spf1 include:amazonses.com ~all` |
   | TXT | `resend._domainkey` | `p=MIGfMA0GCSqGSIb3DQEB...` (long key) |

4. In Truehost cPanel → **Domains → Zone Editor → Manage** for `notho.co.za`, add all
   three exactly as shown.

   **The two traps, both of which cost people days:**
   - cPanel often auto-appends the domain. If you type `send.notho.co.za` you may end up
     with `send.notho.co.za.notho.co.za`. Type just `send` and check what it saved.
   - Do **not** edit your existing root `v=spf1 +mx +ip4:... ~all` record. The Resend SPF
     goes on the `send` subdomain as its own separate record. Leave the root one alone.

5. Back in Resend, click **Verify**. Records typically propagate in 15–30 minutes on
   cloudoon, but allow up to 48 hours. Resend shows exactly which record is still failing.

## Step 5 — Send one real test before flipping anything

With the domain showing **Verified** in Resend, send a single test from the Resend
dashboard to your Gmail. Then check:

- It **arrives**, and not in spam.
- Open the message → **Show original** in Gmail.
- Confirm `SPF: PASS`, `DKIM: PASS`, `DMARC: PASS`.

If DKIM fails, the `resend._domainkey` TXT record is wrong or truncated — that is the
usual culprit, because the key is long and cPanel sometimes clips it.

## Step 6 — Flip the sender in code (1 line, my job)

Only once Step 5 is fully green. In `src/lib/emails/lifecycle.ts`:

```ts
const FROM = "Notho <hello@fundiapp.co.za>";   // ← change this
const FROM = "Notho <hello@notho.co.za>";      // ← to this
```

There is a comment above that line explaining exactly this. Also change
`src/app/api/feedback-email/route.ts` and `src/app/api/admin/broadcast/route.ts`, which
have their own hardcoded `from:` values, plus the 24 `@fundiapp.co.za` addresses in the
privacy, terms, security and admin pages.

Tell me when Step 5 is green and I will do the whole sweep in one commit.

## Step 7 — Watch the first automated send

The lifecycle cron runs **07:30 daily** (`vercel.json`). The morning after the flip,
check Resend's dashboard for delivery failures. If sends drop to zero, revert Step 6 and
the old sender resumes working immediately.

---

## Step 8 — DMARC reporting (10 minutes, do it once)

`notho.co.za` currently publishes:

```
v=DMARC1; p=none;
```

Valid, and nothing is broken. But there is no `rua=` reporting address, which
means **nobody is telling you anything**. You cannot see who is sending as
notho.co.za, whether your own mail passes alignment, or whether someone starts
spoofing you. `p=none` without reporting is the one DMARC setup that gives you
neither enforcement nor visibility.

Raw DMARC reports are XML and genuinely unreadable, so point them at a service
that turns them into a weekly email instead of your inbox.

1. Go to **dmarc.postmarkapp.com**, enter `notho.co.za` and your email. Free,
   unlimited domains, no login, and you do not need to be a Postmark customer.
2. It gives you a reporting address that looks like
   `re+something@dmarc.postmarkapp.com`.
3. At Truehost → Zone Editor, **edit** the existing `_dmarc` TXT record to:

   ```
   v=DMARC1; p=none; rua=mailto:PASTE_THE_POSTMARK_ADDRESS; fo=1; adkim=r; aspf=r
   ```

4. Verify with `bash scripts/check-resend-dns.sh` — it now reports DMARC state.

Notes on the record:

- **Keep `p=none` for now.** It means "monitor, change nothing". Moving
  straight to `quarantine` on a domain you started sending from yesterday is
  how people silently bin their own mail.
- **No `ruf=`.** Forensic reports are barely supported, and where they are
  supported they can contain recipient content. Aggregate reports are enough.
- `adkim=r` / `aspf=r` are relaxed alignment, which is what you want while
  Supabase Auth and Resend both send on your behalf.

After three or four weekly digests, if everything shows as passing, tighten to
`p=quarantine` and later `p=reject`. That is the point at which DMARC actually
stops someone impersonating Notho to your users, which matters more than usual
for a money app.

## Quick reference

```bash
# Check DNS propagation from your Mac at any point:
dig +short MX notho.co.za
dig +short TXT notho.co.za
dig +short MX send.notho.co.za
dig +short TXT send.notho.co.za
dig +short TXT resend._domainkey.notho.co.za
```

`send.notho.co.za` and `resend._domainkey.notho.co.za` returning nothing means Step 4 is
not done or has not propagated yet.
