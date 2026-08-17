---
target: sitio/index.html (home)
total_score: 31
max_score: 40
na_heuristics: 
p0_count: 1
p1_count: 2
timestamp: 2026-08-17T14-22-41Z
slug: sitio-index-html
---
Method: dual-agent (A: general-purpose sub-agent · B: general-purpose sub-agent)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3/4 | Newsletter form fakes an "Anotado" success state without sending the email anywhere; search gives zero feedback because it does nothing |
| 2 | Match Between System and Real World | 4/4 | Sensory, plain-language voice throughout ("el picor no es un defecto, es la señal...") |
| 3 | User Control and Freedom | 3/4 | Quiz has back/restart, cart drawer has escape/backdrop/continue-shopping exits; quiz has no skip-to-result |
| 4 | Consistency and Standards | 3/4 | Accordion pattern reused correctly everywhere; Eco-section add-to-cart buttons omit data-sku/name/price that Spa/Gourmet buttons set explicitly |
| 5 | Error Prevention | 3/4 | Add-to-cart self-disables ~1.2s to block double-submit; no validation-state design beyond native `type="email"` |
| 6 | Recognition Rather Than Recall | 4/4 | Chip counts, scroll-spy active state, and CTA copy consistently orient the user |
| 7 | Flexibility and Efficiency of Use | 2/4 | Search (#q / #q-mobile) is the one efficiency shortcut for repeat buyers and is completely dead — no handler anywhere in sitio/js |
| 8 | Aesthetic and Minimalist Design | 3/4 | Individual sections are restrained and on-brand; the page as a whole inlines the full catalog + 2 education blocks + quiz + newsletter on one continuous scroll |
| 9 | Error Recovery | 2/4 | No custom validation messaging anywhere; relies entirely on native browser affordances |
| 10 | Help and Documentation | 4/4 | Accordions, composition breakdown, and per-step ritual warnings act as strong embedded contextual help |
| **Total** | | **31/40** | **Good** |

All 10 heuristics scored (none n/a) — 7 and 10 were judged genuinely applicable given the page's own search surface and heavy embedded-education content, rather than defaulted to n/a for a Persuade-mode page.

## Design Specificity Verdict

**LLM assessment**: Not a reskinned template. The composition bar (oleico/escualeno/polifenoles breakdown with click-to-expand explanations), the editorial chapter system (Eco/Spa/Gourmet as "01/02/03" in the display serif), and the ritual-builder state machine (need × skin × time → priced routine with real per-step warnings drawn from actual product behavior) are all irreducibly specific to this product and this brand's "teach the practice" positioning — none of that content or logic ports to an unrelated ecommerce brand unchanged. The shell around it (full-bleed video hero, sticky filter chips, product-card grid, FAQ accordion, email strip) is standard DTC-lander scaffolding, but execution discipline (hairline-only separation, Fraunces reserved for display, Inter locked for prices) keeps it matching DESIGN.md's "Nature Distilled × Editorial Grid" north star. Verdict: specific in content and typographic discipline, generic in interaction-pattern choice — above-average, not a template.

**Deterministic scan**: The bundled detector (`detect.mjs`) ran in degraded/regex mode (its own parser dependencies were unavailable, so it under-counts rather than over-counts) and returned **89 findings across 5 scanned files** (index.html, catalogo.html, one product page, finca.html, checkout-exito.html): 73 `design-system-font-size` (inline `<style>` clamp/rem values off the documented type ramp — the dominant, systemic finding), 7 `design-system-color` (drop-shadow/text-shadow rgba values used for photo-legibility, not fills — plausible false-positive category, not explicitly excused by DESIGN.md), 5 `overused-font` (Fraunces loaded on every page — already known, documented drift vs. brand/04's Cormorant Garamond spec, tracked in DESIGN.md), 3 `design-system-radius` (3px on `.rq-opt`/`.steps`/`.q` vs. the documented 4px card token — genuine minor drift, not the badge exception), 1 `layout-transition` (catalogo.html's `.tbunderline` animates `width` alongside `transform`).

Cross-check with the LLM pass: the LLM independently flagged `.rq-opt`'s 3px radius as a minor drift note — the detector confirms this and finds two more instances (`.steps`, `.q`) the LLM didn't call out, so this is now a confirmed, slightly broader pattern, not a one-off.

**Visual/browser evidence**: No script-injection overlay was run (this pass used direct screenshots + console/network inspection instead of the `detect.js` browser overlay). Real desktop-viewport (1440px) findings: zero console errors, zero failed/404 network requests, zero horizontal scroll on index.html or the product page. One transient issue observed directly, not modeled: on `catalogo.html`, the H1/kicker/lead and trust-badge line render in visibly low contrast for roughly 1–2 seconds on first paint before `reveal.js`'s IntersectionObserver fade-in resolves to full contrast. Mobile-width (390px) testing could not be completed — the viewport-resize tool reported success but `window.innerWidth` never actually changed from 1440px after two attempts — so no mobile-specific findings are reported; this is a tooling gap in this run, not a clean bill of health for mobile.

## Overall Impression

The page is doing real, brand-specific work — the composition breakdown and ritual builder are genuinely good interaction design that operationalizes the brand's "teach the practice" positioning instead of just asserting it in copy. The biggest gap is that two pieces of UI actively work against the brand's own stated values: the newsletter claims success it doesn't deliver, and the one search control built for the brand's highest-priority, lowest-CAC persona (the repeat buyer) is entirely non-functional. Underneath that, there's a systemic, code-level pattern of ad hoc font sizes drifting from the documented type scale (73 instances, concentrated in per-page inline `<style>` blocks) that's easy to miss reading any single section but adds up to real design-system erosion.

## What's Working

1. **The composition bar + accordion** (`#informacion`) — converts the brand's "Honestidad" pillar directly into an interface element (click to see what oleico/escualeno/polifenoles each actually do), not just marketing copy.
2. **The ritual builder** (`#rquiz`/`#rresult`) — a real state machine mapping need × skin type × time budget to a priced, warned-per-step routine sourced from actual product copy ("El trabajo lo hace el grano, no la presión"). This is interaction design doing brand work, not a generic quiz wizard.
3. **Zero console errors, zero failed requests, zero horizontal scroll** at desktop width — the engineering underneath the design is clean; nothing is silently broken.

## Priority Issues

**[P0] Newsletter signup fakes success while capturing nothing**
- **Why it matters**: `index.html:823`'s submit handler shows "Anotado" and resets the form without ever sending the email anywhere. This is the site's own UI making exactly the kind of claim the brand's compliance rules forbid in product copy — telling the user something was recorded when it wasn't — and it silently zeroes out a stated PRODUCT.md success metric (organic authority via content requires an actual list).
- **Fix**: Wire to a real subscription endpoint, or replace the fake-success state with an honest "próximamente" state if no backend exists yet.
- **Suggested command**: `/impeccable harden`

**[P1] Search is a fully dead control, on desktop and mobile**
- **Why it matters**: `#q`/`#q-mobile` have no event handler anywhere in `sitio/js/*.js` and aren't wrapped in a `<form>` — typing and pressing Enter does nothing. PRODUCT.md's highest-priority persona ("la que ya nos conoce la mano") has repurchase-with-minimal-friction as her explicit job; search is the one control built for exactly that job. Below 1180px the desktop searchbox doesn't render at all (`base.css:155`), so mobile users — who lose search entirely per Assessment B's viewport note — depend on the hamburger-panel search, which is also dead.
- **Fix**: Wire `#q`/`#q-mobile` to at minimum a client-side scroll-to-match against on-page product titles, or a query-param handoff to `catalogo.html`.
- **Suggested command**: `/impeccable harden`

**[P1] Type scale has drifted system-wide, not just on this page**
- **Why it matters**: The detector found 73 `design-system-font-size` instances (of 89 total findings) across all 5 scanned files — inline `<style>` clamp/rem values that don't match `base.css`'s documented `.d1`–`.d4`/kicker ramp. This is the single largest finding by volume and spans index, catálogo, product, finca, and checkout pages — a systemic type-scale compliance gap, not an isolated slip.
- **Fix**: Audit each page's inline `<style>` block against `DESIGN.md`'s Typography hierarchy and consolidate onto the shared `.d1`–`.d4`/kicker classes where the intent matches; only keep a bespoke size where there's a real reason not to reuse the scale.
- **Suggested command**: `/impeccable typeset`

**[P2] Quiz questions and the Eco chapter both exceed the 4-item cognitive-load ceiling**
- **Why it matters**: Quiz Q1 (5 need options) and Q2 (5 skin-type options) are the two most consequential decision points on the page — they drive the entire ritual recommendation — and both exceed Miller's-Law-derived working-memory guidance. The "01 Eco Cosmética" chapter also chunks 10 products under one chapter head.
- **Fix**: Drop each quiz question to 4 options (move a 5th to a secondary/optional prompt), and give the Eco sub-line dividers more visual weight so the section doesn't read as one 10-item chunk.
- **Suggested command**: `/impeccable clarify`

**[P2] `.gourmet-seal` breaks two of DESIGN.md's own named rules**
- **Why it matters**: The 92px circular "Desde 1890" badge (`index.html:165-171`) uses a resting-state `box-shadow`, breaking both the Flat-At-Rest Rule (shadow only as a hover/open-state response) and the No-Pills Rule's spirit (full circular treatment reserved for the single-digit cart badge). This sits on the Vallesi Arauco oil — the one SKU that's supposed to be the literal proof of origin — so a rule-breaking decorative flourish lands on the product meant to carry the most credibility weight.
- **Fix**: Replace with a flat, hairline-bordered mark matching the 4px card-corner language; drop the shadow.
- **Suggested command**: `/impeccable polish`

**[P3] Reveal-on-scroll produces a real, if brief, low-contrast flash**
- **Why it matters**: On `catalogo.html`, the H1/kicker/lead and trust-badge line render at visibly low contrast for ~1-2 seconds before `reveal.js`'s fade-in resolves to full contrast — directly observed via two sequential screenshots, not inferred. Minor on its own, but worth checking against the WCAG 2.1 AA target now recorded in PRODUCT.md, since a user reading during that window is reading sub-AA-contrast text.
- **Fix**: Consider a smaller initial-opacity floor (e.g. 0.4 instead of 0) for text-bearing `.reveal-block`s so first paint never dips below a readable threshold.
- **Suggested command**: `/impeccable audit`

## Persona Red Flags

**Jordan (first-timer)**: DOM order sells before it teaches — the full 13-product catalog (`#productos`) renders before the composition/polyphenol explainers (`#informacion`, `#polifenoles`). A visitor who doesn't yet know what "olivoterapia" means sees the entire priced catalog before the page explains what any of it does — backwards from the brand's stated "explica sin exagerar" positioning.

**Casey (mobile)**: The 3.37MB hero video autoplays with `preload="auto"`, gated only by `prefers-reduced-motion` (not a data-saving/connection preference) — every mobile visitor on cellular pays that cost before seeing anything. Combined with the dead search control, mobile users lose the repeat-buyer shortcut entirely with no fallback.

**"La que busca el regalo con historia" (PRODUCT.md's named gift-buyer persona)**: Zero gift framing on the home page. The quiz's five need-options all assume the buyer is shopping for her own routine and knows the recipient's skin type — but PRODUCT.md explicitly describes this persona as not knowing/caring about polyphenols today and needing the product to explain itself in one sentence. There's no "es para regalo" path anywhere on the page, despite this persona being named as commercially significant (seasonal, highest-volume) in PRODUCT.md.

## Minor Observations

- Eco-section `data-add` buttons omit `data-sku`/`data-name`/`data-price` while Spa/Gourmet buttons set them explicitly (works today via `cart.js`'s DOM-fallback, but inconsistent authoring).
- `.rq-opt`, `.steps`, and `.q` all use `border-radius:3px`, vs. the documented 4px card token — small, consistent drift, not the badge exception.
- The hero's "cruelty free"/"libre de gluten"/"libre de parabenos" claims row has no visual-seal treatment, while the olive oil alone gets a bespoke circular badge — inconsistent trust-signal weighting.
- `catalogo.html:54`'s `.tbunderline` animates `width` alongside `transform` — a real (if low-risk, single-element) layout-property animation the shared system otherwise avoids.
- Free-shipping threshold ($60.000) is mentioned in the auto-hiding top strip but never resurfaces near cart totals — the default "hidratar" ritual totals $59.500, $500 under the threshold, with no nudge at the moment it would matter.

## Questions to Consider

1. If the entire catalog already lives on the home page in full card detail, what is `catalogo.html` actually *for* — would a first-time visitor ever have a reason to click through rather than keep scrolling?
2. The brand's #1-priority persona is the repeat buyer who wants minimal friction, and the one control built specifically for her — search — ships completely non-functional. What would it take to ship even the simplest working version?
3. Does a newsletter form that displays "Anotado" while discarding the email meet the same honesty bar the brand's own compliance rules apply to product copy?
