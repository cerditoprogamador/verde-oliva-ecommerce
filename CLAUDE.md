# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

Two things, currently unconnected by any build system:

- **`brand/`** — the complete brand system for Verde Oliva Olivoterapia, a natural olive-polyphenol skincare ecommerce brand (Coquimbito, Maipú, Mendoza, Argentina). Markdown documents, numbered `00`–`08` in reading order.
- **`prototipo/`** — a static, dependency-free HTML prototype for choosing the site's UX direction (4 homes × 4 menus × 4 catalogs + 1 product page, all mixable). Not the production site.

There is no package.json, build tool, linter, or test suite — this is a design/content-planning stage, not an implemented application yet. There is also no git repository initialized.

## Working with `prototipo/`

Every page (`index.html`, `home-1..4.html`, `menu-1..4.html`, `catalogo-1..4.html`, `producto.html`) is a single self-contained file: inline `<style>` and inline `<script>`, zero external requests (no CDN, no Google Fonts `<link>` — font stacks fall back to system serif/sans since the `@import` from `brand/04` was intentionally left out here). Open any file directly in a browser; no server or build step needed.

`index.html` is the selector hub: it links out to every variant and persists the user's A/B/C/D pick per group (`home`, `menu`, `cat`) to `localStorage` under the key `vo-pick`. When editing a variant, keep it a drop-in replacement — same CSS custom properties (`--oliva`, `--crema`, `--tinta`, etc.), same wireframe-thumbnail markup pattern (`.tb`/`.v-*` classes) used in `index.html`'s comparison grid, and no added external dependencies.

## Brand rules that constrain any content or UI work

These aren't background reading — they're binding constraints most tasks in this repo will touch:

- **Color usage is contrast-verified and non-negotiable** (`brand/04-identidad-visual.md`): Oro Arauco `#B08D3F` is never text (only borders/hover/detail); Hoja `#6B7B3C` is never body text (use `#616F36` instead); the CTA is always Oliva Profundo `#3A4433` background with Crema `#F7F4EC` text. Full token set (CSS vars + Tailwind config) is in that file — copy from there rather than reinventing values.
- **Typography**: Cormorant Garamond for display/headings, Inter for body/UI/prices (never put prices in Cormorant — the serif's numerals are ambiguous).
- **Copywriting has a compliance-grade forbidden list** (`brand/03-identidad-verbal.md`): the brand is cosmetics, not medicine, and is regulated by ANMAT in Argentina. Never write claims that treat/cure/prevent a medical condition, name skin pathologies (acné, rosácea, etc.), claim wrinkle/scar removal, claim any SPF/sun protection, or use words like "hipoalergénico," "dermatológicamente probado," or "resultados garantizados" without a study backing them. Marketing filler ("milagroso," "revolucionario," "exclusivo") and false urgency ("¡última oportunidad!") are also excluded — see that file's "esto sí / esto no" tables before writing any product or marketing copy.
- **Bilingual ES/EN is a rewrite, not a translation** — see the reglas in `brand/03-identidad-verbal.md#bilingüe-esen`. "Olivoterapia" itself is never translated.
- Product/UX/content decisions marked **⚑ A validar** throughout `brand/` are open proposals, not settled facts — flag them rather than treating them as final when they matter to a task.

## Planned production architecture (not yet built)

`brand/07-estrategia-ecommerce.md` documents the target site: Next.js (App Router) on Vercel, ES/EN via `/` and `/en/` with mirrored routes, educational content in MDX in-repo, and commerce data on a separate platform — recommendation is Shopify headless (alternatives considered: Medusa/Vendure self-hosted, Tiendanube), still flagged ⚑ A validar as "the most important decision in the project." The sitemap, the three user-journey types (repeat guest / label-reader / gift-buyer), and the fixed product-page structure (need → skin type → when → how → what to expect, including what *not* to expect) in that same file are the source of truth once real implementation starts — read it before scaffolding routes or data models.
