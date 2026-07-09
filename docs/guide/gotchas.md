# Gotchas and Regression Notes

Recorded project-specific pitfalls. Read before editing route transitions, protected posts, typography, COS assets, MDX rendering, the music player, or cursor behavior.

## 1. Do not use `reading-time`

The project uses an in-house reading-time estimator. Common packages are whitespace-oriented; CJK text collapses to extremely low estimates.

## 2. `--font-display` is Latin-only

Maps to `ZELDA Free`. Do not use for CJK, accented Latin, blog titles, translated strings, or user content. Use `--font-hud` or `--font-reading` instead.

## 3. COS custom-header Value fields are value-only

Tencent COS metadata UI has separate Key and Value fields. Do not paste header names into the Value field. Wrong form produces malformed headers causing Firefox to reject fonts.

## 4. Google Fonts variable-font deduplication is intentional

Multiple `@font-face` blocks with different `font-weight` pointing to the same `.woff2` file is normal for Variable Fonts. Do not rewrite the fetch script to force one file per weight.

## 5. Do not shell out to `coscli`

Upload is manual through the Tencent COS web console.

## 6. Internal navigation must use `navigateTo()`

Direct `router.push()` skips transitions.

## 7. Route loading overlay is source-driven

`useRouteLoadingKind` reads the route being left, not the target route. Target-based overlay selection breaks one of the two flows.

## 8. Protected-post auth probe must depend on auth state

The probe must short-circuit unless `authState === 'checking'` and include `state.authState` in dependencies.

## 9. Protected-post `authResolved` must clear request state in both branches

Both granted and required branches must clear `activeRequestKey` and `loadingLocale`. Otherwise, public → protected navigation can leave stale request keys.

## 10. Protected body content must never be in static props

`mdxSource` should be `null` from SSG. No ciphertext or hidden MDX in `_next/data`.

## 11. Avatar parallax transform needs `!important`

The mousemove rAF must use `style.setProperty('transform', value, 'important')` to win over keyframe fill state.

## 12. CustomCursor state reset

Use the existing reset helper instead of directly mutating internal refs.

## 13. MusicPlayer track click implies play

Clicking a track expresses immediate play intent. No "only autoplay if already playing" guard.

## 14. MusicPlayer must not auto-open on mobile

Keep the mobile guard. A draggable panel covering the phone screen on first paint is a poor experience.

## 15. ActivationLever is a button

Preserve button semantics, `aria-label`, and cursor label behavior.

## 16. Blog reveal must clear transform with `none`

After transition end, set `transform: 'none'` (not empty string). Any non-`none` transform creates a stacking context that traps tooltips.

## 17. `<AnimatedTitleChars>` defaults to uppercase

Blog titles should pass `uppercase={false}`.

## 18. Mobile section anchors need CSS scroll margin

Use `scroll-margin-top: var(--mobile-section-scroll-offset)` — no JavaScript scroll-offset helpers.

## 19. Locale resolution is not geo-based

Order: `NEXT_LOCALE` cookie > `Accept-Language` > `zh-CN`. Do not infer language from IP country.

## 20. WebGL effects should not churn GPU contexts

Desktop Three.js effects are dynamically imported with SSR disabled. Avoid repeated unmount/remount cycles.

## 21. `/[locale]/game` does not exist as a page

Treat as a legacy/internal matcher only. Do not add links or docs implying it is shippable.

## 22. GitHub content paths must be repo-relative only

Reject absolute URLs, traversal, query strings, hashes. Split path into segments and encode each.

## 23. External links must be parsed, not substring-matched

Use `new URL(...)`. Do not classify links with `includes()`.

## 24. Internal blog redirects must use validated helpers

Validate locale and slug before building blog URLs. Fall back to `/<locale>/content#blog` when unsafe.

## 25. Locale fallback banners must use explicit dispatch

Use allowlist branch per locale. No dynamic method selection.

## 26. Typing-effect language detection must stay script-specific

Use explicit Unicode script checks. Treat Latin as alphabetic only when not mixed with CJK.

## 27. All new tests live under `tests/`

No `.test.ts` files next to source. Group by feature: `tests/lib/`, `tests/components/`, `tests/hooks/`, `tests/i18n/`, `tests/pages/`, `tests/repo/`.
