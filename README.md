# Notho

Notho is a South African financial-literacy, learning and personal-budgeting application. The web application is built with Next.js and is packaged for iOS and Android with Capacitor.

## Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000` during local development. Validate a production build with:

```bash
npm run build
```

## Repository map

- `src/`: application source code.
- `public/`: files served directly by the website and bundled into native apps.
- `ios/`: Xcode project and iOS runtime assets.
- `android/`: Android project and runtime assets.
- `supabase/`: database migrations and server functions.
- `e2e/`: browser end-to-end tests.
- `Logos/`: authoritative editable logo artwork and master exports.
- `store-launch/`: current App Store and Play Store submission material.
- `docs/`: technical guides, audits and archived working notes.
- `Business/`, `Research/`, `Analytics/`, `Learning Material/`: source document libraries.

See `Logos/README.md` before changing branding and `store-launch/README.md` before preparing a store submission.
