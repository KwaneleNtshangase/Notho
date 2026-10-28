# Complete Guide to Publishing on App Store & Play Store (2026)

## PHASE 0: PRE-LAUNCH CHECKLIST (Do This First)

### What You Need Before Starting
- [ ] App fully developed and tested on real devices
- [ ] Valid payment method (credit/debit card)
- [ ] Government-issued ID (for Play Store verification)
- [ ] Address document proof (utility bill, bank statement for Play Store)
- [ ] Company/Personal information (legal entity details)
- [ ] Privacy Policy URL (must be live and accessible)
- [ ] App icon (1024x1024 PNG, no rounded corners)
- [ ] Screenshots (minimum 2 for Android, minimum 1 for iOS)
- [ ] App description and promotional text
- [ ] Contact email for support
- [ ] Any API credentials your app uses (Firebase, etc.)

---

## SECTION 1: APPLE APP STORE (iOS)

### Step 1.1: Set Up Apple Developer Account
**Cost:** $99/year (or $299/year for Enterprise)
**Timeline:** 5-10 minutes
**What to Do:**
1. Go to developer.apple.com
2. Click "Account" → "Sign Up"
3. Use your Apple ID or create a new one
4. Enable two-factor authentication
5. Agree to Apple Developer Program License Agreement
6. Enter payment method
7. Wait for approval (usually instant, sometimes 24 hours)

**Important Notes:**
- Two-factor authentication is mandatory
- Keep your Apple ID secure—it controls everything
- Verify your email address

---

### Step 1.2: Prepare Your App Binary
**Requirements (as of August 2026):**
- Minimum iOS deployment target: iOS 16.0 or later
- Built with Xcode 16 or later (required as of April 28, 2026)
- Built with iOS 26 SDK or later (required as of April 28, 2026)
- Must support 64-bit architecture only
- No 32-bit support
- Must use bitcode or latest build settings

**Build Checklist:**
- [ ] Set minimum iOS version in Xcode
- [ ] Update to Xcode 16+
- [ ] Verify build architecture (arm64)
- [ ] Test on iPhone 16 Pro Max (required for screenshots)
- [ ] Test on at least one older device (iPhone 13 minimum)
- [ ] Ensure no crashes during testing
- [ ] Archive build and export for App Store distribution

**Command Reference (if using command line):**
```
xcodebuild -scheme YourApp -configuration Release archive
```

---

### Step 1.3: Create App ID in App Store Connect
**Timeline:** 10 minutes
**Steps:**
1. Log into App Store Connect (appstoreconnect.apple.com)
2. Click "My Apps"
3. Click the "+" button → "New App"
4. Select:
   - Platform: iOS
   - Name: Your app name
   - Primary Language: English (or your language)
   - Bundle ID: Create new or select existing (e.g., com.yourcompany.appname)
   - SKU: Unique identifier (can be anything, e.g., APP001)
5. Click "Create"

**Bundle ID Notes:**
- Must be unique across all of Apple's App Store
- Reverse domain format recommended
- Cannot be changed after creation
- Must match your Xcode project's bundle ID exactly

---

### Step 1.4: Complete App Information
**Timeline:** 30-45 minutes

#### General Information Tab:
- [ ] App Name (max 30 characters, visible on App Store)
- [ ] Subtitle (max 30 characters, shows under name)
- [ ] Privacy Policy URL (must be HTTPS and live)
- [ ] Support URL (customer support link)
- [ ] App Category (pick one primary category)
- [ ] Secondary Category (optional, choose up to one)
- [ ] Content Restrictions (select applicable)

#### AI Generated Content Disclosure (REQUIRED):
- [ ] Declare if your app contains AI-generated content
- [ ] If yes, provide user-facing disclosure in app
- [ ] Apple actively checks this—missing disclosure = automatic rejection

#### Account Deletion (if applicable):
- [ ] If your app allows account creation, you MUST allow account deletion
- [ ] Provide in-app method or document the process
- [ ] Missing this = automatic rejection

---

### Step 1.5: Prepare Screenshots & App Preview
**Requirements:**
- Minimum: 1 screenshot
- Maximum: 10 screenshots
- Required display size: 6.9-inch (iPhone 16 Pro Max)
- Also provide: 6.5-inch (iPhone 16 Pro), 5.5-inch (iPhone SE) versions

