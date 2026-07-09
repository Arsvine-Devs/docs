# Architecture Notes

This document explains the architecture of ARSVINE REALM.

## Technical baseline

- Next.js 16 with **Pages Router** (no App Router).
- React 19.
- TypeScript.
- SCSS Modules + shared SCSS partials.
- `next-intl` 4 for UI localization.
- MDX through `next-mdx-remote`.
- Three.js / `@react-three/fiber` / `@react-three/drei` / `@react-three/cannon` for desktop effects.
- GSAP and Web Animations API for interaction and transitions.
- Vitest with `jsdom` for core logic tests.
- Custom Node.js server through `server.js`.

## Route model

All user-facing pages live under `pages/[locale]/...`.

| Route | Purpose |
|-------|---------|
| `/[locale]` | HUD home page with primary navigation columns |
| `/[locale]/content` | Content aggregation page with hash sections (`#works`, `#experience`, `#blog`, `#life`) |
| `/[locale]/{works,experience,life,friends,about,contact,tweets,copyright}` | Section or standalone pages |
| `/[locale]/blog` | Redirect alias to `/[locale]/content#blog` |
| `/[locale]/blog/[slug]` | Blog detail page (SSG, `fallback: 'blocking'`, ISR) |
| `/[locale]/web/[id]` | Work/project detail page |
| `/[locale]/life/[slug]` | Life detail page |
| `/[locale]/access/[group]` | Standalone TOTP gate |
| `/sitemap.xml` | Site-wide sitemap |
| `/robots.txt` | Dynamic robots response |

## Locale middleware

`proxy.ts` handles locale routing. Rules:

1. Skip API, Next internals, Vercel internals, static asset prefixes.
2. Path already starts with a supported locale → forward unchanged.
3. Bare path → redirect to `/<locale>/<rest>`.
4. Locale selection order: `NEXT_LOCALE` cookie > `Accept-Language` > `zh-CN`.
5. No IP-based geolocation for language selection.

## State and layout contexts

### AppContext

Composes site-wide interactive state: loading sequence, power/battery/inversion state, client-side stats, typing effects, column hover state.

### TransitionContext

Controls animated navigation. Internal navigation must use:

```ts
useTransition().navigateTo(url)
```

instead of `router.push()`.

### LayoutAnchorsContext

Registers the active scroll container for deep-link scrolling.

## Content sources

### 1. Bundled typed data

Structured data in `data/`: projects, experience, life, skills, friendLinks, site config, music playlist.

Each trilingual topic has:
```text
index.ts   # zh-CN fallback
en.ts
zh-TW.ts
```

### 2. External GitHub content repository

When configured, blog posts and tweets load from a private GitHub repo:

```env
GITHUB_OWNER=ArsvineZhu
GITHUB_REPO=arsvine-content
GITHUB_BRANCH=main
GITHUB_READ_TOKEN=github_pat_xxx
```

Repo structure:
```text
blog-index.json
blog/<slug>/<locale>.mdx
tweets/index.json
tweets/YYYY-MM.json
```

## Protected posts (TOTP)

Protected posts use TOTP access and must not expose MDX content during static generation.

Flow:
1. `getStaticProps` returns sanitized metadata and `mdxSource: null`.
2. Browser probes `/api/grant-check?group=...`.
3. If not granted, TOTP gate posts to `/api/protected-verify`.
4. On success, server signs HttpOnly access-grant cookie.
5. Client fetches gated MDX from `/api/post-variant`.
6. Unauthenticated variant fetches return `403`.

## API routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/hitokoto` | GET | Proxy for hitokoto.cn quotes |
| `/api/grant-check?group=` | GET | Check signed access-grant cookie |
| `/api/post-variant?slug=&locale=` | GET | Return serialized MDX |
| `/api/protected-verify` | POST | Verify TOTP, sign grant cookie |
| `/api/tweet-months?offset=&limit=` | GET | Paginate tweet months |
| `/api/revalidate` | POST | Revalidate tweet pages |
| `/api/revalidate-content` | POST | Revalidate content + blog pages |

## Desktop 3D effects

- **RainMorimeEffect** — atmospheric rain particles.
- **TesseractExperience** — interactive physics effect using `@react-three/cannon`.

Both are dynamically imported with `ssr: false`.

## Styling system

- Component styles: SCSS Modules.
- Shared partials: `styles/`.
- Global tokens: `styles/globals.scss`.

Font variables:

| Variable | Use |
|----------|-----|
| `--font-display` | Decorative Latin-only HUD display text |
| `--font-hud` | HUD labels, numerals, blog headings |
| `--font-reading` | MDX body and long-form reading |
| `--font-typewriter` | Typewriter and monospace effects |

## Custom MDX components

| Component | Behavior |
|-----------|----------|
| `<Term note="...">word</Term>` | Ruby annotation (always visible) |
| `<Explain note="...">phrase</Explain>` | Tooltip/bottom-sheet explanation |
