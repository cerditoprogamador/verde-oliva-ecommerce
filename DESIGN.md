---
name: Verde Oliva Olivoterapia
description: Olive-polyphenol skincare from a 135-year-old grove in Maipú, Mendoza — an editorial publication that also sells what it produces.
colors:
  oliva-profundo: "#3A4433"
  oliva-profundo-hover: "#2C3427"
  hoja: "#6B7B3C"
  hoja-texto: "#616F36"
  oro-arauco: "#B08D3F"
  terracota: "#C67B5C"
  terracota-texto: "#A25C3D"
  corteza: "#1C1917"
  crema: "#F7F4EC"
  crema-2: "#F1EBDD"
  arena: "#D4C4A8"
  tinta: "#54584B"
  linea: "rgba(58,68,51,.18)"
typography:
  display:
    fontFamily: "Fraunces, Georgia, 'Times New Roman', serif"
    fontSize: "clamp(2.4rem, 5.6vw, 4.2rem)"
    fontWeight: 600
    lineHeight: 1.06
    letterSpacing: "-0.012em"
  body:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.65
    letterSpacing: "normal"
  kicker:
    fontFamily: "Inter"
    fontSize: "0.71rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.24em"
  headline:
    fontFamily: "Fraunces, Georgia, 'Times New Roman', serif"
    fontSize: "clamp(2.2rem, 5.2vw, 4rem)"
    fontWeight: 600
    lineHeight: 1.06
    letterSpacing: "-0.012em"
  title:
    fontFamily: "Fraunces, Georgia, 'Times New Roman', serif"
    fontSize: "clamp(1.7rem, 3.2vw, 2.7rem)"
    fontWeight: 600
    lineHeight: 1.06
    letterSpacing: "-0.012em"
  subtitle:
    fontFamily: "Fraunces, Georgia, 'Times New Roman', serif"
    fontSize: "clamp(1.3rem, 2vw, 1.75rem)"
    fontWeight: 600
    lineHeight: 1.14
  lead:
    fontFamily: "Inter"
    fontSize: "clamp(1.02rem, 1.4vw, 1.2rem)"
    fontWeight: 400
    lineHeight: 1.62
rounded:
  buttons: "2px"
  inputs: "2px"
  cards: "4px"
  editorial-images: "0px"
  badge: "9px"
spacing:
  xs: "8px"
  sm: "16px"
  md: "24px"
  lg: "32px"
  xl: "48px"
  2xl: "64px"
  3xl: "96px"
components:
  button-primary:
    backgroundColor: "{colors.oliva-profundo}"
    textColor: "{colors.crema}"
    rounded: "{rounded.buttons}"
    padding: "16px 32px"
  button-primary-hover:
    backgroundColor: "{colors.oliva-profundo-hover}"
    textColor: "{colors.crema}"
    rounded: "{rounded.buttons}"
    padding: "16px 32px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.oliva-profundo}"
    rounded: "{rounded.buttons}"
    padding: "16px 32px"
  button-ghost-hover:
    backgroundColor: "{colors.oliva-profundo}"
    textColor: "{colors.crema}"
    rounded: "{rounded.buttons}"
    padding: "16px 32px"
  card-product:
    backgroundColor: "transparent"
    textColor: "{colors.corteza}"
    rounded: "{rounded.editorial-images}"
    padding: "0"
---

# Design System: Verde Oliva Olivoterapia

## Overview

**Creative North Star: "Nature Distilled × Editorial Grid"** (named directly in `brand/04-identidad-visual.md`, and the phrase this system should be judged against)

Muted earth over warm cream, organic material, subtle grain — laid across an asymmetric magazine grid with editorial type and generous air. The stated anti-references are explicit and load-bearing: not a spa (no pastel wellness chrome), not a pharmacy (no clinical whites/blues), not a kraft-and-leaf "eco" brand. The working metaphor is a publication about the olive tree that happens to also sell what it produces — so type, grid, and photography all carry more editorial weight than commerce-template weight.

The system runs almost shadow-free: separation comes from a 1px hairline (`--linea`) and surface-color changes, not elevation. Motion is deliberately slow and restrained (`--e: cubic-bezier(.22,.61,.36,1)`) — hover changes color, border, or opacity, never scale or layout position. Corners are sharp-to-slightly-eased (2px buttons/inputs, 4px cards, 0 on editorial imagery) — nothing reads as an app or a SaaS product; the brand is material, not soft.