**Screenshot Checklist:**
- [ ] High quality, 1440x3088 pixels for 6.9-inch (72 dpi)
- [ ] No marketing copy cluttering the interface
- [ ] Show actual app functionality
- [ ] Text should be clear and readable
- [ ] Highlight key features in sequence
- [ ] Use tools like Figma, Sketch, or Affinity to add text overlays

**App Preview (Video):**
- Optional but recommended
- 15-30 seconds, shows app in action
- No sound required
- MP4 format, max 500MB
- Greatly increases conversion rates

**Tool Recommendations:**
- AppMockUp or Previewed for automated screenshots
- ScreenFloat or CleanMock for manual design
- Shotcut or iMovie for video previews

---

### Step 1.6: Create App Description & Keywords
**Timeline:** 20-30 minutes

#### Description (max 170 characters):
This is what shows on the App Store listing. Keep it punchy and benefit-focused.

**Example:**
"Fast, secure task management for teams. Collaborate in real-time, never miss a deadline."

#### Promotional Text (max 170 characters):
Highlight your latest feature or promotion. Updates every time you submit a new version.

#### Keywords (max 100 characters total):
Comma-separated, no spaces after commas. Max 30 keywords.

**Example:**
`tasks,productivity,collaboration,team,management,planner,organizer`

**SEO Tips:**
- Research what competitors use
- Use terms people actually search for (check App Store search trends)
- Include broad and specific keywords
- Don't keyword-stuff or use unrelated terms (rejection risk)

---

### Step 1.7: Set Up Pricing & Availability
**Timeline:** 10 minutes

1. In App Store Connect, go to "Pricing and Availability"
2. Choose pricing tier:
   - Free
   - Paid (starting at $0.99 up to $999.99)
   - Free with in-app purchases
3. Select regions where app is available (minimum 1 required)
4. Set release date (can be immediate or scheduled)
5. If you have In-App Purchases (IAP):
   - Set them up separately in "In-App Purchases" section
   - Must use Apple's official IAP system for digital goods
   - No alternative payment methods allowed for digital content

**In-App Purchase Setup (if applicable):**
- [ ] Create each IAP with unique ID
- [ ] Set price tier
- [ ] Create marketing name and description
- [ ] Add screenshot for each IAP
- [ ] Set availability for each IAP
- [ ] Ensure app requests review status for IAPs

---

### Step 1.8: Complete the App Rating Questionnaire
**Timeline:** 10-15 minutes
**Location:** App Store Connect → "App Information" → "Content Rights"

Answer Apple's rating questionnaire honestly:
- Violence, gore, or scary content?
- Frequent/intense violence?
- Sexual content?
- Mature/suggestive content?
- Alcohol, tobacco, or drug references?
- Gambling?
- Medical/health claims?
- Privacy concerns?

**Important:** 
- Lying here causes rejection
- Choose the most restrictive category if unsure
- This determines the age rating (4+, 12+, 17+)

---

### Step 1.9: Set Up Privacy Labels (Required)
**Timeline:** 20-30 minutes
**Location:** App Store Connect → "Privacy"

This is critical. Follow these steps:

1. Declare all data your app collects:
   - User ID, email, name, phone
   - Location data
   - Contacts or photos
   - Payment information
   - Health/fitness data
   - Browsing history
   - Search history
   - Identifiers
   - Diagnostic data
   - Other data

2. For each data type, specify:
   - Is it linked to user identity? (Yes/No)
   - Is it used for tracking? (Yes/No)
   - Is it shared with third parties? (Yes/No)
   - Why does the app need this data?

3. List all third parties receiving data:
   - Analytics services (Firebase, Mixpanel, etc.)
   - Ad networks (Google Ads, Meta, etc.)
   - Backend services (cloud providers, etc.)
   - APIs you use

**Privacy Policy Requirements:**
- Must be accessible as a URL
- Must list all data collection practices
- Must explain why data is collected
- Must be mobile-responsive
- Cannot say "we don't collect data" if you have analytics

**Red Flags (Automatic Rejection):**
- Vague privacy policy
- Missing privacy policy URL
- Privacy policy doesn't match actual behavior
- Overstated privacy protection claims

---

