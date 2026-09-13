# Notho Store Submission - Quick Checklist

Print this. Check items off as you complete them.

---

## 🚀 START HERE (This Week)

- [ ] **Read** `STORE_READINESS_ASSESSMENT.md` (overview)
- [ ] **Read** `IMMEDIATE_ACTION_PLAN.md` (how-to guide)
- [ ] **Decide:** Use Capacitor (recommended)

---

## 📱 WEEK 1: ASSETS & DATA

### Screenshots (Days 1-4)
- [ ] Take screenshots of 5 key app screens
- [ ] Edit in Figma/Photoshop with text overlays
- [ ] Export for iPhone: 1440x3088, 1179x2556, 1125x2436
- [ ] Export for Android: 1080x1920
- [ ] Save to: `/public/screenshots/`

### Description & Keywords (Days 1-3)
- [ ] Write full app description (4000 chars)
- [ ] Create keyword list (search terms)
- [ ] Write promotional text (80 chars)
- [ ] Save to: `/docs/store-assets/`

### Graphic Assets (Days 3-4)
- [ ] Create Android feature graphic: 1024x500 PNG
- [ ] Verify app icon: 512x512 PNG
- [ ] Save to: `/public/screenshots/`

### Data & Privacy (Days 5-6)
- [ ] Complete data safety audit
- [ ] Document all data collected
- [ ] List all third-party services
- [ ] Save to: `/docs/DATA_SAFETY_AUDIT.md`

### Account Deletion (Days 6)
- [ ] Add delete button to Settings page
- [ ] Create `/api/user/delete` endpoint
- [ ] Test deletion works end-to-end
- [ ] Update privacy policy

---

## 🔧 WEEK 2: DEVELOPMENT & SETUP

### Capacitor Setup (Days 1-2)
- [ ] `npm install @capacitor/core @capacitor/cli`
- [ ] `npx cap init Notho co.notho.app`
- [ ] `npx cap add ios`
- [ ] `npx cap add android`
- [ ] `npm run build`
- [ ] `npx cap copy ios && npx cap copy android`

### Store Accounts (Days 3-4)
- [ ] Create Apple Developer account ($99/year)
- [ ] Create Google Play account ($25)
- [ ] Complete Google identity verification
- [ ] Note down developer IDs and credentials

### App Creation (Days 5)
- [ ] Create app in App Store Connect (Bundle ID: co.notho.app)
- [ ] Create app in Google Play Console

### Store Metadata (Days 5-6)
- [ ] **Apple:**
  - [ ] Upload screenshots
  - [ ] Fill in description
  - [ ] Complete privacy labels
  - [ ] Answer content rating
  - [ ] Set pricing/availability

- [ ] **Google:**
  - [ ] Upload screenshots
  - [ ] Upload feature graphic
  - [ ] Fill in description
  - [ ] Complete data safety form
  - [ ] Answer content rating
  - [ ] Set pricing/distribution

---

## 🏗️ WEEK 3: BUILD & SUBMIT

### iOS Build (Days 1-2)
- [ ] `npx cap open ios`
- [ ] In Xcode: Product → Archive
- [ ] Distribute to App Store Connect
- [ ] Upload binary

### Android Build (Days 1-2)
- [ ] `npx cap open android`
- [ ] Build → Generate Signed App Bundle
- [ ] Create signing keystore (first time only)
- [ ] Upload .aab to Play Console

### iOS Submission (Days 3)
- [ ] App Store Connect → Submit for Review
- [ ] Monitor review status (24-48 hrs typical)
- [ ] If rejected: Read feedback, fix, re-submit

### Android Testing (Days 3-5)
- [ ] Create internal test in Play Console
- [ ] Upload .aab
- [ ] Generate testing link
- [ ] Share with 12+ real testers
- [ ] **WAIT 14 DAYS** (mandatory)
- [ ] Monitor Android Vitals for crashes

---

## 🎉 WEEK 4: LAUNCH

### iOS Release
- [ ] Check if app approved in App Store Connect
- [ ] Click "Release This Version"
- [ ] Verify live on App Store

### Android Release (after 14-day testing)
- [ ] Complete 14-day internal testing
- [ ] Promote release to Production
- [ ] Submit for review (2-7 days)
- [ ] Once approved, click "Release"
- [ ] Verify live on Play Store