**Key Characteristics:**
- Warm, desaturated earth palette (oliva green, terracotta, gold) on a cream ground, never bright or saturated
- Editorial serif for display copy, a workhorse sans for everything functional (body, UI, prices)
- Hairline borders and color-surface shifts instead of shadows/elevation
- Sharp, contained corners — explicitly no fully-rounded ("pill") buttons, tags, or badges
- Slow, subtle, transform/opacity-only motion; respects `prefers-reduced-motion` everywhere

## Colors

Muted, warm, earth-derived — every pairing in active use is WCAG-contrast-verified in `brand/04-identidad-visual.md`, and those verified pairings are binding, not decorative choices.

### Primary
- **Oliva Profundo** (`#3A4433`): the brand's one solid-fill color — all primary buttons/CTAs, the footer, dark-section backgrounds (`.dark`), and headline color intent. Always paired with Crema text at this weight (9.30:1, AAA). Hover state uses **Oliva Profundo Hover** (`#2C3427`).

### Secondary
- **Hoja** (`#6B7B3C`): fills, large icons, and color blocks (e.g. the small dot bullet in card labels). **Never used as body text** — at 4.22:1 on Crema it doesn't clear AA. Where the same hue must be text, use **Hoja Texto** (`#616F36`, 4.98:1 AA).

### Tertiary
- **Terracota** (`#C67B5C`): warm editorial highlight/surface color, used sparingly for accents outside the core oliva system. As text, use **Terracota Texto** (`#A25C3D`, 4.62:1 AA).

### Neutral
- **Crema** (`#F7F4EC`): the base background across every page.
- **Crema Segunda** (`#F1EBDD`, `.sand`): a slightly deeper cream for alternating section backgrounds.
- **Corteza** (`#1C1917`): body text and ink — 15.91:1 on Crema (AAA).
- **Arena** (`#D4C4A8`): surfaces, dividers, card/selection blocks; also `::selection` background.
- **Tinta** (`#54584B`): muted text — kickers, captions, secondary labels, the `.lead` paragraph color. 6.65:1 on Crema (AA) — verified here since `brand/04-identidad-visual.md` documents a slightly different hex (`--vo-text-muted #57534E`) for this role; `#54584B` is what's actually shipped in `base.css` and is the value future work should treat as canonical until the brand doc is reconciled.
- **Línea** (`rgba(58,68,51,.18)`, faint variant `rgba(58,68,51,.10)`): the only separator device in the system — hairline borders on headers, cards, accordions, footers.

### Named Rules
**The Gold-Never-Text Rule.** Oro Arauco `#B08D3F` is a border, hairline, hover accent, and focus-ring color only — never typographic text. On Crema it measures 2.84:1 (fails AA); if a typographic gold is ever unavoidable, the darker `#7E6129` (5.26:1) is the substitute, but the brand doc's own guidance is to ask first whether that should just be Corteza.

**The Oliva CTA Rule.** The call-to-action is always Oliva Profundo background with Crema text (9.30:1, AAA). This is not replaced by gold "because it looks nicer" — that substitution is explicitly called out and forbidden in `brand/04-identidad-visual.md`.

## Typography

**Display Font:** Fraunces (with Georgia, Times New Roman fallback) — this is what `sitio/css/base.css`'s `--fs` actually loads and renders today.
**Body Font:** Inter (with system-UI fallback) — used for body copy, all UI chrome, labels, and every price. Prices are never set in the display serif; a high-contrast serif's numerals read ambiguous at a glance.

**Character:** An editorial-heritage serif carrying headlines and mood, paired with a plain, highly legible grotesque that runs the actual interface — the split exists specifically so checkout and forms never inherit the serif's lower legibility.

⚑ **Known drift, not yet resolved — flag before treating either as final.** `brand/04-identidad-visual.md`'s adenda explicitly discarded Fraunces in favor of Cormorant Garamond as the system's second (and only other) typeface, stating the system should have exactly two fonts (Cormorant Garamond + Inter), no third. The shipped code in `sitio/css/base.css` still defines `--fs: 'Fraunces'`. This DESIGN.md documents the code as it is actually implemented today (Fraunces); it is not a recommendation to keep it that way. Don't silently "fix" this in either direction without asking — see `CLAUDE.md`'s note on the same drift.

