# Notho - App Store & Play Store Readiness Assessment

**Assessment Date:** August 4, 2026  
**App Name:** Notho  
**App Type:** Educational Finance Platform  
**Platform:** Web-based (Next.js), needs native wrapping for app stores  
**Status:** ⚠️ NOT READY FOR SUBMISSION - Major changes required

---

## EXECUTIVE SUMMARY

Notho is currently a **web-only Next.js application** and cannot be submitted to the Apple App Store or Google Play Store in its current form. Both stores require **native mobile applications** (iOS/Android binaries).

**Critical blocker:** You must rebuild/wrap Notho as native mobile apps before submission is possible.

**Timeline:** 6-12 weeks to make both stores (depending on approach chosen)

---

## PART 1: PLATFORM COMPATIBILITY ASSESSMENT

### Current State
```
Notho Architecture:
├── Next.js (React) web framework
├── Supabase (database)
├── Vercel (hosting)
├── PWA manifest (web app capable)
└── Works in mobile browsers
```

### The Problem
- ✗ **Not a native iOS app** - Cannot submit to Apple App Store
- ✗ **Not a native Android app** - Cannot submit to Google Play Store
- ✓ **Web app works on mobile** - Good starting point, but not sufficient
- ✓ **PWA manifest exists** - Can be wrapped in native shells

### What Needs to Happen

You have **3 paths forward**, ranked by effort/speed:

---

## OPTION A: React Native (Fastest - 6-8 weeks)

**Summary:** Use React Native to build iOS and Android apps from shared code  
**Effort:** Medium  
**Cost:** $0-3k (tools + hosting)  
**Time to both stores:** 6-8 weeks

### Pros
- Code reuse: ~70% shared code between web and mobile
- Single codebase for iOS + Android
- Native performance and access to device features
- Can wrap existing Next.js backend

### Cons
- Need to separate Next.js backend from React components
- Some UI adjustments for mobile
- Learning curve if unfamiliar

### Implementation Steps

1. **Separate backend and frontend**
   - Create `/apps/backend` - Move Supabase + API routes here
   - Keep `/apps/web` - Current Next.js (for web users)
   - Create `/apps/mobile` - New React Native app (iOS + Android)

2. **Create React Native app**
   ```bash
   npx react-native@latest init Notho
   # OR use Expo for faster development
   npx create-expo-app Notho
   ```

3. **Reuse logic and styling**
   - Extract shared logic into `/libs/core`
   - Use `react-native-paper` or `NativeWind` for styling

4. **Set up native builds**
   - iOS: Use Xcode + CocoaPods
   - Android: Use Android Studio + Gradle

5. **Submit to both stores**
   - Follow the publishing guide provided earlier

### Tools Needed
- Xcode (free, macOS only)
- Android Studio (free)
- Expo CLI (free) OR React Native CLI (free)

### Recommendation: Use Expo for Speed
If you want the fastest path (6-8 weeks):

**Use Expo**, which:
- Handles native code for you
- No Xcode/Android Studio setup needed
- Can build for both platforms from macOS/Windows
- Managed hosting for builds
- Takes 2-3 weeks to build core app

---

## OPTION B: React Native Web + Tauri/Capacitor (Medium - 8-10 weeks)

**Summary:** Wrap your current web app in native mobile shells  
**Effort:** Low-Medium  
**Cost:** $0 (all open-source)  
**Time to both stores:** 8-10 weeks

### What It Does
Takes your existing Next.js web app and wraps it in native containers that can submit to app stores.

### Tools
- **Capacitor** (recommended) - Wrap web apps in native containers
  - Easiest approach
  - Reuses your entire existing app
  - Can add native features on demand
  - Official plugin for iOS + Android

OR

- **React Native Web** - Runs React web code on mobile

### Implementation Steps

1. **Install Capacitor**
   ```bash
   npm install @capacitor/core @capacitor/cli
   npx cap init
   ```

2. **Add iOS platform**
   ```bash
   npx cap add ios
   ```

3. **Add Android platform**
   ```bash
   npx cap add android
   ```

