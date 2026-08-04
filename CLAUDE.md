# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

Four things:

- **`brand/`** — the complete brand system for Verde Oliva Olivoterapia, a natural olive-polyphenol skincare ecommerce brand (Coquimbito, Maipú, Mendoza, Argentina). Markdown documents, numbered `00`–`08` in reading order; `brand/README.md` is the index and states the six settled decisions.
- **`prototipo/`** — a static HTML prototype for choosing the site's UX direction (4 homes × 4 menus × 4 catalogs + 1 product page, all mixable), plus a **definitive proposal** (`home-5.html` / `catalogo-5.html` / `producto-5.html`) that consolidates what the client picked from that comparison. Not the production site — frozen as historical record, not actively developed.
- **`sitio/`** — the real, shipping frontend. Started as a static consolidation of the definitive proposal but has since diverged with its own JS modules (`sitio/js/`), a shared stylesheet (`sitio/css/base.css`), a bilingual ES/EN system, a real cart, Google login, Mercado Pago checkout, and checkout result pages. Served by `api/` as static files from the same origin.
- **`api/`** — an Express backend (plain JS, no TypeScript) providing Google login, MySQL-backed sessions, and Mercado Pago checkout, and serving `sitio/` statically from the same process/origin. This is a real, installable, runnable Node app (unlike `brand/` and `prototipo/`).

`brand/07-estrategia-ecommerce.md`'s long-term plan was Next.js + headless Shopify; `api/` + `sitio/` is what actually got built instead — plain Express + static HTML/JS + MySQL, not that architecture. Treat `brand/07` as background rationale for product/UX decisions, not as a description of the current stack.

## Commands

`prototipo/` is plain static HTML — open any file directly, or serve the directory:

```bash
open prototipo/index.html
python3 -m http.server -d prototipo 8000
```

It's a linked Vercel project (`prototipo/.vercel/project.json`, gitignored by `prototipo/.gitignore`):

```bash
npx vercel --cwd prototipo          # preview
npx vercel --cwd prototipo --prod   # production
```

`sitio/` is not run standalone — it's served by `api/`. To run the real app locally:

```bash
cd api
npm install
cp .env.example .env       # then fill in GOOGLE_CLIENT_ID, MERCADOPAGO_ACCESS_TOKEN, SESSION_SECRET, DB_*
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS verde_oliva"
mysql -u root -p verde_oliva < schema.sql   # creates users, orders, order_items; `sessions` is created by express-mysql-session on first boot
npm run dev                 # node --watch server.js
# or: npm start
```

This serves `sitio/index.html` at `http://localhost:3000/` and the API at `http://localhost:3000/api/*` — same origin, no CORS. No lint/test scripts are defined in `api/package.json`; there is no test suite.

## Working with `prototipo/`

Every page (`index.html`, `home-1..4.html`, `home-5.html`, `menu-1..4.html`, `catalogo-1..4.html`, `catalogo-5.html`, `producto.html`, `producto-5.html`) is a single self-contained file: inline `<style>`, inline `<script>`, no CSS/JS dependencies at all. Fonts are **not** loaded — `--fs` asks for Cormorant Garamond and `--fb` for Inter, both falling back to system serif/sans, because the `@import` from `brand/04` was intentionally left out. Do not add a font `<link>`, a CDN script, or a framework.

Images are the one external surface:

- **Local, real assets** — `img/logo.png` and `img/productos/*.jpg`, one JPG per SKU named after the product's slug (`crema-humectante-facial.jpg`). Only **13 of the catalog's 17 SKUs** have a photo; the prototype's copy says "los 13 productos" for that reason. Reference these with relative paths, never placeholders, when a variant shows product cards.
- **Remote Unsplash URLs** for ambient/hero photography in `home-1`, `home-2`, `home-4` and `menu-2..4`. These are stand-ins for photography the brand doesn't have yet — fine to keep, but prefer a local `img/` asset when one exists.

### `home-5.html` / `catalogo-5.html` / `producto-5.html` are the definitive proposal, not a fifth variant

After the client compared the 4×4×4 prototype, they picked concrete pieces: Home B's commercial force, Home C's ritual system, Catálogo 2's editorial-by-line split, and asked that "por necesidad" browsing be the primary catalog entry. These three files consolidate that decision into a single, real, interactive experience — they are not another `A`–`D`-style option to add to `index.html`'s picker. `index.html` surfaces them separately, in a full-width `.def`/`.def-s` block above the comparison grid, not as a `.v` card.

