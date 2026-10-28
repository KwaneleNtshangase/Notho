# Notho store launch

This folder contains the current instructions and evidence needed for Apple App Store and Google Play submissions.

## Current files

- `01-APPLE-App-Store-Connect.md`: Apple metadata, privacy and review fields.
- `02-GOOGLE-Play-Console.md`: Google Play metadata and data-safety fields.
- `06-capacitor-setup.md`: native wrapper and platform notes.
- `07-APPLE-GUIDELINE-2.1-RESPONSE.md`: response and physical-device video checklist for the current Apple review request.
- `_tools/build_android_native_assets.py`: regenerates Android runtime icons and splash assets from `Logos/`.
- `archive/`: older launch plans and checklists retained for reference only.

## Asset policy

Editable artwork and master exports belong in `Logos/`. Runtime copies remain in `public/`, the iOS asset catalog and Android resources. Store-specific screenshots or graphics should go under `store-launch/assets/` only while a submission needs them.

Build `1.0 (4)` was uploaded to App Store Connect on 13 September 2026. Before resubmission, select that processed build, attach the requested physical-device video, paste the six answers from `07-APPLE-GUIDELINE-2.1-RESPONSE.md`, and confirm the review account still works.