### Hierarchy
- **Display / `.d1`** (600, `clamp(2.4rem, 5.6vw, 4.2rem)`, 1.06): hero and top-of-section headlines.
- **`.d2`** (600, `clamp(2.2rem, 5.2vw, 4rem)`, 1.06): secondary section headlines.
- **`.d3`** (600, `clamp(1.7rem, 3.2vw, 2.7rem)`, 1.06): sub-section headings.
- **`.d4`** (600, `clamp(1.3rem, 2vw, 1.75rem)`, 1.14): card/block-level headings (e.g. `.card-t` at 1.3rem).
- **Body** (400, `1rem`/16px minimum on mobile, 1.65): running copy. `.lead` variant sits at `clamp(1.02rem, 1.4vw, 1.2rem)`/1.62 in Tinta, capped at 62ch measure.
- **Kicker/Label** (500, `0.71–0.76rem`, letter-spacing `0.1–0.24em`, uppercase): eyebrow labels, nav links, card line labels — the system's one recurring "small caps" device.

### Named Rules
**The No-Serif-Numerals Rule.** Prices are always Inter, never the display serif — ambiguous numerals in a high-contrast serif are a checkout risk, not just a style call.

### Sanctioned exception: page-local editorial type steps
`index.html`, `catalogo.html`, and the `producto-*.html` pages each declare a page-scoped `<style>` block with type sizes that don't match `.d1`–`.d4`/kicker exactly (e.g. `index.html`'s own comment: "home: escala más grande que el default de base.css"). This is a disclosed, intentional pattern — a one-time editorial moment (a hero lockup, a chapter numeral like `.cn`, a pull-quote, a gourmet-seal figure) earning a bespoke size — not silent drift, and not something to mechanically rewrite onto the four shared steps. Treat a *repeated* value across multiple pages as a real candidate for promotion to a named token; treat a true one-off as legitimate composition. The mechanical detector cannot tell the two apart, so isolated advisory findings here are expected and don't all need fixing.

### Sanctioned exception: text-shadow for photo/video legibility
`rgba(0,0,0,.4)` / `rgba(0,0,0,.45)` appear as `text-shadow`/`filter:drop-shadow` values on light text sitting over photographic or video backgrounds (`index.html`'s scrolled-transparent header over the hero, `.hero-t h1`, `.hero-logo-t`, `finca.html`'s banner headline). This is a legibility technique, not a brand accent color, and is exempt from the palette token list above — it should stay a black-based shadow at low opacity regardless of what the surrounding palette does, since its only job is contrast against an unpredictable photo, never brand expression.

## Layout

12-column asymmetric grid, `max-width: 1280px` container (`.wrap`), responsive side padding `clamp(20px, 5vw, 64px)`. Section rhythm (`.sect`) runs `clamp(48px, 6.5vw, 96px)` vertical padding — generous, increasing air is treated as identity, not empty space to be filled. Long-form text is capped at ~62–68ch. Spacing scale is base-8: `4·8·16·24·32·48·64·96·128`. Header height is a shared token (`--hh: 76px`) that every page's `body` padding/scroll-margin accounts for, so nothing hides under the sticky header.

Breakpoints observed in the shared header/nav system: `479px` (hides the logo subtitle), `999/1000px` (mobile hamburger nav ↔ desktop inline nav), `1180px` (search box appears), `700px`/`1024px` (footer grid goes from 1 to 2 to 4 columns).

## Elevation & Depth

Almost flat. Depth is conveyed through surface-color changes and a single 1px hairline (`--linea` / `--linea-f`), not shadow-based elevation — consistent with the "material, not soft" brand direction. The few shadows that exist are all state-responses, not resting-state decoration:

### Shadow Vocabulary
- **Button hover lift** (`0 12px 22px -10px rgba(28,25,23,.4)`, dark-mode variant `rgba(0,0,0,.35)`): appears only on `.btn:hover`, paired with a 2px `translateY` lift.
- **Mobile nav panel** (`-16px 0 40px -12px rgba(28,25,23,.35)`): the slide-in `.mnav` panel, the one place true elevation appears, because it's a panel sitting over content.
- **Backdrop scrim** (`rgba(20,18,15,.5)`): behind the mobile nav panel only.

### Named Rules
**The Flat-At-Rest Rule.** Every static block (cards, header, footer, accordions) sits at zero elevation. Shadow only appears as a hover/open-state response on interactive elements, never as ambient decoration on a resting surface.

## Shapes

Contained, sharp-leaning corner language, deliberately never a "pill": `2px` on buttons and inputs, `4px` implied on card containers (no radius currently set directly on `.card`/`.ph` in the shared stylesheet, but the badge and icon-button treatments below anchor the scale), `0` (square) on all editorial photography placeholders and images. The one circular exception is the small cart-count `.badge` (17px, ~9px radius = a true circle), used only for a single-digit counter — a conventional notification-dot treatment, not a "pill."

