/* Copy en inglés específico de catalogo.html (rescritura de marca, no
   traducción literal — ver brand/03-identidad-verbal.md#bilingüe-esen).
   Los 13 productos aparecen dos veces (vista por necesidad / vista por
   línea); cuando el texto en español coincide byte a byte entre ambas
   vistas se reusa la misma clave (p. ej. p-sales-desc), y cuando difiere
   se separan en -nec-desc / -lin-desc. #fcount y los spans [data-gcount]
   no se etiquetan aquí: el script de la página los reescribe dinámicamente
   con innerHTML/textContent en cada cambio de filtro, así que una clave
   data-i18n en esos nodos quedaría pisada después de la primera interacción. */
window.VO_I18N_PAGE = {
  "fcount-de": "of",
  "fcount-productos": "products",
  "gcount-producto": "product",
  "gcount-productos": "products",
  "top-kicker": "The catalog",
  "top-h1": "All 13 products, by what they solve or by the line you already know.",
  "top-lead": "Nobody wakes up wanting “an emulsion”: the need-based view opens by default, because it starts from what you're trying to solve, not the name on the bottle. If you already know Everyday Care, Spa Line and the oil, the by-line view is one click away.",

  "tab-necesidad": "By need",
  "tab-linea": "By line",

  "filt-linea-label": "Line",
  "filt-linea-todas": "All",
  "filt-linea-eco": "Everyday Care",
  "filt-linea-spa": "Spa Line",
  "filt-linea-gourmet": "Gourmet",

  "filt-necesidad-label": "Need",
  "filt-necesidad-todas": "All",
  "filt-necesidad-limpiar": "Cleanse",
  "filt-necesidad-hidratar": "Hydrate",
  "filt-necesidad-exfoliar": "Exfoliate",
  "filt-necesidad-capilar": "Hair care",
  "filt-necesidad-bano": "Bath",
  "filt-necesidad-mesa": "Table",

  "filt-formato-label": "Size",
  "filt-formato-todos": "All",
  "filt-formato-chico": "Small (50–60 ml/g)",
  "filt-formato-mediano": "Medium (250 ml/g)",
  "filt-formato-grande": "Large (500 ml)",

  "filt-precio-label": "Price",
  "filt-precio-todos": "All",
  "filt-precio-b1": "Up to $15,000",
  "filt-precio-b2": "$15,000 – $20,000",
  "filt-precio-b3": "$20,000 – $30,000",
  "filt-precio-b4": "Over $30,000",

  "filt-piel-label": "Skin type",
  "filt-piel-todos": "All",
  "filt-piel-normal-seca": "Normal to dry",
  "filt-piel-grasa-mixta": "Oily or combination",
  "filt-piel-sensible": "Sensitive",
  "filt-piel-deshidratada": "Dehydrated",
  "filt-piel-madura": "Mature",

  "filt-sort-label": "Sort by",
  "filt-sort-relevancia": "Relevance",
  "filt-sort-precio-asc": "Price: low to high",
  "filt-sort-precio-desc": "Price: high to low",
  "filt-sort-novedades": "New arrivals",

  "filt-reset-btn": "Clear filters",

  "jn-limpiar": "Cleanse",
  "jn-hidratar": "Hydrate",
  "jn-exfoliar": "Exfoliate",
  "jn-capilar": "Hair care",
  "jn-bano": "Bath",
  "jn-mesa": "Table",
  "jn-eco": "Everyday Care",
  "jn-spa": "Spa Line",
  "jn-gourmet": "Gourmet",

  "nec-limpiar-h2": "Cleanse",
  "nec-limpiar-desc": "Washing off the day without wrecking your skin barrier. If your face feels tight after cleansing, the problem isn't too little cream — it's too much cleansing.",
  "nec-limpiar-tip": "Once a day is enough. Cleansing morning and night only makes sense if you wear makeup or sunscreen.",

  "nec-hidratar-h2": "Hydrate",
  "nec-hidratar-desc": "Replacing water and replacing lipids are two different things, and skin needs both. The mist and the hyaluronic acid bring water; the creams bring lipids. The order goes from the most liquid to the thickest.",
  "nec-hidratar-tip": "Always apply to damp skin. The cream doesn't add water — it seals in what's already there.",

  "nec-exfoliar-h2": "Exfoliate",
  "nec-exfoliar-desc": "Renewing the surface so whatever comes next absorbs better. Fine grain for face, neck and décolletage; coarse grain for elbows, knees, heels and back.",
  "nec-exfoliar-tip": "Once or twice a week is enough. Exfoliating every day breaks down the skin barrier and leaves you worse off than before.",

  "nec-capilar-h2": "Hair care",
  "nec-capilar-desc": "Scalp first — the length falls into place on its own. Our base lathers lightly, and that doesn't mean it cleans less: lather is an effect of the detergent, not a measure of how clean you get.",
  "nec-capilar-tip": "With hard water like Mendoza's, two short shampoo rinses work better than one long one.",

  "nec-bano-h2": "Bath ritual",
  "nec-bano-desc": "Twenty minutes of hot water is worth a week of cream. It's the simplest ritual of all, and the one that shows the most — especially in winter and after training or traveling.",
  "nec-bano-tip": "If your skin is very dry, use salts or foam, not both together. And apply the emulsion as you get out, before you're fully dry.",

  "nec-mesa-h2": "The table",
  "nec-mesa-desc": "Where everything starts. The same oil, made the way it always is: single-varietal Arauco, pressed once a year on the Coquimbito grove. Medium fruitiness, a clean bitterness, and a peppery finish that fades quickly.",
  "nec-mesa-tip": "That bitterness in your throat is the polyphenols — the same compound we're after when the oil takes the other path.",

  "lin-eco-h2": "Everyday Care",
  "lin-eco-lead": "The everyday line. Ten products that cover the full cycle: cleansing, exfoliating, hydrating, washing your hair and taking a bath. Formulas built to hold up over time, not for an instant effect.",
  "lin-eco-cmeta1": "10 products",
  "lin-eco-cmeta2": "From $13,500",
  "lin-eco-cmeta3": "Daily use",
  "lin-eco-note": "The texture absorbs more slowly than a synthetic product. That's not a flaw — it's the time skin needs to take in what actually serves it.",

  "lin-spa-h2": "Spa Line",
  "lin-spa-lead": "The two formulas Fernanda Herrera uses in the treatment room, in a small, concentrated format. Same concentration, same bottle — there's no professional version and a separate home one. These are for a targeted treatment, not a daily routine.",
  "lin-spa-cmeta1": "2 products",
  "lin-spa-cmeta2": "From $15,500",
  "lin-spa-cmeta3": "As-needed use",
  "lin-spa-note": "The difference between the treatment room and home isn't in the product. It's in the hand applying it and the time you give it.",

  "lin-gourmet-h2": "Gourmet",
  "lin-gourmet-lead": "Just one product, and it's the origin of all the others. The Vallesi Arauco is single-varietal: only Arauco olives, harvested at their peak and cold-pressed the same day, once a year.",
  "lin-gourmet-cmeta1": "1 product",
  "lin-gourmet-cmeta3": "One pressing a year",
  "lin-gourmet-note": "From the land to the table, from the table to the skin. Here's why that's not just a slogan.",

  "flag-nuevo": "New",
  "flag-anual": "Once a year",

  "p-limpieza-name": "Cleansing emulsion",
  "p-limpieza-nec-desc": "250 ml · Removes makeup without tightness",
  "p-limpieza-lin-desc": "250 ml · Cleanses without tightness",

  "p-barro-name": "Mud mask",
  "p-barro-nec-desc": "50 ml · T-zone, enlarged pores, dull skin",
  "p-barro-lin-desc": "50 ml · T-zone and enlarged pores",

  "p-neblina-name": "Hydrating mist",
  "p-neblina-nec-desc": "60 ml · Step 1 · Dry air, flights",
  "p-neblina-lin-desc": "60 ml · Dry air, flights, mid-afternoon",

  "p-hialuronico-name": "Hyaluronic acid emulsion",
  "p-hialuronico-nec-desc": "60 ml · Step 2 · Dehydration",
  "p-hialuronico-lin-desc": "60 ml · Dehydration, fine lines",

  "p-crema-facial-name": "Face moisturizing cream",
  "p-crema-facial-nec-desc": "50 g · Step 3 · Face, all year",
  "p-crema-facial-lin-desc": "50 g · Normal to dry skin, all year",

  "p-emulsion-corporal-name": "Body moisturizing emulsion",
  "p-emulsion-corporal-nec-desc": "250 ml · Body · Daily use",
  "p-emulsion-corporal-lin-desc": "250 ml · Lighter, made for the body",

  "p-exfoliante-fina-name": "Fine exfoliating cream",
  "p-exfoliante-fina-desc": "50 g · Face, neck and décolletage",

  "p-exfoliante-gruesa-name": "Coarse exfoliating cream",
  "p-exfoliante-gruesa-nec-desc": "50 g · Elbows, knees, heels",
  "p-exfoliante-gruesa-lin-desc": "50 g · Elbows, knees and heels",

  "p-shampoo-name": "Shampoo",
  "p-shampoo-nec-desc": "250 ml · Frequent use, sensitive scalp",
  "p-shampoo-lin-desc": "250 ml · Sensitive scalp",

  "p-acondicionador-name": "Hair conditioner",
  "p-acondicionador-nec-desc": "250 ml · Brittle ends, hard water",
  "p-acondicionador-lin-desc": "250 ml · Detangles without weighing hair down",

  "p-espuma-name": "Bath foam",
  "p-espuma-nec-desc": "250 ml · Short, stable foam",
  "p-espuma-lin-desc": "250 ml · For a soak in the tub",

  "p-sales-name": "Bath salts",
  "p-sales-desc": "250 g · Tired legs, cold weather",

  "p-aceite-name": "Vallesi Arauco Extra Virgin Olive Oil",
  "p-aceite-nec-desc": "500 ml · Raw: bread, tomato, fish",
  "p-aceite-lin-desc": "500 ml · Single-varietal, cold-pressed",

  "add-to-cart-btn": "Add"
};