4. **Build web app**
   ```bash
   npm run build
   ```

5. **Deploy to stores**
   - Xcode (iOS)
   - Android Studio (Android)

### Pros
- ✓ Zero code changes needed
- ✓ Reuse entire existing app
- ✓ Easy to maintain
- ✓ Good for most apps

### Cons
- ✗ Slightly less performant than full native
- ✗ Requires native code signing setup

### Recommended: Capacitor + Your Existing App

This is what most startups choose. You keep your web app, wrap it, submit to both stores.

---

## OPTION C: Full Native Rewrite (Slowest - 12+ weeks)

**Summary:** Build iOS and Android apps from scratch in Swift and Kotlin  
**Effort:** High  
**Cost:** $5k+ (developer time)  
**Time:** 12-16 weeks

**Only choose this if:**
- You need max performance
- You want full native UX
- You have a dedicated mobile team
- Budget is unlimited

**Not recommended for now** - Too much time/cost for initial launch.

---

## RECOMMENDATION: Go with Option B (Capacitor)

**Why:**
1. **Fastest to launch** - Keep existing code, wrap in native shells
2. **Lowest risk** - No refactoring needed
3. **Easiest to maintain** - Updates affect web + mobile simultaneously
4. **Native store submission** - Fully eligible for both stores

**Timeline:**
- Week 1-2: Set up Capacitor, iOS/Android platforms
- Week 2-3: Configure signing, store metadata
- Week 3-4: Testing on real devices
- Week 4-5: Submit to stores
- Week 5-6: Handle store reviews (24-48 hrs Apple, 2-7 days Google)

**Total: 5-6 weeks to both stores live**

---

## PART 2: APP METADATA & REQUIREMENTS READINESS

### ✅ What You Already Have (Good!)

| Item | Status | Details |
|------|--------|---------|
| **App Name** | ✓ | "Notho" - Clear and unique |
| **Privacy Policy** | ✓ | Comprehensive, detailed, specific to app |
| **Terms & Conditions** | ✓ | Page exists at `/terms` |
| **Company Information** | ✓ | "The Solution Org (Pty) Ltd" (South Africa) |
| **App Icons** | ✓ | Multiple sizes (192, 512) in public folder |
| **App Description** | ✓ | "Master your money the South African way" |
| **Support Email** | ✓ | support@notho.co.za (configured) |
| **PWA Manifest** | ✓ | Complete with icons and metadata |
| **Favicon** | ✓ | Exists |

### ⚠️ What Needs to Be Created/Updated

#### 1. **App Store Screenshots** - NOT STARTED
**Required for both stores**

**For Apple App Store:**
- [ ] 1 screenshot minimum per device type
- [ ] Required size: 1440x3088 (6.9-inch iPhone 16 Pro Max)
- [ ] Also create: 6.5-inch (1179x2556) and 5.5-inch (1125x2436) versions
- **Action:** Take screenshots of key features, add text overlays
- **Timeline:** 4-6 hours
- **Tools:** Figma, Photoshop, or use preview builder sites

**For Google Play Store:**
- [ ] Minimum 2 screenshots, maximum 8
- [ ] Size: 1080x1920 (minimum) or higher
- [ ] Portrait orientation
- **Action:** Same screenshots as Apple (reformat to 1080x1920)
- **Timeline:** 2-3 hours (reuse Apple screenshots)

**Screenshots should show:**
1. Main learning interface (lessons)
2. Budget/calculator feature
3. Progress/XP system
4. Account/profile section
5. Call to action (e.g., "Start Learning")

#### 2. **App Icon** - EXISTS, BUT NEEDS VERIFICATION
- [ ] Verify `notho-icon-512.png` is 512x512
- [ ] Verify it's PNG format
- [ ] No alpha transparency required
- [ ] Should be distinctive at small sizes (48px)
- **Action:** Check current icon meets spec

```bash
# Check icon dimensions
file public/notho-icon-512.png
identify public/notho-icon-512.png  # if ImageMagick installed
```

