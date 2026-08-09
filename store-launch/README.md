# Notho — store launch folder

Everything for the App Store and Play Store submissions, prepared and ready.

---

## What's done

| | |
|---|---|
| ✅ | All iOS + Android icon sizes, generated from your mark |
| ✅ | App Store 1024×1024 icon, alpha stripped (Apple rejects transparency) |
| ✅ | Play Store 512×512 icon and 1024×500 feature graphic |
| ✅ | Marketing screenshot frames at all three required canvas sizes |
| ✅ | Every App Store Connect field, written and within character limits |
| ✅ | Every Play Console field, written and within character limits |
| ✅ | Apple Privacy Labels — exact per-row selections |
| ✅ | Google Data Safety — exact per-row selections, traced to your code |
| ✅ | Age rating and content rating answers for both stores |
| ✅ | AI declarations for Cosmo, required by both stores |
| ✅ | Privacy policy updated — Gemini, PostHog and Resend now disclosed |
| ✅ | In-app AI disclosure added to the Cosmo chat |
| ✅ | `capacitor.config.ts` written, plus a one-command setup script |

---

## What still needs you — four things

**1. Take 5 screenshots** *(~15 minutes)*

Open Notho on a phone and capture these five screens. Save them into `05-screenshots/raw/` with exactly these names:

| File | Screen |
|---|---|
| `learn.png` | Learning home / course list |
| `lessons.png` | A lesson in progress |
| `budget.png` | Budget screen with data |
| `coach.png` | Cosmo chat with a reply |
| `progress.png` | Profile with XP and streak |

Then run:
```bash
python3 store-launch/_tools/build_assets.py
```

Finished, store-ready screenshots land in `05-screenshots/final/`. Upload those.

**2. Create a demo account** *(~5 minutes)*

Both review teams need to sign in. Make an account with some lessons completed and a sample budget imported, then paste the credentials into §11 of the Apple file and §5 of the Google file.

**3. Start the Play closed test — do this first, today** *(~30 minutes, then 14 days of waiting)*

Google requires 12+ testers opted in for 14 consecutive days before you can publish. It's the longest item on the timeline and everything else can happen in parallel. Details in §8 of the Google file.

**4. The native engineering week**

`06-capacitor-setup.md` documents three blockers I found in your codebase. One of them — Google OAuth failing inside a webview — will break sign-in for most users if shipped as-is. Budget about a working week.

---

## Files

```
store-launch/
├── 01-APPLE-App-Store-Connect.md   Every Apple field, in console order
├── 02-GOOGLE-Play-Console.md       Every Google field, in console order
├── 03-icons/
│   ├── ios/                        AppIcon set, all sizes
│   ├── android/                    mipmap densities + adaptive foreground
│   └── store/                      1024 (Apple, no alpha) + 512 (Play)
├── 04-graphics/                    Play feature graphic 1024×500
├── 05-screenshots/
│   ├── frames/                     Empty frames, all 3 canvas sizes
│   ├── raw/                        ← drop your 5 screenshots here
│   └── final/                      ← composited output, upload these
├── 06-capacitor-setup.md           Native wrapper + the 3 blockers
└── _tools/
    ├── build_assets.py             Regenerates every graphic
    └── setup-capacitor.sh          One-command native scaffold
```

---

## Changes made to your app

Four files, all reviewable with `git diff`:

- `src/app/privacy/page.tsx` — added Google Gemini, PostHog and Resend as disclosed processors; added sections on uploaded bank statements, push notifications, and how Cosmo works; documented in-app deletion alongside the email route.
- `src/components/CosmoCoachChat.tsx` — added a persistent "AI" badge, named Gemini on the consent screen, added an "AI can make mistakes" line, linked to the policy.
- `capacitor.config.ts` — new file.
- `package.json` — untouched so far; the setup script adds Capacitor when you run it.

> Your repo had uncommitted work in progress when I started (admin analytics, usage tracking). I didn't touch any of it — my changes are separable.

---

## Costs and timeline

| | |
|---|---|
| Apple Developer Program | $99/year |
| Google Play Developer | $25 once |
| **Total** | **$124** |

Realistic path to both stores live: **4–5 weeks**, with the Play 14-day test and the native engineering week running in parallel. Start the Play closed test today and it stops being the bottleneck.

---

## Two things I'd flag

**Apple 4.2 is your real risk.** A webview shell with no native capability gets rejected as a repackaged website. The mitigations are in `06-capacitor-setup.md` — biometric lock, native push, offline lessons. Don't skip them and hope.

**Your icon source is 512×512.** The App Store icon is upscaled to 1024 from it, so it's slightly soft. If you have the original vector, export a true 1024×1024 and drop it at `03-icons/store/app-store-icon-1024.png`. Not a rejection risk, just sharper.