### Step 1.10: Submit Binary & Request Review
**Timeline:** 5 minutes
**Steps:**
1. In Xcode, go to "Product" → "Archive"
2. In the archive organizer, click "Distribute App"
3. Select "App Store Connect"
4. Choose "Upload" option
5. Select your team and signing certificate
6. Review the build and click "Upload"
7. Wait 5-15 minutes for processing
8. In App Store Connect, go to "Builds" section
9. Select your build when it appears
10. Click "Select Build" to add it to your app submission

**Build Upload Checklist:**
- [ ] Archive created successfully
- [ ] No signing errors
- [ ] Build number incremented
- [ ] Version number matches what you set
- [ ] Build uploads without errors
- [ ] Build appears in App Store Connect within 15 minutes

---

### Step 1.11: Final Review & Submit for App Review
**Timeline:** 5 minutes
**Steps:**
1. In App Store Connect, review all sections:
   - [ ] App Information complete
   - [ ] Screenshots added (all required sizes)
   - [ ] Description and keywords filled in
   - [ ] Privacy policy linked and correct
   - [ ] Content rating questionnaire completed
   - [ ] Privacy labels complete and accurate
   - [ ] Build selected and ready
   - [ ] Pricing and availability set
   - [ ] Age restrictions correct
   - [ ] No outstanding issues in "Prepare for Submission"

2. Click "Submit for Review"

3. You'll see a confirmation screen. Accept and submit.

**What Happens Next:**
- You receive an email confirmation
- Typical review time: 24-48 hours
- Average approval rate: 90% on first submission
- If rejected, you'll get detailed feedback

---

### Step 1.12: Monitor Review Status & Handle Rejections
**Timeline:** 24-48 hours for review

In App Store Connect:
- Go to your app
- Look at "Version History"
- Check "Status" column

**Possible Statuses:**
- **Waiting for Review** - In queue
- **In Review** - Being reviewed (usually 24-48 hours)
- **Pending Developer Release** - Approved, click "Release This Version" to go live
- **Ready for Sale** - Live on App Store
- **Rejected** - Read feedback, fix issues, resubmit

**Common Rejection Reasons (and fixes):**
1. **"Broken or missing Privacy Policy"**
   - Ensure URL is HTTPS
   - Test link from App Store Connect (copy paste the exact URL)
   - Make sure policy is mobile-responsive
   - Check it loads without errors

2. **"Incomplete Data Safety form"**
   - Go back to Privacy section
   - Verify every data type is declared
   - If you use Firebase, declare Firebase analytics
   - If you use crash reporting, declare it
   - Specify if data is linked to user ID

3. **"App crashes during testing"**
   - Test on multiple real devices
   - Test all core flows
   - Check for crashes in Xcode Console
   - Fix any NSExceptions or memory issues
   - Re-archive and resubmit

4. **"Missing AI content disclosure"**
   - If app has ANY AI features, add user-facing disclosure
   - Example: "This content was generated using AI"
   - Add to help section or settings
   - Resubmit with updated build

5. **"Missing account deletion"**
   - If app has login, provide account deletion
   - In Settings → Account → Delete Account
   - Provide customer support email as backup
   - Document in your app description

**If Rejected:**
1. Read Apple's detailed rejection reason
2. Fix the issue
3. Increment build number or version
4. Re-archive and upload new build
5. Resubmit for review
6. Process repeats (24-48 hours)

---

### Step 1.13: Release to App Store
**Timeline:** Instant (once approved)
**Steps:**
1. In App Store Connect, go to "Pending Developer Release"
2. Click "Release This Version"
3. Confirm the release date (immediate or scheduled)
4. Click "Release"

**After Release:**
- [ ] App appears on App Store within 1-2 hours
- [ ] Monitor crash reports in Xcode
- [ ] Check reviews and ratings
- [ ] Prepare next update if bugs found

---

## SECTION 2: GOOGLE PLAY STORE (Android)

### Step 2.1: Set Up Google Play Developer Account
**Cost:** $25 one-time registration fee
**Timeline:** 30-45 minutes (plus verification time)
**What to Do:**

1. Go to play.google.com/console
2. Click "Create account" or sign into existing Google account
3. Fill in account information:
   - Developer name (company or personal)
   - Email address
   - Phone number
   - Address (must be complete)
