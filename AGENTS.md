# Arsvine Docs — AI entrypoint

This repository is the cross-site documentation app for `docs.arsvine.com`.

- Public visitor prose is Chinese MDX in `content/public` (`/guide`).
- Contract reference is English MDX in `content/reference` (`/reference`) plus `public/llms.txt`.
- Maintainer prose is Chinese Markdown in `content/internal`. Render it only after an Auth `owner` session. Do not import those files into client bundles or static params.
- Fixed origins come from `@arsvine/site-config`. Do not duplicate the topology table in Realm, Platform, or Ripple beyond a link here.
- Default branch is `master`. Develop on `dev/<topic>`. Do not deploy or change DNS unless the user explicitly authorizes it.

```bash
pnpm install
pnpm test
pnpm build
```
