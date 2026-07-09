# Operations Guide

Deployment, external services, environment variables, CDN, analytics, ISR, and operational checks.

## Build and run

```bash
pnpm build
pnpm start
```

For PM2:

```bash
pm2 start server.js --name arsvine-realm
```

For Vercel, keep Node.js runtime aligned with `package.json` (`24.x`).

## Required production variables

```env
NODE_ENV=production
NEXT_PUBLIC_SITE_URL=https://arsvine.com
```

## Optional public variables

```env
NEXT_PUBLIC_MEDIA_CDN=https://cdn.arsvine.com
NEXT_PUBLIC_UMAMI_SRC=https://cloud.umami.is/script.js
NEXT_PUBLIC_UMAMI_WEBSITE_ID=your-website-id
NEXT_PUBLIC_UMAMI_DOMAINS=arsvine.com,www.arsvine.com
```

Public variables are visible in browser bundles.

## Server-only variables

```env
GITHUB_OWNER=ArsvineZhu
GITHUB_REPO=arsvine-content
GITHUB_BRANCH=main
GITHUB_READ_TOKEN=github_pat_xxx

ACCESS_GRANT_SECRET=replace-with-a-long-random-string
TOTP_GROUPS_JSON={"friends-a":{"current":"JBSWY3DPEHPK3PXP","period":30,"digits":6,"window":1}}

REVALIDATE_SECRET=replace-with-a-long-random-string
TRUST_PROXY=1

UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token
```

Never prefix secrets with `NEXT_PUBLIC_`.

## External content repository

Blog posts and tweets from private GitHub repo. Expected layout:

```text
blog-index.json
blog/<slug>/<locale>.mdx
tweets/index.json
tweets/YYYY-MM.json
```

Without these variables, blog falls back to bundled content, tweets to empty state.

## Protected-post access

Depends on:
- External content index declaring `access.mode = "totp"` and `group`
- `ACCESS_GRANT_SECRET` for signed cookies
- `TOTP_GROUPS_JSON` for group secrets

Operational checks:
1. Visit public post → verify direct rendering.
2. Visit protected post without access → no body content.
3. Verify `_next/data/.../<slug>.json` has no MDX body for protected posts.
4. Submit valid TOTP → verify post body loads.
5. Fetch `/api/post-variant` without grant → verify `403`.

## Upstash Redis rate limiting

- With Upstash: distributed rate limiting across instances.
- Without Upstash: process-local `Map` fallback (single-instance only).

## ISR and revalidation

| Route | Purpose |
|-------|---------|
| `/api/revalidate` | Revalidate tweet pages (all locales) |
| `/api/revalidate-content` | Revalidate content + blog detail pages |

Guarded by `REVALIDATE_SECRET`.

## Tencent COS media/CDN

Hong Kong bucket `arsvine-cdn` via `cdn.arsvine.com`.

- Bucket: public-read / private-write.
- Audio and large media not committed to Git.
- Fonts: manually uploaded to `fonts/`.
- Music: served from `music/`.

COS traffic is billable. Keep budget alerts enabled.

### Referer policy

Allowlist: `arsvine.com`, `*.arsvine.com`. Localhost rejected.

## Font hosting operations

1. Edit `data/site.ts` font configuration.
2. Run `node scripts/fetch-google-fonts.mjs`.
3. Upload `public/_fonts-staging/` to COS `fonts/` via web console.
4. Set metadata exactly (value-only, no header name in value).

## Analytics

Umami is optional. Injected only when configured.

```env
NEXT_PUBLIC_UMAMI_SRC=https://cloud.umami.is/script.js
NEXT_PUBLIC_UMAMI_WEBSITE_ID=your-website-id
NEXT_PUBLIC_UMAMI_DOMAINS=arsvine.com,www.arsvine.com
```

## SEO and feed files

| File | Description |
|------|-------------|
| `/sitemap.xml` | Multi-locale sitemap with hreflang |
| `/<locale>/rss.xml` | Per-locale RSS |
| `/robots.txt` | Dynamic robots.txt |

Verify after deploy:

```bash
curl -I https://arsvine.com/sitemap.xml
curl -I https://arsvine.com/zh-CN/rss.xml
curl -I https://arsvine.com/robots.txt
```

## Deploy smoke test

After each deployment, verify:

- `/zh-CN`, `/zh-TW`, `/en` load
- Bare `/` redirects to locale
- `/zh-CN/content#blog` lands correctly
- Public blog post loads
- Protected post gates correctly
- Sitemap, robots, RSS work
- CDN fonts load (no CJK tofu)
- Music player behavior
- Mobile layout has no HUD overlap
- Analytics absent on localhost/preview
- `pnpm check` passes