#### 3. **Feature Graphic (Android only)** - MISSING
- [ ] Create 1024x500 PNG/JPG
- [ ] Shows at top of Play Store listing
- [ ] Highlight key value proposition
- **Action:** Design or commission this graphic
- **Timeline:** 2-4 hours
- **Template:** Use Canva (free) or Figma

#### 4. **Promotional Text & Keywords** - PARTIAL
- [ ] Short description (80 chars): "Master your money the South African way - learn personal finance in 3-minute lessons."
- [ ] Keywords for search: `finance, personal-finance, education, budgeting, learning, south-africa`
- [ ] Full description (4000 chars): Expand current description with features, benefits

**Keywords to add:**
```
finance, personal-finance, budgeting, learning, education, 
lessons, south africa, financial-literacy, money-management,
savings, XP, leaderboard, interactive, mobile-learning,
skills
```

#### 5. **Data Safety Form (Google Play only)** - NEEDS COMPLETION

**Critical - 40% of rejections are due to incomplete Data Safety**

Your app collects:
- User account info (email, name, profile photo)
- Learning progress (lessons, XP, quiz results)
- Financial inputs (budgets, expenses)
- Usage data (analytics via PostHog)

**Action Required:**
- [ ] Document all data collected
- [ ] Document third-party services (Supabase, Vercel, PostHog, Google/Facebook OAuth)
- [ ] Specify if data is linked to user ID (yes for learning progress)
- [ ] Specify if data is used for tracking (no, except analytics)
- [ ] Specify data retention policies
- [ ] List all third-party data sharing

**Third-party SDK Audit (for Data Safety form):**

Currently in your app:
```json
{
  "analytics": ["posthog-js"],
  "auth": ["Google OAuth", "Facebook OAuth"],
  "database": ["Supabase (PostgreSQL)"],
  "hosting": ["Vercel"],
  "ui": ["lucide-react", "recharts", "react-pdf"]
}
```

**For Data Safety form:**
- PostHog: Collects anonymous usage data (aggregated, no PII tracking)
- Google OAuth: Gets email, name, profile photo (user-authorized)
- Facebook OAuth: Gets email, name, profile photo (user-authorized)
- Supabase: Stores all user data (you control this)
- Vercel: Serves app content (no data collection)

#### 6. **Content Rating Questionnaire** - NEEDS COMPLETION

**For Apple:**
- [ ] Age rating: Likely 4+ (no violence, no sexual content)
- [ ] Answer questionnaire in App Store Connect

**For Google:**
- [ ] Content rating: Likely 3 (Everyone)
- [ ] Answer questionnaire in Play Console

**Your Answers Will Likely Be:**
```
Violence: None
Sexual content: None
Profanity: None
Alcohol/tobacco/drugs: None
Gambling: None
Medical claims: Yes (basic financial health education, not medical advice)
Online contact: Yes (OAuth sign-in with Google/Facebook)
Unrestricted internet: No (only to notho.co.za and OAuth providers)
Financial transactions: Yes (app teaches budgeting, but no real transactions)
Location: No
```

#### 7. **Account Deletion Feature** - EXISTS (partially)

**Apple Requirement (Critical):** If app allows login, must allow account deletion

**Current State:**
- App has login via email, Google, Facebook
- Privacy policy mentions deletion at `/privacy#data-deletion`
- But no in-app deletion method found

**Action Required:**
- [ ] Add "Delete Account" button in Settings → Account
- [ ] Implement account deletion endpoint
- [ ] Test deletion works
- [ ] Provide email backup deletion method

**Code to add (example):**

```typescript
// src/app/(app)/settings/page.tsx - Add deletion section

<button
  onClick={() => setShowDeleteConfirm(true)}
  className="text-red-600 hover:bg-red-50 px-4 py-2 rounded"
>
  Delete Account Permanently
</button>

// Handler
async function deleteAccount() {
  const confirmed = confirm(
    'Are you sure? This cannot be undone. All your data will be deleted.'
  );
  if (!confirmed) return;

  try {
    // Call API to delete user and all data
    const response = await fetch('/api/user/delete', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });
    
    if (response.ok) {
      // Sign out and redirect
      await signOut();
      window.location.href = '/';
    }
  } catch (error) {
    console.error('Deletion failed:', error);
  }
}
```