### Post-Launch
- [ ] Monitor crash reports
- [ ] Respond to user reviews
- [ ] Track download/install numbers
- [ ] Plan next update/features

---

## ✅ FINAL CHECKLIST (Before Each Submission)

### Before iOS Submission
- [ ] Screenshots uploaded (all sizes)
- [ ] Privacy labels completed
- [ ] Content rating answered
- [ ] Promotional text filled in
- [ ] Bundle ID matches code (co.notho.app)
- [ ] Build number incremented
- [ ] No outstanding warnings in App Store Connect
- [ ] Account deletion feature implemented
- [ ] Privacy policy live and accessible

### Before Android Submission
- [ ] Screenshots uploaded (minimum 2)
- [ ] Feature graphic uploaded
- [ ] Data Safety form 100% complete (no blanks)
- [ ] Content rating answered
- [ ] Description filled in
- [ ] Keywords added
- [ ] .aab file builds without errors
- [ ] App signed with keystore
- [ ] No crashes in Android Vitals
- [ ] Privacy policy live and accessible

---

## 📞 CONTACT INFO NEEDED

Before you start, have these ready:

```
Company Name: The Solution Org (Pty) Ltd
Country: South Africa
Support Email: support@notho.co.za
Support Website: https://notho.co.za
Privacy Policy: https://notho.co.za/privacy
Terms & Conditions: https://notho.co.za/terms
Website: https://notho.co.za
```

---

## 💰 COSTS

| Item | Cost | When |
|------|------|------|
| Apple Developer | $99 | Week 2 |
| Google Play | $25 | Week 2 |
| Design assets (optional) | $0-300 | Week 1 |
| **TOTAL** | **$124-424** | - |

---

## ⏱️ TIMELINE

| Phase | Duration | Weeks |
|-------|----------|-------|
| Assets & metadata | 5-6 days | Week 1 |
| Development & setup | 5-6 days | Week 2 |
| Build & submit | 7 days | Week 3 |
| Reviews & testing | 14-21 days | Week 3-4 |
| **TOTAL TO LAUNCH** | **4-5 weeks** | - |

---

## 🆘 IF REJECTED

**Apple Rejection:**
1. Read feedback carefully
2. Fix the specific issue
3. Increment build number
4. Re-archive and upload
5. Resubmit for review
6. Wait 24-48 hours

**Google Rejection (during testing):**
1. Read feedback
2. Fix issue
3. Increment version in build.gradle
4. Rebuild .aab
5. Update same test release
6. Resubmit for review

**Common Rejection Reasons:**
- Broken/missing privacy policy link → Test link directly
- Incomplete Data Safety → Fill every field, no blanks
- Account deletion missing → Add Settings → Delete Account
- App crashes → Test on real device, check logs
- Misleading description → Match description to actual features

---

## 🎯 SUCCESS CRITERIA

✅ App appears on App Store  
✅ App appears on Play Store  
✅ Both have 5+ star ratings within 2 weeks  
✅ Zero critical crashes in first week  
✅ Users can sign in and use core features  
✅ Account deletion works  
✅ Privacy policy accessible  

---

## 📞 HELP RESOURCES

- App Store Review Guidelines: https://developer.apple.com/app-store/review/guidelines
- Google Play Policies: https://play.google.com/about/privacy-security-deception/
- Capacitor Docs: https://capacitorjs.com/docs
- Xcode Help: Xcode → Help → Xcode Help
- Android Studio Help: Help → Android Studio Help

---

## WHAT TO DO RIGHT NOW

### This Hour:
1. Read `STORE_READINESS_ASSESSMENT.md`
2. Read this checklist

### Today:
3. Take screenshots of your app
4. Create `/docs/store-assets/` folder

### This Week:
5. Complete all Week 1 items
6. Don't skip account deletion feature

### Next Week:
7. Set up Capacitor
8. Create store accounts

### Week 3:
9. Build and submit
10. Monitor reviews

### Week 4:
11. Launch and celebrate! 🎉

---

## QUESTIONS?

Refer to these documents in order:
1. `QUICK_CHECKLIST.md` (this file) - Quick reference
2. `IMMEDIATE_ACTION_PLAN.md` - Step-by-step tasks
3. `STORE_READINESS_ASSESSMENT.md` - Deep dive details
4. `App_Store_Play_Store_Publishing_Guide_2026.md` - Complete reference

---

**You've got this. Start with screenshots. That's your bottleneck.** ✌️
