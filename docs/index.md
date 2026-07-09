# ARSVINE REALM

ARSVINE REALM is a personal portfolio and blog site built around a post-apocalyptic HUD visual language. It presents works, experience, life records, blog posts, tweets, friend links, contact/about pages, music playback, animated transitions, client-only WebGL atmosphere, and TOTP-protected private posts.

**Owner:** Arsvine Zhu  
**Stack:** Next.js 16 Pages Router, React 19, TypeScript, SCSS Modules, Three.js, GSAP, MDX, next-intl 4, Vitest  
**Runtime target:** Node.js 24.x  
**UI locales:** zh-CN, zh-TW, en  
**Public route shape:** `/<locale>/...`

## Quick start

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Open `http://localhost:3000`. The middleware redirects the root path to a locale-prefixed route such as `/zh-CN`.

## Common commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start dev server (node server.js) |
| `pnpm build` | Production build (next build) |
| `pnpm start` | Production server |
| `pnpm lint` | Run ESLint |
| `pnpm typecheck` | TypeScript check (tsc --noEmit) |
| `pnpm test` | Run Vitest tests |
| `pnpm check` | lint + typecheck + test + build |

## Documentation

- [Architecture](/guide/architecture) — Router structure, content sources, protected-post flow, API routes, transitions, styling, and 3D effects.
- [Development Guide](/guide/development) — Local setup, commands, scripts, COS Referer workflow, fonts, images, music, and daily maintenance.
- [Operations Guide](/guide/operations) — Deployment, environment variables, analytics, CDN/COS operations, ISR, Upstash, SEO files, and operational checks.
- [Gotchas](/guide/gotchas) — Historical bugs and fragile conventions that should not be reintroduced.

## Project structure

```
components/     # UI components (blog, cards, effects, layout, MDX, sections, shared)
config/         # Runtime config fragments
content/        # Bundled fallback blog content
contexts/       # React Contexts (App, Transition, LayoutAnchors)
data/           # Trilingual structured data, site config, music playlist
docs/           # Documentation
hooks/          # Custom React hooks (23 hooks)
i18n/           # next-intl configuration
lib/            # Business logic (blog, content, tweets, TOTP, utilities)
locales/        # UI translation JSON files
pages/          # Next.js Pages Router routes + API routes
public/         # Static assets, fonts, icons
scripts/        # Build/asset helper scripts
styles/         # SCSS partials and global styles
types/          # Shared TypeScript types
tests/          # Test files
```

## Configuration entry points

- `data/site.ts` — site identity, SEO, fonts, social links
- `data/music.ts` — music playlist
- `data/<topic>/{index.ts,en.ts,zh-TW.ts}` — trilingual data
- `locales/{zh-CN,zh-TW,en}.json` — UI strings
- `config/image-hosts.js` — Next.js remote image host allowlist
- `.env.example` — documented environment variables

## Deployment

```bash
pnpm build
pnpm start
```

Or with PM2:

```bash
pm2 start server.js --name arsvine-realm
```

## License

- Source code: MIT License
- Content, design assets: CC BY-NC-ND 4.0
