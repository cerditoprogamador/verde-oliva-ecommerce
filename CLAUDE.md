# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

Three things, currently unconnected by any build system:

- **`brand/`** — the complete brand system for Verde Oliva Olivoterapia, a natural olive-polyphenol skincare ecommerce brand (Coquimbito, Maipú, Mendoza, Argentina). Markdown documents, numbered `00`–`08` in reading order; `brand/README.md` is the index and states the six settled decisions.
- **`prototipo/`** — a static HTML prototype for choosing the site's UX direction (4 homes × 4 menus × 4 catalogs + 1 product page, all mixable), plus a **definitive proposal** (`home-5.html` / `catalogo-5.html` / `producto-5.html`) that consolidates what the client picked from that comparison. Not the production site.
- **`sitio/`** — the deployable consolidation of that definitive proposal: `index.html`, `catalogo.html`, `producto.html`, plus its own `img/` (copied from `prototipo/img/`). Real filenames, no prototype-comparison chrome, no `localStorage` picker, no `.xnav` bar. This is what actually ships, but it's still static HTML — not the Next.js/Shopify architecture `brand/07` describes as the long-term plan (see below).

There is no package.json, build tool, linter, or test suite — this is a design/content-planning stage, not an implemented application yet.

## Commands

Nothing to build, install, or test. Both `prototipo/` and `sitio/` are plain static HTML — open any file directly, or serve a directory if you need a real origin:

```bash
open prototipo/index.html                 # or sitio/index.html — file:// works for either
python3 -m http.server -d prototipo 8000   # swap -d sitio to serve the production site instead
```

`prototipo/` is a linked Vercel project (`prototipo/.vercel/project.json`, gitignored by `prototipo/.gitignore`), so it deploys as a plain static directory:

```bash
npx vercel --cwd prototipo          # preview
npx vercel --cwd prototipo --prod   # production
```

`sitio/` has no `.vercel` link yet — it hasn't been deployed.

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

`sitio/index.html` / `catalogo.html` / `producto.html` are `home-5` / `catalogo-5` / `producto-5` with the prototype-comparison scaffolding stripped: no `.xnav` cross-links, no `data-pick`/`localStorage`, copy cleaned of "definitiva/prototipo" language, internal links rewritten to the real filenames. Treat `prototipo/`'s `-5` trio as the source of truth for *content and structure* decisions (it's cross-referenced from `brand/07` reasoning above) and `sitio/` as where *visual/interaction polish* now happens independently — the two have already diverged (see below) and there's no sync step that pulls one into the other.

- The ES/EN toggle in `sitio/`'s header (`<button>ES</button>|<button>EN</button>`) is a UI stub: it flips `aria-pressed`, nothing else. No English copy exists yet anywhere in `sitio/`.
- `sitio/index.html`'s hero is a full-bleed `<video>` (`#heroVideo`) with an Unsplash `poster` fallback; the JS pauses/hides autoplay under `prefers-reduced-motion`. **The video file it points to, `sitio/img/hero-olivar.mp4`, does not exist in the repo** — the hero currently only shows the poster image. Add that asset (or point `<source>` at something real) before treating the hero as finished.
- Scroll-driven behavior — `.hdr.scrolled` (header goes from transparent-over-video to solid), `.chips.stuck` (shadow once the anchor-chip bar sticks under the header), and `IntersectionObserver`-driven `.card-w.in` / `.grid3>article.in` reveal-on-scroll — is wired in each page's own inline `<script>`; there's no shared JS file, so a fix in one page's scroll handler doesn't propagate to the others.
- `sitio/` has its own `img/` (a copy of `prototipo/img/`, same filenames) and no `.vercel` link or `.gitignore` of its own yet.

## Brand rules that constrain any content or UI work

These aren't background reading — they're binding constraints most tasks in this repo will touch:

- **Color usage is contrast-verified and non-negotiable** (`brand/04-identidad-visual.md`): Oro Arauco `#B08D3F` is never text (only borders/hover/detail; `#7E6129` exists if a typographic gold is unavoidable); Hoja `#6B7B3C` is never body text (use `#616F36` instead); the CTA is always Oliva Profundo `#3A4433` background with Crema `#F7F4EC` text. Full token set (CSS vars + Tailwind config) is in that file — copy from there rather than reinventing values.
- **Typography**: Cormorant Garamond for display/headings, Inter for body/UI/prices (never put prices in Cormorant — the serif's numerals are ambiguous).
- **Copywriting has a compliance-grade forbidden list** (`brand/03-identidad-verbal.md`): the brand is cosmetics, not medicine, and is regulated by ANMAT in Argentina. Never write claims that treat/cure/prevent a medical condition, name skin pathologies (acné, rosácea, etc.), claim wrinkle/scar removal, claim any SPF/sun protection, or use words like "hipoalergénico," "dermatológicamente probado," or "resultados garantizados" without a study backing them. Marketing filler ("milagroso," "revolucionario," "exclusivo"), false urgency ("¡última oportunidad!"), and struck-through reference prices are also excluded — see that file's "esto sí / esto no" tables before writing any product or marketing copy.
- **Bilingual ES/EN is a rewrite, not a translation** — see the reglas in `brand/03-identidad-verbal.md#bilingüe-esen`. "Olivoterapia" itself is never translated.
- **The catalog is fixed at 17 SKUs** (`brand/05-catalogo.md`): 12 Eco Cosmética + 4 Línea Spa de Olivoterapia + Vallesi Arauco 500 ml olive oil. No wine. Names, formats and prices there come from the existing Verde Oliva site — don't invent or adjust them.
- Product/UX/content decisions marked **⚑ A validar** throughout `brand/` are open proposals, not settled facts — flag them rather than treating them as final when they matter to a task.

## Planned production architecture (not yet built)

`sitio/` is a static consolidation of the design, not the real build. `brand/07-estrategia-ecommerce.md` documents the actual target architecture: Next.js (App Router) on Vercel, ES/EN via `/` and `/en/` with mirrored routes, educational content in MDX in-repo, and commerce data on a separate platform — recommendation is Shopify headless (alternatives considered: Medusa/Vendure self-hosted, Tiendanube), still flagged ⚑ A validar as "the most important decision in the project." The sitemap, the three user-journey types (repeat guest / label-reader / gift-buyer), and the fixed product-page structure (need → skin type → when → how → what to expect, including what *not* to expect) in that same file are the source of truth once real implementation starts — read it before scaffolding routes or data models.