### Named Rules
**The No-Pills Rule.** No `border-radius` of 100px or more anywhere — buttons, toggles, badges, tags, and chips are all excluded from full rounding. This was consolidated in `brand/04-identidad-visual.md`'s adenda after prototype-inherited pill buttons drifted in; treat any fully-rounded interactive element found in `sitio/` as implementation drift to fix, not as an accepted variant.

## Components

### Buttons
- **Shape:** 2px radius, `min-height: 58px` (58px primary / 48px `.btn-sm`), `border-radius: 2px`.
- **Primary (`.btn`):** Oliva Profundo background, Crema text, 1px border in the same color, Inter 600. No uppercase transform in the shipped CSS (`text-transform: none`) — note this is a drift from `brand/04`'s spec of an uppercase primary button with `letter-spacing: .08em`; the shipped sentence-case version is what's live today.
- **Hover / Focus:** background darkens to Oliva Profundo Hover, `translateY(-2px)` lift plus the button-hover shadow; `:active` drops the lift and shadow. `:focus-visible` gets a 2px Oliva outline (Crema on dark sections), 3px offset.
- **Ghost (`.btn-ghost`):** transparent background, Oliva Profundo text, hairline border; hover inverts to solid Oliva Profundo with Crema text.
- **Disabled:** 0.75 opacity, no hover transform/shadow.

### Links
- **Style (`.link`):** uppercase Inter label (0.76rem, letter-spacing .1em), Oliva Profundo text, hairline underline. Hover: underline shifts to Oro Arauco and the icon gap widens — the only place gold functions as an active-state signal rather than a static border.

### Cards / Containers
- **Product card (`.card`):** no background container — the photo (`.ph`, 4:5 aspect ratio) plus text block below it (`.card-b`). Hover lifts the whole card `translateY(-3px)` and brightens/saturates the photo slightly; no shadow, no border added on hover.
- **Card text block:** uppercase kicker label with a small Hoja-colored dot, then a Fraunces title (`.card-t`, 1.3rem), a muted format line, then an Inter 500 price — prices are never in the display font, consistent with the typography rule above.

### Accordion (signature component)
The one repeated expand/collapse pattern across the whole site (`.acc`), used for both the home page's `#skin` block and every educational section on product pages. A rotating 45°→225° chevron (`::after`, built from two CSS border edges, not an icon font) replaces the summary marker; body copy is capped at 62ch. `brand/04-identidad-visual.md`'s adenda makes this pattern singular by rule — no new expand/collapse UI should invent an alternate visual (e.g. a `+`/`–` glyph).

### Navigation
- **Desktop header (`.hdr`):** sticky, Crema background, hairline bottom border, appears from `1000px` up; nav links get a hover background wash plus an animated Oro Arauco underline that scales in from the left on hover.
- **Mobile nav (`.mnav`):** a right-side slide-in panel (`min(78vw, 300px)`) below `1000px`, with its own search field, link list, and language switcher, backed by a dimmed scrim.
- **Language switcher (`.lang`):** plain text buttons; the active language gets Oliva Profundo color and an Oro Arauco underline (`aria-pressed="true"`) — the system's only other legitimate typographic use of gold, as a non-text focus/state indicator rather than a text color.

## Do's and Don'ts

### Do:
- **Do** use Oliva Profundo + Crema for every primary CTA (9.30:1, AAA) — no substitution for aesthetic reasons.
- **Do** keep Oro Arauco to borders, hairlines, hover accents, and focus rings only.
- **Do** set body copy and all prices in Inter; reserve the display serif for headlines and large-size moments.
- **Do** keep motion to `transform`/`opacity` only, and honor `prefers-reduced-motion` (already wired throughout `base.css`).
- **Do** treat the `.ph` gradient-and-grain placeholder as a legitimate, intentional stand-in for missing product photography — not a broken or unfinished state — until a real photo exists for that specific slot.

### Don't:
- **Don't** set `#6B7B3C` (Hoja) as body text — it fails AA at 4.22:1; use `#616F36` instead.
- **Don't** introduce a `border-radius` of 100px or more on any button, tag, chip, or badge (badge counters are the one accepted circular exception).
- **Don't** add a third typeface for any reason, including a single small label.
- **Don't** add resting-state box-shadows to cards, headers, or footers — depth comes from hairlines and surface color, not elevation.
- **Don't** invent a second expand/collapse visual pattern — reuse the rotating-chevron `.acc` treatment everywhere `<details>/<summary>` is needed.
