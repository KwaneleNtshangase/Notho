#!/usr/bin/env bash
# Scaffold the Notho native apps. Safe to re-run.
# Usage:  bash store-launch/_tools/setup-capacitor.sh
set -euo pipefail

cd "$(dirname "$0")/../.."
ROOT="$PWD"
echo "▸ Notho native setup — $ROOT"

if [ ! -f capacitor.config.ts ]; then
  echo "✗ capacitor.config.ts missing. Expected it in the repo root."
  exit 1
fi

echo "▸ Installing Capacitor…"
npm install --save @capacitor/core @capacitor/cli @capacitor/ios @capacitor/android

echo "▸ Installing the plugins the store guides assume…"
npm install --save \
  @capacitor/browser \
  @capacitor/app \
  @capacitor/push-notifications \
  @capacitor/share \
  @capacitor/haptics \
  @capacitor/preferences \
  @capacitor/splash-screen

# webDir must exist before the CLI will add a platform.
mkdir -p public

if [ ! -d ios ]; then
  echo "▸ Adding iOS…"
  npx cap add ios
else
  echo "▸ iOS already present, skipping."
fi

if [ ! -d android ]; then
  echo "▸ Adding Android…"
  npx cap add android
else
  echo "▸ Android already present, skipping."
fi

# ---------------------------------------------------------------- icons
echo "▸ Copying generated icons into the native projects…"

AND_RES="android/app/src/main/res"
if [ -d "$AND_RES" ]; then
  for d in mdpi hdpi xhdpi xxhdpi xxxhdpi; do
    src="store-launch/03-icons/android/mipmap-$d"
    dst="$AND_RES/mipmap-$d"
    if [ -d "$src" ]; then
      mkdir -p "$dst"
      cp "$src"/*.png "$dst"/ 2>/dev/null || true
    fi
  done
  echo "  ✓ Android launcher icons"
fi

IOS_SET=$(find ios -type d -name "AppIcon.appiconset" 2>/dev/null | head -1)
if [ -n "$IOS_SET" ]; then
  cp store-launch/03-icons/ios/*.png "$IOS_SET"/ 2>/dev/null || true
  cp store-launch/03-icons/store/app-store-icon-1024.png "$IOS_SET/Icon-1024.png" 2>/dev/null || true
  echo "  ✓ iOS app icons → $IOS_SET"
  echo "    (open Xcode once and drag them into the AppIcon slots if any are empty)"
fi

echo "▸ Syncing native projects…"
npx cap sync

cat <<'DONE'

✓ Native projects ready.

Next, and in this order:

  1. Read store-launch/06-capacitor-setup.md — three blockers are documented
     there. The OAuth one WILL break sign-in if you skip it.

  2. iOS:      npx cap open ios
               Set your Team under Signing & Capabilities.
               Add the Push Notifications capability.

  3. Android:  npx cap open android
               Confirm targetSdk 36 in android/app/build.gradle.
               Generate a signed App Bundle, and BACK UP THE KEYSTORE.

DONE