4. Agree to Google Play Developer Program Policies
5. Pay $25 registration fee (one-time)
6. Complete identity verification:
   - Upload government-issued ID (passport, driver's license)
   - Verify address (utility bill, bank statement, tax return)
   - This takes 24-48 hours to approve

**Account Verification Important Notes:**
- Use a real government ID matching your name
- Address document must show your current address
- Utility bill/bank statement must be from last 3 months
- If verification fails, Google will tell you why—fix and resubmit
- Account locked if verification fails repeatedly

---

### Step 2.2: Prepare Your App Binary (Android)
**Requirements (August 2026):**
- Target API Level: 36 (Android 16) by August 31, 2026
- Minimum API Level: 26 (Android 8.0) recommended, 24+ generally accepted
- Must build as Android App Bundle (.aab format) - NOT APK for new apps
- Must sign with your app signing key
- Must use 64-bit architecture

**Build Preparation Checklist:**
- [ ] Update build.gradle: `targetSdk 36`
- [ ] Compile with latest Android SDK (36)
- [ ] No deprecated APIs used
- [ ] Test on Android 8.0, 12.0, and 16.0 devices/emulators
- [ ] Check for crashes in Logcat
- [ ] Verify all permissions are declared in AndroidManifest.xml
- [ ] Build .aab file (not APK):
  ```
  ./gradlew bundleRelease
  ```
- [ ] Sign the bundle with your keystore
- [ ] Test signed bundle locally

**Creating Signing Key (if new):**
```
keytool -genkey -v -keystore my-release-key.keystore -keyalg RSA -keysize 2048 -validity 10000 -alias my-key-alias
```

**Important:** Save your keystore file and password. Losing it means you can't update your app.

---

### Step 2.3: Create Application in Google Play Console
**Timeline:** 5 minutes
**Steps:**

1. Log into Google Play Console
2. Click "Create app" button (or "New app")
3. Enter app name (30 characters max)
4. Select default language
5. Choose app type:
   - App (most common)
   - Game
   - Movie
6. Confirm content rating category (apps are default)
7. Click "Create app"

**App Name Important Notes:**
- This is what appears on Play Store
- You can have a longer "Full app name" (50 chars) and shorter "Subtitle"
- Name must reflect actual app purpose (no misleading titles)
- Changing name later requires resubmission

---

### Step 2.4: Set Up Store Listing
**Timeline:** 30-45 minutes
**Location:** Google Play Console → Your App → "Store presence" → "Main store listing"

#### Basic Information:
- [ ] App name (30 chars max, shown on store)
- [ ] Full app name (50 chars, optional but recommended)
- [ ] Subtitle (optional, but improves UX)
- [ ] Category (must choose one)
- [ ] Category must reflect app purpose

#### Short Description (80 characters max):
"Fast task management. Collaborate with your team in real-time."

#### Full Description (4,000 characters max):
Write 3-5 paragraphs covering:
- What your app does
- Key features (3-5 bullet points)
- Who it's for
- Any unique benefits
- Call to action

**Description Tips:**
- Lead with value, not features
- Use short paragraphs (mobile reading)
- Include keywords naturally
- No keyword stuffing
- No phone numbers or emails in description (use support tab)

#### Contact Information:
- [ ] Support email address (monitored and responsive)
- [ ] Support website (optional but recommended)
- [ ] Privacy policy URL (must be HTTPS)

**Privacy Policy Checklist:**
- [ ] Accessible as URL
- [ ] Valid SSL certificate (HTTPS)
- [ ] Mobile-responsive
- [ ] Lists all data collection
- [ ] Explains data usage
- [ ] No generic/placeholder text
- [ ] Matches actual app behavior

#### App Icon:
- [ ] 512x512 PNG
- [ ] Must not contain alpha transparency
- [ ] Must be high quality
- [ ] Rounded corners applied by Play Store
- [ ] Should be distinctive and recognizable at small sizes

#### Feature Graphic (Banner):
- [ ] 1024x500 PNG or JPG
- [ ] Optional but recommended
- [ ] Shows at top of store listing
- [ ] Highlight key feature or value proposition

---

### Step 2.5: Upload Screenshots
**Timeline:** 15-20 minutes
**Requirements:**
- Minimum: 2 screenshots
- Maximum: 8 screenshots
- Required orientations: Portrait (phone)
- Optional: Landscape and tablet screenshots
- Format: PNG or JPG, 16:9 or 20:9 aspect ratio
- Size: 1080x1920 or higher

**Phone Screenshot Specs:**
- Portrait orientation
- 1080x1920 pixels (minimum)
- 20:9 aspect ratio acceptable
- PNG or JPG format
- Shows actual app interface (not marketing mockups)

**Tablet Screenshots (optional, recommended):**
- Minimum: 1280x800 (10-inch tablet equivalent)
- Landscape or portrait

**Screenshot Strategy:**
1. First screenshot: Show main benefit (hook user)
2. 2-3 screenshots: Show core features
3. Last screenshot: Call to action

**Tools:**
- Android Studio emulator (built-in screenshot)
- Scrcpy (real device screenshot)
- Figma or Photoshop (add text overlays)

---

### Step 2.6: Complete Content Rating Questionnaire
**Timeline:** 10-15 minutes
**Location:** Google Play Console → Content rating

Fill out questionnaire covering:
- Violence
- Sexual content
- Profanity
- Alcohol/tobacco/drugs
- Gambling
- Medical claims
- Online contact (user-generated content)
- Unrestricted internet access
- Financial transactions
- Location data

**Rating System:**
- ESRB (US/Canada)
- PEGI (Europe)
- ClassInd (Brazil)
- GRB (South Korea)
- USK (Germany)

**Important:** Answer honestly. False ratings risk app removal. You get automatic rating once submitted.

---

### Step 2.7: Set Up Data Safety Form (CRITICAL)
**Timeline:** 15-30 minutes
**Location:** Google Play Console → Data safety
**Rejection Rate if Wrong:** 40%+ of rejections are due to incomplete/inaccurate Data Safety

**Step-by-step:**

1. **Declare All Data Collected:**
   - [ ] User ID / authentication
   - [ ] Email address
   - [ ] Phone number
   - [ ] Name
   - [ ] Address / location
   - [ ] Photos / videos
   - [ ] Contacts
   - [ ] Calendar data
   - [ ] Messages / emails
   - [ ] Search/browsing history
   - [ ] Payment information
   - [ ] Health data
   - [ ] Fitness data
   - [ ] Identifiers (IDFA, AAID, etc.)
   - [ ] Diagnostics (crash reports, performance data)
   - [ ] Precise location (GPS)
   - [ ] Approximate location
   - [ ] Other data specific to your app

2. **For Each Data Type, Answer:**
   - **Is this data collected?** Yes/No
   - **Is it linked to user identity?** Yes/No
   - **Is it used for tracking?** (tracking across apps/websites) Yes/No
   - **Why is this data needed?** (choose from provided reasons)
   - **Is it optional?** Users can choose not to provide? Yes/No

3. **Declare All Data Sharing:**
   For each data type collected, specify:
   - **Is this shared with third parties?** Yes/No
   - **If yes, who?** List all third parties:
     - Analytics: Firebase, Mixpanel, Amplitude, etc.
     - Ads: Google Ads, Meta Audience Network, etc.
     - Backend: AWS, Google Cloud, Azure, Firebase
     - Social: Facebook SDK, Twitter SDK, etc.
     - Any custom APIs

4. **Set Data Retention:**
   - How long is data kept?
   - Is data deleted on app uninstall?
   - Can users request deletion?

5. **Encryption:**
   - Is data encrypted in transit? (HTTPS)
   - Is data encrypted at rest?

**Common Data Safety Mistakes (Cause Rejections):**
- "We don't collect any data" but have Firebase analytics
- Missing Firebase or crash reporting declaration
- Not listing ad network data sharing
- Claiming no tracking but using Google Analytics with user ID
- Privacy policy says one thing, Data Safety says another

**Match With Privacy Policy:**
Every data type in Data Safety must be mentioned in your Privacy Policy. If mismatch found, app is rejected.

---

### Step 2.8: Prepare for Initial Release (Testing Phase)
**IMPORTANT:** If your Google Play account was created AFTER November 13, 2023, you MUST run an internal test with real users first.

**Timeline:** Minimum 14 days before production release

**What to Do:**

1. In Google Play Console → "Testing" → "Internal testing"
2. Click "Create new release"
3. Upload your .aab file
4. Fill in release notes (brief description of changes)
5. Click "Review release"
6. You get a testing link
7. Share link with at least 12 real people
8. They install and use app for 14 consecutive days
9. Monitor for crashes in "Android Vitals" dashboard
10. Once 14 days complete, you can move to production

**Testing Release Checklist:**
- [ ] .aab file uploaded successfully
- [ ] Release notes written
- [ ] At least 12 testers invited
- [ ] Testers are real people (not fake accounts)
- [ ] App runs for 14+ days without critical crashes
- [ ] No crashes in Android Vitals dashboard
- [ ] Document feedback from testers
- [ ] Fix critical bugs found during testing
- [ ] Re-upload updated .aab if bugs fixed

**Crash Monitoring During Test:**
- Go to "Android Vitals" in Play Console
- Check crash rate (should be < 0.1%)
- Check ANR (Application Not Responding) rate
- Review specific crashes listed
- Fix before production release

---

### Step 2.9: Set Up Pricing & Distribution
**Timeline:** 5-10 minutes
**Location:** Pricing and distribution section

- [ ] Choose pricing: Free or Paid ($0.99 - $399.99)
- [ ] Select countries/regions where app is available
- [ ] If paid app, review pricing in different regions
- [ ] Set target audience (countries, languages)
- [ ] Choose content rating (if not done yet)
- [ ] Confirm app is suitable for chosen regions

**Regional Pricing Tips:**
- Google automatically converts USD price to local currency
- Some regions have price tiers (e.g., €0.99, £0.99)
- Consider local purchasing power when setting prices
- Free apps are available in all regions by default

---

### Step 2.10: Submit for Production Review (Post-Testing)
**Timeline:** 5 minutes
**Steps:**

1. In Google Play Console → "Testing" → "Internal testing"
2. Review your tested release
3. Click "Promote release"
4. Select "Production"
5. Update release notes if needed
6. Click "Review release"
7. Review all sections (store listing, data safety, etc.)
8. Click "Submit release"

**Pre-Submission Checklist:**
- [ ] Store listing complete
- [ ] Screenshots added and clear
- [ ] Privacy policy URL working
- [ ] Data Safety form 100% complete
- [ ] Content rating completed
- [ ] .aab file uploaded and builds successfully
- [ ] No critical issues in Android Vitals
- [ ] All permissions declared and justified

**What Happens Next:**
- App enters review queue
- Google typically reviews in 2-7 days
- You get email when review starts and completes
- ~90-95% of apps approved on first submission

---

### Step 2.11: Monitor Review & Handle Rejections
**Timeline:** 2-7 days for review

**Check Status:**
1. Google Play Console → Release overview
2. Look for status updates
3. Check email for review notifications

**Possible Review Outcomes:**
- **Approved** - Congratulations! App goes live
- **Rejected** - Review feedback explains why
- **Under Review** - Still being checked
- **Scheduled** - Ready to release on specific date

**Common Rejection Reasons (and fixes):**

1. **"Inaccurate Data Safety form"**
   - Review app's actual data collection
   - Compare with Data Safety declarations
   - Fix mismatches
   - Re-submit explaining what was corrected

2. **"Broken or missing privacy policy"**
   - Test privacy policy URL (copy-paste exact URL)
   - Verify HTTPS works
   - Ensure page loads on mobile
   - Add to app settings/about section link

3. **"Targeting outdated API level"**
   - Update targetSdk to 36 in build.gradle
   - Rebuild as .aab
   - Re-upload

4. **"Sensitive permission without justification"**
   Most common: `ACCESS_BACKGROUND_LOCATION`
   - Only use if app MUST track location when closed
   - Provide video/screenshot showing use case
   - Example: Ride-sharing, emergency, delivery tracking
   - Submit with detailed explanation

5. **"App crashes during testing"**
   - Download app from Play Console testing link
   - Test all main flows
   - Check logcat for crashes
   - Fix crashes, increment version
   - Re-upload .aab

6. **"Misleading app description"**
   - Ensure description matches actual functionality
   - Don't oversell features
   - Remove unimplemented features from description

**If Rejected:**
1. Read Google's detailed rejection feedback
2. Fix the specific issue
3. Increment version number in build.gradle
4. Rebuild .aab file
5. Re-upload in same release draft (or create new)
6. Re-submit for review
7. Repeat process (2-7 days)

---

### Step 2.12: Release to Play Store
**Timeline:** Instant (once approved)
**Steps:**

1. Google Play Console → Your app → Release overview
2. Status shows "Approved"
3. Click "Release to production" or similar button
4. Confirm release details
5. Set release date (immediate or scheduled)
6. Click "Release"

**After Release:**
- [ ] App appears on Play Store within 1-3 hours
- [ ] Monitor Android Vitals for crashes
- [ ] Check user reviews and ratings
- [ ] Respond to reviews
- [ ] Plan updates if bugs found

---

## SECTION 3: CHECKLIST SUMMARY

### Before You Start Either Store:
- [ ] App fully tested on real devices
- [ ] No crashes during extended testing
- [ ] Privacy policy written and hosted (HTTPS)
- [ ] Contact email monitored
- [ ] Screenshots prepared (high quality)
- [ ] App icon 1024x1024 PNG
- [ ] App description written
- [ ] All third-party SDKs declared
- [ ] Payment method on file

### Apple App Store Specific:
- [ ] Apple Developer account ($99/year)
- [ ] Built with Xcode 16+
- [ ] Built with iOS 26 SDK or later
- [ ] Targets iOS 16.0+
- [ ] Screenshots for 6.9-inch display
- [ ] AI content disclosure (if applicable)
- [ ] Account deletion feature (if accounts exist)
- [ ] Privacy labels complete
- [ ] Content rating questionnaire
- [ ] Bundle ID created and matches Xcode

### Google Play Store Specific:
- [ ] Google Play Developer account ($25 one-time)
- [ ] Identity verified (government ID + address proof)
- [ ] Built targeting API 36
- [ ] Built as .aab file
- [ ] App signed with keystore
- [ ] Data Safety form 100% complete
- [ ] Screenshots in 1080x1920+
- [ ] Feature graphic 1024x500
- [ ] Content rating questionnaire
- [ ] Testing phase completed (14 days, 12 users minimum)

---

## SECTION 4: COMMON PITFALLS & HOW TO AVOID THEM

### Pitfall 1: Privacy Policy Issues
**Problem:** Broken link, generic text, doesn't match app behavior
**Solution:** 
- Write specific policy for YOUR app
- Host on real website (HTTPS required)
- Test link from both app stores
- Update when you change data collection
- Make it mobile-responsive

### Pitfall 2: Incomplete or Inaccurate Data Safety (Google) / Privacy Labels (Apple)
**Problem:** Declare less data than actually collected
**Solution:**
- Audit app code for all data collection
- Check all third-party SDKs used
- List Firebase, analytics, ads, crash reporting
- Match with privacy policy
- Update whenever you add new features

### Pitfall 3: App Crashes During Store Testing
**Problem:** App crashes on some devices/scenarios
**Solution:**
- Test on minimum API level devices
- Test edge cases (bad network, low memory)
- Use crash reporting during testing phase
- Monitor Android Vitals before production
- Use Xcode Console for iOS crashes

### Pitfall 4: Misleading Description or Permissions
**Problem:** Description claims features app doesn't have, or app requests unnecessary permissions
**Solution:**
- Only describe implemented features
- Remove permissions not needed
- If you use a permission, explain why
- Justify sensitive permissions with use case

### Pitfall 5: Wrong Binary Format
**Problem:** Submitting APK instead of AAB for Android
**Solution:**
- Always use .aab for new apps (Google requirement)
- Gradle bundleRelease command builds .aab
- Never upload APK to production

### Pitfall 6: Outdated SDK or API Level
**Problem:** Build with old Android API, iOS SDK
**Solution:**
- Keep development tools updated
- Check store requirements quarterly
- Update build.gradle and Xcode settings
- Test on latest OS versions

### Pitfall 7: Skipping Testing Phase on Play Store
**Problem:** New account creators think they can skip 14-day test
**Solution:**
- Accounts created after Nov 13, 2023 must test
- Recruit 12+ real testers
- Run test for full 14 days
- Monitor crashes during testing
- Then promote to production

### Pitfall 8: Missing Account Deletion (Apple)
**Problem:** App allows accounts but no deletion method
**Solution:**
- Add Settings → Account → Delete Account option
- Or document email-based deletion process
- Test deletion works
- Keep backup deletion method

---

## SECTION 5: POST-LAUNCH MAINTENANCE

### First Week After Launch:
- [ ] Monitor crash rates daily
- [ ] Check reviews 2-3x per day
- [ ] Respond to user feedback
- [ ] Fix critical bugs immediately
- [ ] Check server/backend stability

### First Month:
- [ ] Aim for 4.0+ star rating
- [ ] Respond to all reviews
- [ ] Release hotfixes for bugs
- [ ] Monitor user retention
- [ ] Plan first feature update

### Ongoing:
- [ ] Update for new OS versions within 90 days
- [ ] Respond to reviews (builds trust)
- [ ] Release features every 2-4 weeks
- [ ] Keep privacy policy updated
- [ ] Monitor Data Safety/Privacy Labels accuracy
- [ ] Update screenshots when UI changes

---

## SECTION 6: USEFUL LINKS & RESOURCES

### Apple Resources:
- App Store Connect: https://appstoreconnect.apple.com
- Apple Developer Program: https://developer.apple.com
- App Store Review Guidelines: https://developer.apple.com/app-store/review/guidelines
- Xcode: https://developer.apple.com/xcode

### Google Resources:
- Google Play Console: https://play.google.com/console
- Play Store Help Center: https://support.google.com/googleplay
- Android Development: https://developer.android.com
- Android Studio: https://developer.android.com/studio

### Tools:
- TestFlight (iOS testing): https://developer.apple.com/testflight
- Firebase (analytics/crashlytics): https://firebase.google.com
- Figma (screenshots): https://figma.com
- App Store Optimization tools: Sensor Tower, App Annie (data.ai)

---

## ESTIMATED TIMELINE

### If Starting Today:
- **Day 1-2:** Prepare all assets (screenshots, descriptions, icons)
- **Day 3:** Apple Developer account setup ($99)
- **Day 4:** Set up App Store Connect, complete all app info
- **Day 5:** Build iOS binary, submit for review
- **Day 1-2:** Google Play Developer account setup ($25 + verification)
- **Day 3-4:** Set up Play Console, complete store listing, Data Safety
- **Day 5-18:** Internal testing phase (14 days mandatory)
- **Day 19:** Submit Play Store for review
- **Day 6-7:** iOS approval (24-48 hours)
- **Day 20-26:** Android approval (2-7 days)
- **Day 6-26:** Both apps live on stores

**Total time:** 3-4 weeks from start to both stores live (accounting for testing and review time)

**If No Issues:** 2-3 weeks possible

**If Rejections:** Add 7-14 days per rejection

---

## ESTIMATED COSTS

### Upfront:
- Apple Developer: $99/year
- Google Play: $25 (one-time)
- **Total: $124**

### Optional but Recommended:
- Design tools: $0-20/month (Figma free tier available)
- Screenshot tools: $0-10/month
- App hosting/backend: Varies
- Analytics: $0 (many free options)

---

## FINAL CHECKLIST BEFORE SUBMITTING

### Apple:
- [ ] Account created and verified
- [ ] App ID created in App Store Connect
- [ ] All store information filled in
- [ ] 6+ screenshots uploaded for 6.9-inch
- [ ] App description, keywords filled in
- [ ] Privacy policy URL tested and working
- [ ] Privacy labels complete and accurate
- [ ] Content rating questionnaire completed
- [ ] Pricing set
- [ ] Build uploaded and appearing in Builds section
- [ ] Build selected for submission
- [ ] All warnings/alerts resolved
- [ ] Submit for Review button clicked

### Google Play:
- [ ] Account created and identity verified
- [ ] Internal testing completed (14 days, 12 users)
- [ ] Store listing 100% complete
- [ ] Screenshots uploaded (minimum 2)
- [ ] Privacy policy URL tested and working
- [ ] Data Safety form completed without gaps
- [ ] Content rating questionnaire completed
- [ ] .aab file uploaded successfully
- [ ] Pricing set
- [ ] No crashes in Android Vitals
- [ ] Review release page shows no errors
- [ ] Submit for Review button clicked

---

## YOU'RE READY!

If you've completed all sections above, you have everything needed to launch on both stores. Submit with confidence—the detailed planning prevents 99% of rejections.

**Any questions?** Check the store-specific guidelines or reply to your review feedback with questions.

Good luck! 🚀