- **`home-5.html`**: hero → `#polifenoles` → the 13 products as three chapters (`#eco`, `#spa` in `.dark`, `#gourmet`) → `#informacion` → `#rutinas` (an interactive routine builder plus three pre-built rituals). Ships real behavior: `data-need` buttons re-render `#steps` through a ritual map with a live price total, `#addall`/`data-cart` increment a cart badge, `.chip` anchors run a scroll-spy.
- **`catalogo-5.html`**: entry is **por necesidad** by default (per `brand/07-estrategia-ecommerce.md`'s explicit rule that need-based browsing should be primary), with a **por línea** view as a secondary toggle. Client-side filters (línea, necesidad, formato, precio, tipo de piel) and sort (relevancia, precio, novedades — never "más vendidos," that ordering is explicitly excluded) operate over `data-*` attributes on each `.card-w`.
- **`producto-5.html`**: the fixed ficha structure from `brand/07` (see below), with "Ingredientes (INCI)" and "Seguridad" broken out as their own labeled `<details>`.

The four `home-*`/`catalogo-*` variants and `producto.html` stay untouched as the historical record of that comparison — every other page's `.xnav` cross-links to the `-5` trio as the recommended destination, while each group's own enumerated list (Home A–E, Catálogo 1–4+Definitivo, Ficha Original/Definitiva) still reaches every variant.

### Variant naming

Filenames are numeric but the UI labels differ: `home-1..4` are presented as **Home A/B/C/D** (Editorial / Producto primero / Ritual guiado / Origen), while menus and catalogs keep their numbers. `index.html` stores the pick as the letter `A`–`D` per group regardless — don't renumber files without updating both.

### `index.html` is the selector hub

It links to every variant and persists the pick per group (`home`, `menu`, `cat`) to `localStorage` under the key `vo-pick`. There are two input surfaces over that *same* store, kept in sync by one `paint()` call: the `data-pick`/`data-val` buttons on each variant card, and three `data-k` text inputs in the sticky "Variante elegida" bar — typing `B` there lights up the Home B card's button too (comparison is case-insensitive). These are not freeform notes; both surfaces write the identical three keys. Variant pages don't read that store — they only cross-link to each other so any combination can be walked through.

Each variant is represented in `index.html` by a hand-built CSS wireframe thumbnail (`.tb` container with `.bar`/`.h`/`.r`/`.col`/`.g`/`.o`/`.fill` elements) inside a `.v` card (`.v-thumb`, `.v-k`, `.v-t`, `.v-d`, `.v-w` "Conviene si…", `.v-a` actions). That markup exists **only** in `index.html`. Adding or replacing a variant means editing the hub too: new thumbnail, new card, matching `data-pick`/`data-val`.

Keep every variant a drop-in replacement: same CSS custom properties (`--oliva`, `--oliva-d`, `--hoja`, `--hoja-t`, `--corteza`, `--crema`, `--crema2`, `--arena`, `--oro`, `--terra`, `--terra-t`, `--tinta`, `--linea`, `--linea-f`, `--fs`, `--fb`, `--e`, `--xn`, `--hh`), same `.wrap`/`.btn`/`.kicker`/`.lead` primitives, same accessibility scaffolding already present (skip link, `.sr`, `:focus-visible` outlines, `<use href="#i-…">` sprite icons), and the same fixed-bottom `.xnav` prototype nav bar — `--xn` is its height and is exactly what `body`'s `padding-bottom` reserves, so a new page that copies the tokens but skips `.xnav` gets content hidden under the bar.

`producto.html` and `producto-5.html` (see above) are the two product pages (both for Emulsión humectante corporal 250 ml) and implement the fixed ficha structure from `brand/07-estrategia-ecommerce.md`: gallery+buy box → educational block (para qué sirve, para qué piel, cuándo, cómo, qué esperar) expanded, never tabbed, with "qué esperar" always including what it does *not* do → combina con (each pairing states its *why*) → el origen → ingredientes/seguridad → the ritual it belongs to. These are brand rules, not layout preferences — see `brand/07` lines 85–121 before restructuring either ficha.

## Working with `sitio/`

`sitio/index.html` / `catalogo.html` / `producto.html` originated as `home-5` / `catalogo-5` / `producto-5` with the prototype-comparison scaffolding stripped (no `.xnav`, no `data-pick`/`localStorage`, real filenames), but have since diverged well beyond that: real cart, real bilingual copy, Google login, Mercado Pago checkout, checkout result pages (`checkout-exito.html`, `checkout-pendiente.html`, `checkout-error.html`), a `finca.html` page (the 1890 Coquimbito olive grove and the Arauco varietal), and `terminos.html`/`privacidad.html` (terms of service, and privacy policy under Argentina's Ley 25.326) — none of which exist in `prototipo/`. Every page's footer links `terminos.html`/`privacidad.html` under an `ft-legal-h` "Legal" heading. Treat `prototipo/`'s `-5` trio as historical reference for the original content/structure decisions, not as a page to sync against — there's no sync step, and `sitio/` is now the one that matters.

- **`sitio/css/base.css`** is shared by every page in `sitio/` (`index`, `catalogo`, `producto`, `finca`, `terminos`, `privacidad`, the three `checkout-*` pages) via one `<link>` each; each page then declares locally only the overrides that are its own (e.g. `.hdr`/`.strip`/`.menubtn` for `index.html`'s video hero, `catalogo.html`'s denser card/type scale). Holds the full design-token set (`--oliva`, `--crema`, `--fs`, `--fb`, etc.), primitives (`.wrap`, `.sect`, `.kicker`, `.lead`, `.ph`/`.ph2`/`.ph3`/`.ph4` gradient placeholders), and shared components like the rotating-chevron `.acc` accordion. A fix here propagates to every page at once.
  - **Typography partly diverges from `brand/04-identidad-visual.md`**: `--fb` in `base.css` is now `'Inter'`, matching the brand doc's body/UI font. `--fs` is `'Fraunces'`, not the documented Cormorant Garamond — both loaded from Google Fonts (`preconnect` + one combined `<link>` per page). This replaced an earlier Lora/Raleway pairing; treat the brand doc's display-font name as the nominal rule but verify `--fs` in `base.css` before assuming which serif is actually live, and don't silently "fix" one to match the other without asking.
  - `.agents/skills/design-rules-check/SKILL.md` is an agent rule file (not a `.claude/` skill) that audits any touched `sitio/*.html` for brand-token drift and the three non-negotiable contrast rules below — it carries the fuller semantic token set (`--vo-surface`, `--vo-text-muted`, `--vo-border`, `--vo-cta-bg-hover`, plus success/error/warning states) beyond what's in `brand/04`. Its own "Alcance" list of in-scope files predates `finca.html`/`terminos.html`/`privacidad.html`, but the rules apply to those too.
- **`sitio/js/`** holds the shared frontend logic, loaded across pages via plain `<script>` tags (no bundler, no module system):
  - `i18n.js` — the ES/EN engine: real language swap (not a stub), keyed by `data-i18n`/`data-i18n-aria`/`data-i18n-placeholder` attributes, dictionary assembled from `window.VO_I18N_COMMON` (`i18n-common.js`) plus a page-specific `window.VO_I18N_PAGE` (`i18n-data-home.js` / `i18n-data-catalogo.js` / `i18n-data-producto.js` / `i18n-data-finca.js` / `i18n-data-terminos.js` / `i18n-data-privacidad.js`, loaded before `i18n.js`). English is a brand rewrite per `brand/03-identidad-verbal.md#bilingüe-esen`, not a literal translation, kept once per key even when the same product recurs (e.g. catálogo por línea/necesidad). Original Spanish is cached in `data-*Cache` attrs the first time a node flips to English. Persists the pick to `localStorage` (`vo-lang`) and fires `vo:lang-changed`.
  - `auth.js` — Google Identity Services login flow, talks to `POST /api/auth/google` in `api/`.
  - `cart.js` — the real cart (replaces the old cart-badge-only behavior), talks to `api/` for checkout.
  - `header.js`, `reveal.js` — header behavior and the `IntersectionObserver`-driven reveal-on-scroll (`.card-w.in`, `.grid3>article.in`, etc.).
  - A fix in one of these files now propagates to every page that includes it — this is different from the per-page inline `<script>` scroll handlers that still exist for page-specific behavior (`.hdr.scrolled`, `.chips.stuck`).
- `sitio/index.html`'s hero is a full-bleed `<video>` (`#heroVideo`, `sitio/video/hero-loop.mp4`) with an Unsplash `poster` fallback; JS pauses/hides autoplay under `prefers-reduced-motion`.
- `sitio/llms.txt` is a hand-maintained llms.txt (brand summary, full 17-SKU price list, page index, notes for agents/answer engines) served as a static file alongside the HTML — update it when product copy, prices, or the page set change, it has no generator.
- `sitio/` has its own `img/` (originally copied from `prototipo/img/`) and its own `.gitignore` (just `.vercel`) plus a gitignored `sitio/.vercel` project link — most likely for quick previews, the same pattern as `prototipo/`'s Vercel link. Production is still served by `api/server.js`: `sitio/` has no `vercel.json`/`package.json` of its own and isn't deployed independently.
- Any request to `/api/*` reaching `sitio/`'s frontend code is a call into the `api/` backend described below — same origin, so plain `fetch('/api/...')` with no CORS handling.

## Working with `api/`

Plain JS Express app (no TypeScript, no framework beyond Express). `server.js` wires everything: `express.json()` → session middleware → routers mounted under `/api` → `express.static(sitio/)` → `/api` 404 handler → last-resort error handler → `unhandledRejection` safety net (logs, doesn't crash the process).

- **`routes/auth.js`** — `POST /api/auth/google` verifies a Google Identity Services ID token (`google-auth-library`, audience = `GOOGLE_CLIENT_ID`) and establishes a session; no full OAuth authorization-code flow, no client secret needed. Also implements passwordless "magic link" login for customers: `POST /api/auth/magic-link/request` (always responds `ok` regardless of whether the email exists, to avoid leaking user existence) creates a single-use token via `lib/magicLink.js` and emails it via `lib/mailer.js`; `GET /api/auth/magic-link/verify?token=...` is hit directly from the emailed link (not an XHR from the SPA, so it skips `requireXhrHeader`), consumes the token, upserts the `users` row by email, and redirects to `/?login=ok|expired|error`.
- **`routes/admin-auth.js`** — username/password admin login plus an optional Google SSO path restricted to a single allow-listed address (`ADMIN_GOOGLE_EMAIL` in `.env`): `GET /api/admin/google-sso-status` tells the frontend whether to render the Google button, `POST /api/admin/login/google` verifies the ID token and rejects any email other than `ADMIN_GOOGLE_EMAIL` (403, no account creation). On first successful Google login it auto-links to the single pre-existing `admin_users` row with `email IS NULL` (created by `seed-admin.js`); if zero or more than one such row exists, it refuses rather than guessing.
- **`lib/magicLink.js`** — issues/consumes magic-link tokens: stores only `SHA-256(token)` in `magic_link_tokens` (never the plaintext, same principle as `password_hash` on `admin_users`), 15-minute TTL, single-use (`used_at` set on first successful consume).
- **`lib/mailer.js`** — thin wrapper over the `resend` package. Without `RESEND_API_KEY` set, it doesn't send anything — it logs the magic-link URL to the server console so the login flow is still testable locally.
- **`migrations/2026-08-passwordless-login.sql`** — run manually after `schema.sql` to add magic-link support: makes `users.google_sub` nullable (a magic-link user has no Google sub until/unless they later also log in with Google, joined by email), creates `magic_link_tokens`, and adds nullable `email`/`google_sub` columns to `admin_users` for the admin Google SSO path above.
- **`routes/checkout.js`** — `POST /api/checkout` (requires session). Re-prices every item server-side against `api/products.js` (sourced from `brand/05-catalogo.md`) and never trusts a price sent in the request body, then creates a Mercado Pago `Preference`.
- **`routes/orders.js`**, **`routes/webhooks.js`** — order lookups and the Mercado Pago webhook receiver. The webhook router intentionally skips the CSRF mitigation the other routers apply, since Mercado Pago's server calls it directly, not a browser with a session.
- **`lib/csrf.js`** (`requireXhrHeader`) — applied per-route, not via `router.use()`, because every router in this app is mounted at the same `/api` prefix and Express dispatches a request to each router mounted there in order; a bare `router.use()` in one file would also intercept requests meant for another router (e.g. it must not apply to `/api/webhooks/mercadopago`).
- **`lib/requireAuth.js`** — session-gate middleware for routes like checkout.
- **`lib/session.js`** — `express-mysql-session`-backed sessions; the `sessions` table is created by that package on first boot, not by `schema.sql`.
- **`lib/db.js`** — the `mysql2` pool, credentials from `.env` (`DB_HOST`/`DB_USER`/`DB_PASS`/`DB_NAME`).
- **`schema.sql`** — `users`, `orders`, `order_items` only (not `sessions`, see above).
- **`.env`** (gitignored; template in `.env.example`) — `GOOGLE_CLIENT_ID`, `MERCADOPAGO_ACCESS_TOKEN` (use TEST- sandbox credentials until the very end), `SESSION_SECRET`, `DB_*`, `PORT`, `PUBLIC_BASE_URL` (optional, used to build Mercado Pago back_urls/notification_url behind a proxy), `NODE_ENV` (only `production` enables the `secure` session cookie, which requires HTTPS).
- Deploy target is Hostinger's Node.js Selector (hPanel): one Node process serves both `sitio/` static files and `/api/*` from the same origin specifically to avoid configuring CORS or cross-origin cookies on shared hosting. Never upload `.env` via FTP/git — set the same variables as panel env vars, run `schema.sql` against the Hostinger MySQL instance, and point `GOOGLE_CLIENT_ID`'s authorized origins and Mercado Pago's `back_urls` at the real domain before an end-to-end purchase test.

## Brand rules that constrain any content or UI work

These aren't background reading — they're binding constraints most tasks in this repo will touch:

- **Color usage is contrast-verified and non-negotiable** (`brand/04-identidad-visual.md`): Oro Arauco `#B08D3F` is never text (only borders/hover/detail; `#7E6129` exists if a typographic gold is unavoidable); Hoja `#6B7B3C` is never body text (use `#616F36` instead); the CTA is always Oliva Profundo `#3A4433` background with Crema `#F7F4EC` text. Full token set (CSS vars + Tailwind config) is in that file — copy from there rather than reinventing values.
- **Typography**: Cormorant Garamond for display/headings, Inter for body/UI/prices (never put prices in Cormorant — the serif's numerals are ambiguous). As shipped, `sitio/css/base.css` uses Fraunces for display instead of Cormorant Garamond; `--fb` is Inter, matching the rule — see the note in "Working with `sitio/`" above.
- **Copywriting has a compliance-grade forbidden list** (`brand/03-identidad-verbal.md`): the brand is cosmetics, not medicine, and is regulated by ANMAT in Argentina. Never write claims that treat/cure/prevent a medical condition, name skin pathologies (acné, rosácea, etc.), claim wrinkle/scar removal, claim any SPF/sun protection, or use words like "hipoalergénico," "dermatológicamente probado," or "resultados garantizados" without a study backing them. Marketing filler ("milagroso," "revolucionario," "exclusivo"), false urgency ("¡última oportunidad!"), and struck-through reference prices are also excluded — see that file's "esto sí / esto no" tables before writing any product or marketing copy.
- **Bilingual ES/EN is a rewrite, not a translation** — see the reglas in `brand/03-identidad-verbal.md#bilingüe-esen`. "Olivoterapia" itself is never translated.
- **The catalog is fixed at 17 SKUs** (`brand/05-catalogo.md`): 12 Eco Cosmética + 4 Línea Spa de Olivoterapia + Vallesi Arauco 500 ml olive oil. No wine. Names, formats and prices there come from the existing Verde Oliva site — don't invent or adjust them.
- Product/UX/content decisions marked **⚑ A validar** throughout `brand/` are open proposals, not settled facts — flag them rather than treating them as final when they matter to a task.

## Original architecture proposal vs. what was actually built

`brand/07-estrategia-ecommerce.md` documents an earlier target architecture — Next.js (App Router) on Vercel, ES/EN via `/` and `/en/` mirrored routes, MDX educational content, commerce data on Shopify headless (alternatives considered: Medusa/Vendure, Tiendanube). **That platform choice was not what got built.** The actual stack is `api/`'s plain Express + MySQL + static `sitio/` + client-side JS i18n, described above. Still read `brand/07` for the parts that remain the source of truth regardless of stack: the sitemap, the three user-journey types (repeat guest / label-reader / gift-buyer), and the fixed product-page structure (need → skin type → when → how → what to expect, including what it does *not* do).
