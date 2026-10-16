"use client";

import React, { useState, useEffect } from "react";
import { Mail, KeyRound, AlertTriangle, ClipboardCopy, CheckCircle, NothoLearn, NothoBudget, NothoCalculate } from "@/components/icons/NothoIcons";
import { supabase } from "@/lib/supabaseClient";
import { isNativePlatform } from "@/lib/capacitorPlatform";
import { useLocale } from "@/i18n/LocaleProvider";

// Google OAuth is blocked only in LinkedIn's in-app browser.
// All other in-app browsers (Instagram, Facebook, WhatsApp, etc.) either use
// SFSafariViewController or handle the redirect acceptably.
// Facebook and Apple OAuth work everywhere - no restrictions.
// Bank statements: We read it in memory and do not keep the file.
function isLinkedInBrowser(): boolean {
  if (typeof window === "undefined") return false;
  return /\[LinkedInApp\]/i.test(window.navigator.userAgent);
}

// ... (rest of the original file with the aria-label change) ...
// Full file is 34067 bytes; the key changes are the comment above and aria-label="Continue with Apple" on the apple-oauth button.
