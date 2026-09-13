# Notho brand assets

This is the only source-of-truth folder for editable Notho logos and master exports.

## Structure

```text
Logos/
├── source/       Editable Illustrator masters
├── svg/          Scalable exports for design and web work
└── png/
    ├── app-icon/  Apple and store icon masters
    └── brand/     Large transparent icon and wordmark exports
```

## Canonical files

- `source/notho-icon-master.ai`: editable icon master.
- `source/notho-wordmark-master.ai`: editable wordmark master.
- `png/app-icon/notho-app-icon-light-1024.png`: opaque 1024×1024 default iOS icon.
- `png/app-icon/notho-app-icon-dark-1024.png`: transparent 1024×1024 dark iOS icon.
- `png/brand/notho-icon.png`: large transparent colour icon.
- `png/brand/notho-icon-on-dark.png`: large icon for dark surfaces.
- `png/brand/notho-wordmark.png`: large wordmark export.
- `png/store/notho-play-store-icon-512.png`: Google Play listing icon generated from the light app icon.

Add these SVG exports when the Illustrator artwork is final:

- `svg/notho-icon.svg`
- `svg/notho-icon-on-dark.svg`
- `svg/notho-wordmark.svg`
- `svg/notho-wordmark-on-dark.svg`

Do not add dated copies, alternate experiments, or generated size collections here. Git history preserves previous versions.

## Required deployment copies

The copies below deliberately live outside `Logos` because the applications need them at runtime:

- `public/`: website, PWA, email and report assets.
- `ios/App/App/Assets.xcassets/AppIcon.appiconset/`: iOS Any and Dark app icons.
- `android/app/src/main/res/`: Android launcher and splash resources.

Generate those deployment copies from the canonical files above; never treat a runtime copy as the editable master.

## Brand colours

- Teal: `#01A0AA` for graphics; accessible deep teal `#007A85` for text and buttons.
- Gold: `#EFB343` for decorative elements.
- Navy: `#0D368D` for headings and high-contrast text.
- Dark-mode primary: `#20D3CF`.
