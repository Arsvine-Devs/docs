# Development Guide

This document is the day-to-day development guide for ARSVINE REALM.

## Runtime baseline

- Node.js: **24.x** (production target). Local Node 20.9+ may work.
- Package manager: **pnpm**.
- Framework mode: Next.js Pages Router (not App Router).
- Server entry: `server.js` used in both dev and production.

Do not replace scripts with `next dev` or `next start`.

## Quick start

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Open `http://localhost:3000`.

## Common commands

```bash
pnpm dev           # node server.js
pnpm build         # next build
pnpm start         # cross-env NODE_ENV=production node server.js
pnpm lint          # eslint .
pnpm typecheck     # tsc --noEmit
pnpm test          # vitest run
pnpm check         # lint + typecheck + test + build
```

Run a single test:

```bash
pnpm vitest run lib/blog-client.test.ts
pnpm vitest run -t "reading time"
```

Tests live under `tests/` grouped by feature area.

## Local environment

Start from `.env.example`:

```env
PORT=3000
NEXT_PUBLIC_SITE_URL=https://arsvine.com
# GITHUB_OWNER=ArsvineZhu
# GITHUB_REPO=arsvine-content
# GITHUB_BRANCH=main
# GITHUB_READ_TOKEN=github_pat_xxx
```

Rules:
- `NEXT_PUBLIC_*` variables are exposed to the browser.
- Secrets go server-side only.
- Without content repo variables, blog falls back to `content/blog/init/`.
- Set `TWEETS_STRESS_TEST=1` to exercise tweet archive UI without a live repo.

## Local COS Referer workflow

The media bucket allows only Referer values matching `arsvine.com`.

```powershell
scripts\dev-host-setup.cmd
```

This adds `127.0.0.1 dev.arsvine.com` to the Windows hosts file, starts dev on port 80, and cleans up on exit.

Open `http://dev.arsvine.com`.

## Data and content editing

For routine content changes, prefer:

```text
data/                 # site config, projects, experience, life, skills, friend links, music
content/blog/init/    # bundled fallback blog post
locales/              # next-intl UI strings
public/               # static assets
config/               # runtime config
```

When adding a locale, update all of:
- `i18n/config.ts`
- `locales/<locale>.json`
- every relevant `data/<topic>/<locale>.ts`
- `lib/i18n-data.ts` static registry
- locale matching in `proxy.ts`

## Image host configuration

Centralized in `config/image-hosts.js`. Current defaults:

- `cdn.arsvine.com` — Tencent COS bucket
- `placehold.co` — placeholder images
- `images.unsplash.com` / `source.unsplash.com` — legacy samples

## Image conversion scripts

```bash
node scripts/convert-images.mjs
node scripts/convert-images.mjs jpg
node scripts/convert-images.mjs avif --quality 50
```

Outputs go to `scripts/images/out/`.

## Favicon regeneration

```bash
node scripts/regen-favicons.mjs
```

## Self-hosted Google Fonts

Served from Tencent COS, not `fonts.googleapis.com`.

Refresh:

```bash
node scripts/fetch-google-fonts.mjs
```

Upload `public/_fonts-staging/` to COS `fonts/` with metadata:

| Object | Content-Type | Cache-Control |
|--------|-------------|---------------|
| `google-fonts.css` | `text/css; charset=utf-8` | `public, max-age=86400, must-revalidate` |
| `*.woff2` | `font/woff2` | `public, max-age=31536000, immutable` |

## Music files

Production audio: `https://cdn.arsvine.com/music/...`

When `NEXT_PUBLIC_MEDIA_CDN` is unset, falls back to `public/music/`.

## Security guardrails

- GitHub content paths: repo-relative only, reject traversal and encoded traversal.
- External links: parse with `new URL()`, allow only intended protocols.
- Internal navigation: use shared helpers, never concatenate untrusted strings.
- Protected content: never ship MDX body in static props or `_next/data`.

## Before committing

```bash
pnpm check
```

Also manually verify:
- Desktop and mobile layout
- Home → content → detail transitions
- Blog detail pages (public and protected)
- Hash navigation on mobile
- Music player
- Custom cursor hover labels
- Font rendering for CJK and accented Latin
