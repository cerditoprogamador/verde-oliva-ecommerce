const express = require('express');
const pool = require('../lib/db');

const router = express.Router();

// Sin auth: son datos publicos (precio/nombre/stock/foto), los mismos que
// ya se ven a simple vista en catalogo.html. Los consume sitio/js/products.js
// para que el precio/stock/foto que edita el admin se refleje en la tienda
// sin tener que editar HTML a mano.

const PUBLIC_FIELDS = 'sku, name, linea, formato, price_cents, stock_qty, image_path';

// El detalle de un producto (ficha) ademas expone el contenido educativo
// editable desde el admin (brand/07) — la ficha estatica de los 17 SKU
// originales lo usa como override opcional; producto-generic.html (SKU
// creados 100% desde el admin, sin .html propio) lo usa como todo el
// contenido de la pagina.
const FICHA_FIELDS_BASE = [
  'ficha_lead', 'para_que_sirve', 'para_que_piel', 'cuando_usar',
  'como_usar', 'que_esperar', 'origen', 'ingredientes_inci', 'seguridad',
];
const FICHA_FIELDS = FICHA_FIELDS_BASE.concat(FICHA_FIELDS_BASE.map((f) => `${f}_en`));
const DETAIL_FIELDS = `${PUBLIC_FIELDS}, ${FICHA_FIELDS.join(', ')}, combina_con, gallery_images`;

router.get('/products', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT ${PUBLIC_FIELDS} FROM products WHERE active = 1 ORDER BY name ASC`
    );
    return res.json({ products: rows });
  } catch (err) {
    console.error('[products-public] db error:', err.message);
    return res.status(500).json({ error: 'server_error' });
  }
});

router.get('/products/:sku', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT ${DETAIL_FIELDS} FROM products WHERE sku = ? AND active = 1`,
      [req.params.sku]
    );
    if (!rows[0]) return res.status(404).json({ error: 'not_found' });
    const product = rows[0];
    // combina_con / gallery_images se guardan como JSON string en la
    // base — devolverlos ya parseados para que el cliente no tenga que hacerlo.
    product.combina_con = product.combina_con ? JSON.parse(product.combina_con) : [];
    product.gallery_images = product.gallery_images ? JSON.parse(product.gallery_images) : [];
    return res.json({ product });
  } catch (err) {
    console.error('[products-public/:sku] db error:', err.message);
    return res.status(500).json({ error: 'server_error' });
  }
});

module.exports = router;
