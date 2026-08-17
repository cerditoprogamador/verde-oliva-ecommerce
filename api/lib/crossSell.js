/**
 * Venta cruzada para el mail de confirmacion de compra: reusa `combina_con`
 * (JSON [{sku, why, why_en}], hasta 3, curado a mano por el admin — mismo
 * campo que ya usa la ficha de producto, ver api/routes/products-public.js)
 * en vez de inventar un algoritmo de recomendacion nuevo.
 */
const pool = require('./db');

/**
 * getCrossSellProducts(purchasedSkus, limit=3)
 * 1) Junta los sku referenciados en combina_con de lo comprado (con su
 *    texto `why`, ya brand-safe porque es el mismo copy de la ficha).
 * 2) Si faltan para llegar a `limit`, completa con otros productos activos
 *    de la misma linea que lo comprado (created_at DESC — nunca "mas
 *    vendido", ver brand/03-identidad-verbal.md).
 * Excluye siempre lo ya comprado y no repite sku.
 */
async function getCrossSellProducts(purchasedSkus, limit = 3) {
  if (!Array.isArray(purchasedSkus) || purchasedSkus.length === 0) return [];

  const purchasedPlaceholders = purchasedSkus.map(() => '?').join(',');
  const [purchased] = await pool.query(
    `SELECT sku, linea, combina_con FROM products WHERE sku IN (${purchasedPlaceholders})`,
    purchasedSkus
  );

  const purchasedSet = new Set(purchasedSkus);
  const whyBySku = new Map();
  for (const row of purchased) {
    if (!row.combina_con) continue;
    let entries;
    try {
      entries = JSON.parse(row.combina_con);
    } catch (err) {
      continue;
    }
    for (const entry of entries || []) {
      if (!entry || !entry.sku || purchasedSet.has(entry.sku) || whyBySku.has(entry.sku)) continue;
      whyBySku.set(entry.sku, entry.why || '');
    }
  }

  const result = [];
  const seen = new Set();

  if (whyBySku.size > 0) {
    const candidateSkus = [...whyBySku.keys()];
    const placeholders = candidateSkus.map(() => '?').join(',');
    const [rows] = await pool.query(
      `SELECT sku, name, price_cents, image_path FROM products
        WHERE sku IN (${placeholders}) AND active = 1`,
      candidateSkus
    );
    for (const row of rows) {
      if (result.length >= limit) break;
      result.push({ ...row, why: whyBySku.get(row.sku) });
      seen.add(row.sku);
    }
  }

  if (result.length < limit) {
    const lineas = [...new Set(purchased.map((p) => p.linea).filter(Boolean))];
    if (lineas.length > 0) {
      const excludeSkus = [...purchasedSet, ...seen];
      const lineaPlaceholders = lineas.map(() => '?').join(',');
      const excludePlaceholders = excludeSkus.map(() => '?').join(',');
      const [rows] = await pool.query(
        `SELECT sku, name, price_cents, image_path FROM products
          WHERE active = 1 AND linea IN (${lineaPlaceholders})
            ${excludeSkus.length ? `AND sku NOT IN (${excludePlaceholders})` : ''}
          ORDER BY created_at DESC
          LIMIT ?`,
        [...lineas, ...excludeSkus, limit - result.length]
      );
      for (const row of rows) {
        result.push({ ...row, why: '' });
      }
    }
  }

  return result.slice(0, limit);
}

module.exports = { getCrossSellProducts };
