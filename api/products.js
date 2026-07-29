/**
 * Catalogo de precios del lado del servidor — la unica fuente de verdad para
 * re-cotizar un carrito en /api/checkout. Nunca confiar en un precio que
 * mande el cliente.
 *
 * Sourced from brand/05-catalogo.md (tabla maestra, seccion "Resumen" y las
 * 17 fichas). Los 17 SKU, nombres y precios en pesos argentinos son los del
 * catalogo real de la finca — no estan inventados ni ajustados aca.
 *
 * `sku` es el mismo slug que ya usa el frontend (sitio/js/cart.js `resolve()`):
 * el nombre de archivo de imagen en img/productos/<slug>.jpg cuando existe
 * una foto, o un slugify equivalente del nombre del producto para los 4 SKU
 * que todavia no tienen foto (ver CLAUDE.md: "solo 13 de 17 SKU tienen foto").
 *
 * priceCents = precio en pesos * 100 (ARS no tiene sub-unidad practica hoy,
 * pero se guarda en centavos para que `orders`/`order_items` -- que son
 * *_cents en el schema -- nunca pierdan precision si el dia de mañana se
 * vende en otra moneda).
 */

const PRODUCTS = {
  // Eco Cosmetica — Everyday Care
  'aceite-corporal': {
    name: 'Aceite corporal',
    linea: 'Eco Cosmética',
    formato: '250 ml',
    priceCents: 1850000,
  },
  'acondicionador-capilar': {
    name: 'Acondicionador capilar',
    linea: 'Eco Cosmética',
    formato: '250 ml',
    priceCents: 1350000,
  },
  'crema-humectante-facial': {
    name: 'Crema humectante facial',
    linea: 'Eco Cosmética',
    formato: '50 gr',
    priceCents: 1800000,
  },
  'crema-exfoliante-fina': {
    name: 'Crema exfoliante fina',
    linea: 'Eco Cosmética',
    formato: '50 gr',
    priceCents: 1550000,
  },
  'crema-exfoliante-gruesa': {
    name: 'Crema exfoliante gruesa',
    linea: 'Eco Cosmética',
    formato: '50 gr',
    priceCents: 1550000,
  },
  'emulsion-de-limpieza': {
    name: 'Emulsión de limpieza',
    linea: 'Eco Cosmética',
    formato: '250 ml',
    priceCents: 1900000,
  },
  'emulsion-humectante-corporal': {
    name: 'Emulsión humectante corporal',
    linea: 'Eco Cosmética',
    formato: '250 ml',
    priceCents: 1900000,
  },
  'espuma-de-bano': {
    name: 'Espuma de baño',
    linea: 'Eco Cosmética',
    formato: '250 ml',
    priceCents: 1900000,
  },
  'locion-hidratante': {
    name: 'Loción hidratante',
    linea: 'Eco Cosmética',
    formato: '250 ml',
    priceCents: 1570000,
  },
  'mascara-de-barro': {
    name: 'Máscara de barro',
    linea: 'Eco Cosmética',
    formato: '50 ml',
    priceCents: 1550000,
  },
  'sales-de-bano': {
    name: 'Sales de baño',
    linea: 'Eco Cosmética',
    formato: '250 gr',
    priceCents: 1570000,
  },
  'shampoo': {
    name: 'Shampoo',
    linea: 'Eco Cosmética',
    formato: '250 ml',
    priceCents: 1400000,
  },

  // Línea Spa de Olivoterapia
  'aceite-miorrelajante': {
    name: 'Aceite miorrelajante',
    linea: 'Línea Spa de Olivoterapia',
    formato: '300 ml',
    priceCents: 2450000,
  },
  'aceite-drenaje-linfatico': {
    name: 'Aceite drenaje linfático',
    linea: 'Línea Spa de Olivoterapia',
    formato: '300 ml',
    priceCents: 2650000,
  },
  'emulsion-acido-hialuronico': {
    name: 'Emulsión ácido hialurónico',
    linea: 'Línea Spa de Olivoterapia',
    formato: '60 ml',
    priceCents: 2300000,
  },
  'neblina-hidratante': {
    name: 'Neblina hidratante',
    linea: 'Línea Spa de Olivoterapia',
    formato: '60 ml',
    priceCents: 1550000,
  },

  // Vallesi Arauco
  'aceite-oliva-vallesi': {
    name: 'Aceite de Oliva Extra Virgen Vallesi Arauco',
    linea: 'Vallesi Arauco',
    formato: '500 ml',
    priceCents: 3900000,
  },
};

/**
 * Re-cotiza una lista de {sku, qty} contra el catalogo del servidor.
 * Ignora cualquier `price`/`name` que venga en el item del cliente.
 * Lanza un Error con `.status` si algun sku no existe o la cantidad es invalida.
 */
function priceItems(items) {
  if (!Array.isArray(items) || items.length === 0) {
    const err = new Error('items debe ser un array no vacio de {sku, qty}');
    err.status = 400;
    throw err;
  }

  const priced = items.map((raw) => {
    const sku = raw && raw.sku;
    const qty = Number(raw && raw.qty);

    if (!sku || typeof sku !== 'string') {
      const err = new Error('Cada item necesita un sku valido');
      err.status = 400;
      throw err;
    }
    if (!Number.isInteger(qty) || qty <= 0) {
      const err = new Error(`Cantidad invalida para ${sku}`);
      err.status = 400;
      throw err;
    }
    const product = PRODUCTS[sku];
    if (!product) {
      const err = new Error(`SKU desconocido: ${sku}`);
      err.status = 400;
      throw err;
    }

    return {
      sku,
      name: product.name,
      qty,
      unitPriceCents: product.priceCents,
      lineTotalCents: product.priceCents * qty,
    };
  });

  const subtotalCents = priced.reduce((n, i) => n + i.lineTotalCents, 0);
  return { items: priced, subtotalCents };
}

module.exports = { PRODUCTS, priceItems };
