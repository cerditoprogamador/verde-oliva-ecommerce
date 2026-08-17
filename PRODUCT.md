# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Three named personas, in commercial priority order (source: `brand/00-brief-de-marca.md`, `brand/02-posicionamiento.md`):

1. **La que ya nos conoce la mano** — stayed at Verde Oliva Casa de Huéspedes or received a product as a gift there; already knows the scent, texture, and effect. Highest-value, lowest-CAC customer. Job to be done: repurchase the exact product she already used, with as little friction as possible.
2. **La que lee la etiqueta** — 30–55, buys natural cosmetics critically, distrusts the word "natural" because she's seen it everywhere, googles ingredients before buying. This is who the educational layer (mechanism, origin, honest limits) is written for; if she trusts the brand, she defends it.
3. **La que busca el regalo con historia** — buying for someone else, doesn't know or care about polyphenols today, needs the product to explain itself and arrive well-presented with a one-sentence story. Highest-volume, seasonal.

## Product Purpose

Verde Oliva Olivoterapia sells a 17-SKU line of olive-polyphenol skincare (Eco Cosmética, Línea Spa de Olivoterapia, and Vallesi Arauco extra-virgin olive oil) pressed from a single 1890 olive grove (Ángel Cavagnaro's planting) in Coquimbito, Maipú, Mendoza, Argentina. The products originated as in-house treatment formulas used by Fernanda Herrera in the estate's spa and were, until now, never sold commercially — the brand exists to take that practice out of the estate and sell it directly, while teaching the underlying practice ("olivoterapia") rather than just moving units.

Success (per `brand/00-brief-de-marca.md`'s stated first-stage objectives) means: repeat purchases from guests who already know the product; organic authority on "olivoterapia" in ES and EN; higher conversion from visitors who read educational content vs. those who don't; revenue per ritual/pack rather than per single unit; and — the objective the brand treats as the real tell — returns/complaints from unmet expectations staying near zero.

## Positioning

*"Para quien elige su cosmética leyendo la etiqueta, Verde Oliva Olivoterapia es la marca de cuidado de la piel a base de polifenoles de oliva que, a diferencia de las marcas que ponen 'aceite de oliva' en el envase, cosecha su propia materia prima de un olivar de 1890 en Maipú y explica sin exagerar qué hace ese aceite sobre el cuerpo."*

The category claimed is **olivoterapia**, not generic "natural cosmetics" — a term the brand did not invent (it's already practiced at the estate) but is close to unclaimed in ES/EN search, and is deliberately explanatory rather than aspirational. Three pillars everything else hangs off:

1. **Origen** — the olive grove and the single annual harvest/pressing are owned, not sourced from a supplier; the edible Vallesi Arauco oil sitting in the same catalog as the cosmetics is the literal proof it's the same oil.
2. **Práctica** — the formulas exist because they support real treatments given on a massage table; the Línea Spa SKUs are the professional formulas, not a consumer-grade adaptation of them.
3. **Honestidad** — every product page states what a product does *and* what it does not do; no claim is made that isn't defensible.

Competitive set is "traceable-origin natural cosmetics," not pharmacy skincare: small-batch Argentine artisanal soap/skincare makers, estate/winery cosmetic side-lines (the most dangerous confusion risk — Verde Oliva must read as an independent brand, never as "the hotel's souvenir shop"), established national natural-skincare brands, and imported Mediterranean olive skincare. The brand's differentiated quadrant is real traceable origin *combined with* real depth of knowledge — a combination the brief states is essentially empty in the Argentine market today.

## Operating Context

- Bilingual ES/EN from launch, implemented as a client-side rewrite (not literal translation) via `sitio/js/i18n.js` — "Olivoterapia" itself is never translated.
- Purchase flow: browse (by línea or por necesidad) → cart → Google Identity Services login → Mercado Pago checkout, all same-origin through the Express `api/` backend serving the static `sitio/` frontend.
- The estate (Verde Oliva Casa de Huéspedes) is the brand's origin and proof, explicitly *not* its seller or narrative owner — the site must never ask a shop customer to book a hotel stay, and the hotel's own reputation/awards are deliberately not used as social proof for the shop.
- Regulatory operating context: cosmetics regulated by ANMAT in Argentina — this constrains what any page, email, or product description is allowed to claim (see Capabilities and Constraints).
- Deploy target is Hostinger's Node.js Selector: one process serves both the static frontend and the API from the same origin specifically to avoid CORS/cross-origin cookie handling on shared hosting.

## Capabilities and Constraints

- **Catalog is fixed at 17 SKUs** (`brand/05-catalogo.md`): 12 Eco Cosmética + 4 Línea Spa de Olivoterapia + 1 Vallesi Arauco 500 ml olive oil. No wine. Names, formats, and prices are sourced from the existing Verde Oliva site, not invented — the brand will not grow SKU count before it grows content depth.
- **Compliance-grade forbidden-claims list** (`brand/03-identidad-verbal.md`): the brand is cosmetics, not medicine, and is regulated by ANMAT. Never write claims that treat/cure/prevent a medical condition, name skin pathologies (acné, rosácea, etc.), claim wrinkle/scar removal, claim any SPF/sun protection, or use "hipoalergénico" / "dermatológicamente probado" / "resultados garantizados" without a study backing them. Also excluded: marketing filler ("milagroso," "revolucionario," "exclusivo"), false urgency, and struck-through reference prices. This is treated as a hard constraint, not house style — see that file's esto sí/esto no tables before writing any product or marketing copy.
- **Product page structure is fixed**, not a layout preference (`brand/07-estrategia-ecommerce.md` lines 85–121, implemented in `sitio/producto.html`): gallery+buy box → educational block (para qué sirve, para qué piel, cuándo, cómo, qué esperar — always including what it does *not* do) expanded, never tabbed → combina con (each pairing states its *why*) → el origen → ingredientes/seguridad → the ritual it belongs to.
- **No permanent discounting or false urgency** as a pricing mechanism (`brand/00-brief-de-marca.md`); the brand's stated pricing lever is bundled "packs por ritual," not price cuts.
- Sessions are MySQL-backed (`express-mysql-session`); checkout re-prices every item server-side against `api/products.js` and never trusts a client-submitted price.
- Terms marked **⚑ A validar** throughout `brand/` (e.g. English line names, export pricing strategy) are open proposals, not settled facts — flag rather than treat as final when a task touches them.

## Brand Commitments

- Name: **Verde Oliva Olivoterapia** — an independent brand that uses the estate's name and origin as backing, not "the hotel's shop."
- "Olivoterapia" is never translated in the EN copy.
- Color usage is contrast-verified and non-negotiable (`brand/04-identidad-visual.md`): Oro Arauco `#B08D3F` is never text; Hoja `#6B7B3C` is never body text (`#616F36` instead); CTAs are always Oliva Profundo `#3A4433` background with Crema `#F7F4EC` text.
- Typography: Cormorant Garamond (nominal brand rule) for display/headings — as shipped, `sitio/css/base.css` uses Fraunces instead; Inter for body/UI/prices always (prices are never set in the display serif, whose numerals are ambiguous). Verify `--fs` in `base.css` before assuming which serif is currently live rather than "fixing" one to match the brand doc.
- Voice: cálida, concreta, sin apuro; explains without lecturing or infantilizing; never promises miracles, never uses urgency language, states limits when they exist (`brand/03-identidad-verbal.md`).

## Evidence on Hand

- Full brand documentation in `brand/00`–`08` (brief, history, positioning, verbal identity, visual identity, catalog, olivoterapia education, ecommerce strategy, master copy) — sourced from the existing Verde Oliva Casa de Huéspedes site; nothing about the estate, people, products, formats, or prices is invented there.
- Real product photography for 13 of the 17 SKUs in `prototipo/img/productos/` (one JPG per SKU slug); `sitio/img/` was originally copied from the same source.
- Shipping frontend content in `sitio/` (home, catálogo, producto, finca, términos, privacidad, checkout result pages) and `sitio/llms.txt` (hand-maintained brand/catalog summary for agents).
- **No real customer testimonials, reviews, case studies, order history, or press coverage exist yet** — the business is pre-launch (confirmed by user). Future design or copy work must not fabricate any of these; the hotel's own guest reviews/awards exist but are explicitly excluded as shop social proof by brand rule (see Operating Context).

## Product Principles

1. **Teach the practice, not just sell the product.** The site is organized by need/ritual as well as by product line, and every product page explains when/how/on what skin — content that would still be worth reading with the store removed is the brand's own test for whether the differentiation is real.
2. **Never claim more than what's defensible.** The ANMAT-driven forbidden-claims list and the "what it does *not* do" requirement on every product page are non-negotiable; the brief names overclaiming as the single biggest risk to the brand's central asset (credibility).
3. **Independent from, not a souvenir of, the estate.** The hotel is origin and proof, never seller or narrative owner; nothing on the shop should ask a customer to book a stay, and hotel review scores are not shop social proof.
4. **Depth before SKU growth.** The catalog is fixed at 17 SKUs by design; the brand grows through content/education depth, not by adding products.
5. **Ticket by ritual, not by unit.** Packs and routine-building are the brand's pricing lever instead of discounting or urgency.

## Accessibility & Inclusion

WCAG 2.1 AA (confirmed by user). No additional user-specific accessibility need has been established beyond that standard.