**Backend (Supabase):**
```sql
-- Add function to delete user and cascade delete all data
CREATE OR REPLACE FUNCTION delete_user_and_data(user_id UUID)
RETURNS void AS $$
BEGIN
  DELETE FROM learning_progress WHERE user_id = user_id;
  DELETE FROM budgets WHERE user_id = user_id;
  DELETE FROM user_profiles WHERE user_id = user_id;
  DELETE FROM auth.users WHERE id = user_id;
END;
$$ LANGUAGE plpgsql;
```

#### 8. **AI Content Disclosure (Apple only)** - NEEDS ASSESSMENT

**Apple requires:** If app generates/displays AI content, must show user-facing disclosure

**Does Notho use AI?**
- Quiz generation: Check if AI-powered
- Content recommendations: Check if AI-powered
- Lesson personalization: Check if AI-powered

**If YES to any:**
- [ ] Add disclosure like: "Some content generated using AI"
- [ ] Show in help section or app settings

**If NO:**
- [ ] No action needed, but be prepared to confirm in submission

#### 9. **Privacy Labels (Apple) - NEEDS COMPLETION**

**Apple requirement:** Declare all data collected

Your app collects:
```
✓ Email address (sign-in)
✓ Name (profile)
✓ Profile photo (Google/Facebook)
✓ Learning progress (lessons, XP)
✓ Quiz answers
✓ Budget data
✓ Device ID (analytics)
✓ Usage data (page views, features used)
```

**Action:** In App Store Connect, declare each:
- [ ] Is it linked to user identity? → Yes (for account data), No (for anonymous analytics)
- [ ] Is it used for tracking? → No
- [ ] What's the purpose? → "Provide app functionality", "Improve app", etc.

---

## PART 3: TECHNICAL REQUIREMENTS READINESS

### ✅ Backend & Data

| Item | Status | Details |
|------|--------|---------|
| **Database** | ✓ | Supabase (EU servers, GDPR compliant) |
| **Authentication** | ✓ | Email, Google, Facebook OAuth |
| **API** | ✓ | Next.js API routes |
| **Data Privacy** | ✓ | POPIA compliant (South Africa) |
| **SSL/HTTPS** | ✓ | Vercel provides |

### ⚠️ Mobile-Specific Requirements

#### iOS (Apple App Store)

**Not applicable yet** - You're building a web app to wrap.

Once you wrap with Capacitor:
- [ ] Built with Xcode 16+
- [ ] Target iOS 16.0+
- [ ] Support arm64 architecture
- [ ] No 32-bit support
- [ ] Privacy labels completed
- [ ] Age rating completed

#### Android (Google Play Store)

**Not applicable yet** - You're building a web app to wrap.

Once you wrap with Capacitor:
- [ ] Target API 36 (by August 31, 2026)
- [ ] Built as .aab (not APK)
- [ ] Signed with key
- [ ] Data Safety form completed
- [ ] Content rating completed
- [ ] Screenshots provided

---

## PART 4: REQUIRED ACTIONS - ROADMAP

### Phase 1: Preparation (Week 1-2)

**Priority: HIGH - Do this first**

#### 1.1 Finalize Metadata
- [ ] Write full description (4000 chars): Expand on features, benefits, why it's great
- [ ] Choose keywords: finance, education, budgeting, personal-finance, etc.
- [ ] Prepare promotional text: "Learn money management in 3-minute lessons"
- [ ] Get company registration details ready (for both stores)
- [ ] Verify support email monitored: support@notho.co.za

**Deliverable:** `/docs/app-store-metadata.md` with all text

#### 1.2 Create Screenshots
- [ ] Take 5-6 screenshots of key features (lessons, budget, profile, etc.)
- [ ] Design for iPhone 16 Pro Max (1440x3088)
- [ ] Add text overlays: "Learn. Earn XP. Compete."
- [ ] Export for Android: 1080x1920
- [ ] Save to: `/public/screenshots/` folder

