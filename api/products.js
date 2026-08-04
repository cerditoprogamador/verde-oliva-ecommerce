/**
 * Re-cotizacion del lado del servidor — la unica fuente de verdad para
 * /api/checkout. Nunca confiar en un precio que mande el cliente.
 *
 * Los datos viven en la tabla `products` (ver schema.sql), editable desde
 * el panel de administrador (api/routes/admin-products.js). Originalmente
 * este archivo tenia los 17 SKU hardcodeados en un objeto en memoria
 * (sourced de brand/05-catalogo.md) — esa data se transcribio una sola
 * vez a la base via scripts/seed-products.js y de aca en adelante la base
 * es la fuente de verdad, no este archivo.
 */

const pool = require('./lib/db');

/**
 * Re-cotiza una lista de {sku, qty} contra el catalogo de la base.
 * Ignora cualquier `price`/`name` que venga en el item del cliente.
 * Lanza un Error con `.status` si algun sku no existe/esta inactivo o la
 * cantidad es invalida — mismo contrato de errores que la version anterior
 * en memoria, para que checkout.js no tenga que cambiar su manejo de errores.
 */
async function priceItems(items) {
  if (!Array.isArray(items) || items.length === 0) {
    const err = new Error('items debe ser un array no vacio de {sku, qty}');
    err.status = 400;
    throw err;
  }

  const parsed = items.map((raw) => {
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
    return { sku, qty };
  });

  const skus = parsed.map((i) => i.sku);
  const placeholders = skus.map(() => '?').join(',');
  const [rows] = await pool.query(
    `SELECT sku, name, price_cents FROM products WHERE sku IN (${placeholders}) AND active = 1`,
    skus
  );
  const bySku = Object.fromEntries(rows.map((r) => [r.sku, r]));

  const priced = parsed.map(({ sku, qty }) => {
    const product = bySku[sku];
    if (!product) {
      const err = new Error(`SKU desconocido: ${sku}`);
      err.status = 400;
      throw err;
    }
    return {
      sku,
      name: product.name,
      qty,
      unitPriceCents: product.price_cents,
      lineTotalCents: product.price_cents * qty,
    };
  });

  const subtotalCents = priced.reduce((n, i) => n + i.lineTotalCents, 0);
  return { items: priced, subtotalCents };
}

module.exports = { priceItems };