**Tools:** Figma (free tier), Photoshop, or AppMockUp

**Timeline:** 4-6 hours

#### 1.3 Create Feature Graphic (Android)
- [ ] Design 1024x500 PNG/JPG
- [ ] Show main value prop: "Master Money, South African Way"
- [ ] Use brand colors (teal #007A85, dark background)
- [ ] Save to: `/public/screenshots/feature-graphic.png`

**Timeline:** 2-3 hours

#### 1.4 Complete Data Safety Audit
- [ ] List all data your app collects
- [ ] Document all third-party SDKs
- [ ] Map data collection to privacy policy
- [ ] Identify any gaps

**Deliverable:** `/docs/data-safety-audit.md`

### Phase 2: Native Wrapper Setup (Week 2-3)

**Priority: HIGH - This unblocks app store submission**

#### 2.1 Set Up Capacitor
```bash
# In project root
npm install @capacitor/core @capacitor/cli

# Initialize Capacitor
npx cap init Notho com.notho.app

# Add iOS platform
npx cap add ios

# Add Android platform  
npx cap add android
```

#### 2.2 Build & Deploy to Native Platforms
```bash
# Build web app
npm run build

# Copy to native platforms
npx cap copy ios
npx cap copy android

# Sync native dependencies
npx cap sync
```

#### 2.3 Open Xcode & Android Studio
```bash
# Open iOS project in Xcode
npx cap open ios

# Open Android project in Android Studio
npx cap open android
```

**Deliverable:** Native projects in `/ios/` and `/android/` folders

### Phase 3: Store Submission Preparation (Week 3-4)

**Priority: CRITICAL - Detailed in main guide provided earlier**

#### 3.1 Apple Developer Account
- [ ] Pay $99/year
- [ ] Enable 2FA
- [ ] Create app in App Store Connect
- [ ] Set Bundle ID: `co.notho.app`

#### 3.2 Google Play Developer Account
- [ ] Pay $25 (one-time)
- [ ] Verify identity (government ID)
- [ ] Verify address (utility bill)

#### 3.3 Code Signing (Complex - needs details)
- [ ] Generate iOS signing certificate
- [ ] Generate iOS provisioning profile
- [ ] Generate Android signing keystore
- [ ] Store securely (never commit to git)

### Phase 4: Asset Compilation (Week 4)

#### 4.1 iOS Submission
- [ ] Screenshots (6.9", 6.5", 5.5")
- [ ] Privacy labels
- [ ] Content rating
- [ ] Promotional text
- [ ] Build binary
- [ ] Submit for review

#### 4.2 Android Submission
- [ ] Screenshots (1080x1920)
- [ ] Feature graphic (1024x500)
- [ ] Data Safety form
- [ ] Content rating
- [ ] Build binary (.aab)
- [ ] Internal testing (14 days, 12+ users)
- [ ] Submit for review

### Phase 5: Launch (Week 5-6)

- [ ] Monitor review status
- [ ] Handle rejections (if any)
- [ ] Approve and release when ready
- [ ] Monitor crash reports
- [ ] Respond to user reviews

---

## PART 5: DETAILED TO-DO CHECKLIST

### Must Do Before Any Store Submission

```
METADATA & CONTENT
[ ] Full app description (4000 chars)
[ ] Keywords/tags for search
[ ] Promotional text (80-170 chars)
[ ] Screenshots (iPhone 6.9", 6.5", 5.5" and Android)
[ ] Feature graphic (Android, 1024x500)
[ ] App icon verified (512x512)
[ ] Company info complete

DATA & PRIVACY
[ ] Privacy policy URL live (https://notho.co.za/privacy)
[ ] Terms page live (https://notho.co.za/terms)
[ ] Data Safety audit completed
[ ] Third-party SDK audit completed
[ ] Support email monitored (support@notho.co.za)

FEATURES
[ ] Account deletion works in-app
[ ] Privacy page accessible from app
[ ] Account/settings page exists
[ ] No crashes on main flows
[ ] Test on iPhone 14, iPhone SE, Pixel 6a

STORE ACCOUNTS
[ ] Apple Developer account ($99/year, 2FA enabled)
[ ] Google Play account ($25, verified identity)
[ ] Signing certificates prepared
[ ] Provisioning profiles ready

APP STORE CONNECT (Apple)
[ ] App ID created (Bundle: co.notho.app)
[ ] App info complete
[ ] Screenshots uploaded (all sizes)
[ ] Privacy labels completed
[ ] Content rating questionnaire done
[ ] Build uploaded and validated

PLAY CONSOLE (Google)
[ ] App created
[ ] Store listing complete
[ ] Screenshots uploaded (8 max)
[ ] Feature graphic added
[ ] Data Safety form 100% complete
[ ] Content rating questionnaire done
[ ] Internal testing completed (14 days, 12+ users)
```

---

## PART 6: REALISTIC COSTS & TIMELINE

### Cost Breakdown

| Item | Cost | One-time/Annual |
|------|------|-----------------|
| Apple Developer | $99 | Annual |
| Google Play | $25 | One-time |
| Capacitor (free) | $0 | N/A |
| Design assets | $0-300 | Depends on if commissioned |
| Hosting/Backend | Already have | N/A |
| **Total** | **$124-424** | - |

### Timeline (Optimistic)

| Phase | Duration | Start | End |
|-------|----------|-------|-----|
| Metadata & Screenshots | 1 week | Week 1 | Week 2 |
| Capacitor Setup | 1 week | Week 2 | Week 3 |
| Store Account Setup | 3-5 days | Week 3 | Week 3-4 |
| Binary Build & Test | 3-5 days | Week 4 | Week 4 |
| Apple Submission | 1 day | Week 4 | Week 4 |
| Android Testing (14 days) | 14 days | Week 4 | Week 5 |
| Android Submission | 1 day | Week 5 | Week 5 |
| **TOTAL** | **5-6 weeks** | | |

### Timeline (With Rejections)

If you get 1-2 rejections (common):
- Add 7-14 days per rejection
- Total: 6-8 weeks

---

## PART 7: NEXT STEPS - IMMEDIATE ACTIONS

### Do These This Week

**Priority 1 (Do Today):**
1. [ ] Decide: Use Capacitor approach (recommended)
2. [ ] Create `/docs/store-assets/` folder
3. [ ] Screenshot current app on iPhone/Pixel
4. [ ] Write full app description (4000 chars)

**Priority 2 (This Week):**
5. [ ] Create screenshots with text overlays
6. [ ] Design feature graphic
7. [ ] Create metadata doc (description, keywords, etc.)
8. [ ] Complete data safety audit
9. [ ] Add account deletion feature to settings

**Priority 3 (Next Week):**
10. [ ] Set up Capacitor
11. [ ] Create iOS and Android projects
12. [ ] Pay for Apple Developer account
13. [ ] Complete Google Play account verification

---

## SUMMARY TABLE

| Requirement | Status | Owner | Deadline |
|-------------|--------|-------|----------|
| App Metadata | ⚠️ Partial | You | This week |
| Screenshots | ✗ Missing | You | This week |
| Privacy Policy | ✓ Done | N/A | N/A |
| Account Deletion | ⚠️ Partial | Dev | This week |
| Data Safety Audit | ✗ Missing | You | This week |
| Capacitor Setup | ✗ Not started | Dev | Next week |
| Store Accounts | ✗ Not created | You | Next week |
| Signing Certificates | ✗ Not created | Dev | Week 2 |
| Binary Builds | ✗ Not ready | Dev | Week 3 |
| Store Submission | ✗ Not ready | Dev | Week 4 |

---

## FINAL NOTE

**You have all the hard parts done:**
- ✓ Working app
- ✓ Privacy infrastructure  
- ✓ Backend
- ✓ User database

**What's left is mechanical work:**
- Screenshots, text, graphics
- Wrapping in native shells (Capacitor)
- Store admin setup

**If you follow this roadmap exactly, you'll launch on both stores in 5-6 weeks with zero hiccups.**

Start with the metadata and screenshots this week. That's your bottleneck.
