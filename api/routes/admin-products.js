const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const pool = require('../lib/db');
const { requireXhrHeader } = require('../lib/csrf');
const { requireAdmin } = require('../lib/requireAdmin');

const router = express.Router();

const SKU_RE = /^[a-z0-9-]+$/;
const EXT_BY_MIME = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };
const IMG_DIR = path.join(__dirname, '..', '..', 'sitio', 'img', 'productos');
fs.mkdirSync(IMG_DIR, { recursive: true });

// Slot -> sufijo de archivo. `image` es la foto principal: mantiene el
// nombre <sku>.<ext> sin sufijo, sin cambios, porque las 17 fichas curadas
// ya tienen ese path hardcodeado en varios lugares (galeria, combina-con
// de otras fichas, etc). Los 3 slots adicionales son la galeria nueva.
const GALLERY_FIELDS = ['image', 'image_2', 'image_3', 'image_4'];
const SLOT_SUFFIX = { image: '', image_2: '-2', image_3: '-3', image_4: '-4' };

// El nombre de archivo final se deriva 100% del sku (ya validado contra
// SKU_RE) y del mimetype detectado — nunca del nombre original que manda
// el navegador, asi que no hay superficie de path traversal por mas que
// el cliente mande cualquier cosa como filename.
const upload = multer({
  storage: multer.diskStorage({
    destination: IMG_DIR,
    filename(req, file, cb) {
      const sku = ((req.body && req.body.sku) || req.params.sku || '').trim();
      if (!SKU_RE.test(sku)) return cb(new Error('sku_invalido'));
      const ext = EXT_BY_MIME[file.mimetype];
      if (!ext) return cb(new Error('tipo_de_archivo_no_soportado'));
      const suffix = SLOT_SUFFIX[file.fieldname] || '';
      cb(null, `${sku}${suffix}.${ext}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter(req, file, cb) {
    cb(null, !!EXT_BY_MIME[file.mimetype]);
  },
}).fields(GALLERY_FIELDS.map((name) => ({ name, maxCount: 1 })));

function toBool(v) {
  return v === true || v === 'true' || v === '1' || v === 1;
}

// Campos de contenido de ficha (brand/07), cada uno con su version en
// ingles opcional (ver comentario en schema.sql: vacio = fallback a
// espanol, nunca traduccion literal automatica). NULL en un SKU de los 17
// originales = "sin override"; para un producto creado 100% desde el
// admin, esto es todo el contenido que renderiza producto-generic.html.
const FICHA_FIELDS_BASE = [
  'ficha_lead', 'para_que_sirve', 'para_que_piel', 'cuando_usar',
  'como_usar', 'que_esperar', 'origen', 'ingredientes_inci', 'seguridad',
];
const FICHA_FIELDS = FICHA_FIELDS_BASE.concat(FICHA_FIELDS_BASE.map((f) => `${f}_en`));

/** combina_con llega como JSON string ([{sku,why,why_en}], hasta 3) desde
 * el form del admin (FormData solo manda strings). Devuelve null si no
 * vino o esta vacio, o un array validado/acotado a 3 items. Lanza si el
 * JSON es invalido o tiene una forma inesperada. */
function parseCombinaCon(raw) {
  if (!raw) return null;
  let arr;
  try {
    arr = JSON.parse(raw);
  } catch (e) {
    const err = new Error('combina_con_invalido');
    err.status = 400;
    throw err;
  }
  if (!Array.isArray(arr)) {
    const err = new Error('combina_con_invalido');
    err.status = 400;
    throw err;
  }
  const clean = arr
    .filter((it) => it && typeof it.sku === 'string' && it.sku.trim())
    .slice(0, 3)
    .map((it) => ({
      sku: it.sku.trim(),
      why: (it.why || '').trim(),
      why_en: (it.why_en || '').trim(),
    }));
  return clean.length ? JSON.stringify(clean) : null;
}

function fichaValuesFromBody(body) {
  return FICHA_FIELDS.map((f) => (body[f] || '').trim() || null);
}

/** Arma el array gallery_images (paths de los slots image_2/3/4, en ese
 * orden, salteando los que no tengan foto) a partir de lo subido en esta
 * request y de lo que ya existia (para no perder una foto de un slot que
 * no se toco). `existing` es el array ya guardado (o [] si no habia). */
function buildGalleryImages(sku, files, body, existing) {
  const bySlot = { image_2: existing[0] || null, image_3: existing[1] || null, image_4: existing[2] || null };
  ['image_2', 'image_3', 'image_4'].forEach((field, i) => {
    const removeFlag = body && toBool(body[`remove_${field}`]);
    if (files && files[field] && files[field][0]) {
      bySlot[field] = `img/productos/${files[field][0].filename}`;
    } else if (removeFlag) {
      bySlot[field] = null;
    }
  });
  const arr = [bySlot.image_2, bySlot.image_3, bySlot.image_4].filter(Boolean);
  return arr.length ? JSON.stringify(arr) : null;
}

/**
 * GET /api/admin/products — lista completa (incl. inactivos), para la
 * tabla del panel.
 */
router.get('/admin/products', requireAdmin, async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM products ORDER BY name ASC');
    return res.json({ products: rows });
  } catch (err) {
    console.error('[admin/products] db error:', err.message);
    return res.status(500).json({ error: 'server_error' });
  }
});

router.get('/admin/products/:sku', requireAdmin, async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM products WHERE sku = ?', [req.params.sku]);
    if (!rows[0]) return res.status(404).json({ error: 'not_found' });
    const product = rows[0];
    product.combina_con = product.combina_con ? JSON.parse(product.combina_con) : [];
    product.gallery_images = product.gallery_images ? JSON.parse(product.gallery_images) : [];
    return res.json({ product });
  } catch (err) {
    console.error('[admin/products/:sku] db error:', err.message);
    return res.status(500).json({ error: 'server_error' });
  }
});

/**
 * POST /api/admin/products — crea un producto nuevo. multipart/form-data,
 * campos de archivo `image` (principal) + `image_2`/`image_3`/`image_4`
 * (galeria adicional, opcionales).
 */
router.post('/admin/products', requireXhrHeader, requireAdmin, upload, async (req, res) => {
  const { sku, name, linea, formato, description } = req.body || {};
  const priceCents = parseInt(req.body && req.body.price_cents, 10);
  const stockQty = parseInt(req.body && req.body.stock_qty, 10) || 0;
  const active = toBool(req.body && req.body.active);

  if (!sku || !SKU_RE.test(sku)) {
    return res.status(400).json({ error: 'sku_invalido' });
  }
  if (!name || !Number.isInteger(priceCents) || priceCents <= 0) {
    return res.status(400).json({ error: 'datos_invalidos' });
  }

  const mainFile = req.files && req.files.image && req.files.image[0];
  const imagePath = mainFile ? `img/productos/${mainFile.filename}` : null;
  const galleryImages = buildGalleryImages(sku, req.files, req.body, []);

  let combinaCon;
  try {
    combinaCon = parseCombinaCon(req.body && req.body.combina_con);
  } catch (err) {
    return res.status(err.status || 400).json({ error: err.message });
  }
  const fichaValues = fichaValuesFromBody(req.body || {});

  try {
    await pool.execute(
      `INSERT INTO products (sku, name, linea, formato, price_cents, stock_qty, active, image_path, description,
         ${FICHA_FIELDS.join(', ')}, combina_con, gallery_images)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ${FICHA_FIELDS.map(() => '?').join(', ')}, ?, ?)`,
      [sku, name, linea || null, formato || null, priceCents, stockQty, active ? 1 : 0, imagePath, description || null,
        ...fichaValues, combinaCon, galleryImages]
    );
    return res.status(201).json({ ok: true, sku });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'sku_ya_existe' });
    }
    console.error('[admin/products] create db error:', err.message);
    return res.status(500).json({ error: 'server_error' });
  }
});

/**
 * PUT /api/admin/products/:sku — edita un producto existente. Cada slot
 * de imagen (principal + 3 de galeria) es independiente: si no se manda
 * un archivo nuevo (ni remove_image_N) para un slot, se conserva la foto
 * que ya tenia.
 */
router.put('/admin/products/:sku', requireXhrHeader, requireAdmin, upload, async (req, res) => {
  const { sku } = req.params;
  const { name, linea, formato, description } = req.body || {};
  const priceCents = parseInt(req.body && req.body.price_cents, 10);
  const stockQty = parseInt(req.body && req.body.stock_qty, 10);
  const active = toBool(req.body && req.body.active);

  if (!name || !Number.isInteger(priceCents) || priceCents <= 0 || !Number.isInteger(stockQty) || stockQty < 0) {
    return res.status(400).json({ error: 'datos_invalidos' });
  }

  let combinaCon;
  try {
    combinaCon = parseCombinaCon(req.body && req.body.combina_con);
  } catch (err) {
    return res.status(err.status || 400).json({ error: err.message });
  }
  const fichaValues = fichaValuesFromBody(req.body || {});

  try {
    const [existingRows] = await pool.execute(
      'SELECT image_path, gallery_images FROM products WHERE sku = ?',
      [sku]
    );
    if (!existingRows[0]) return res.status(404).json({ error: 'not_found' });
    const existingGallery = existingRows[0].gallery_images ? JSON.parse(existingRows[0].gallery_images) : [];
    const galleryImages = buildGalleryImages(sku, req.files, req.body, existingGallery);

    const fields = [name, linea || null, formato || null, priceCents, stockQty, active ? 1 : 0, description || null,
      ...fichaValues, combinaCon, galleryImages];
    let sql = `UPDATE products SET name=?, linea=?, formato=?, price_cents=?, stock_qty=?, active=?, description=?,
      ${FICHA_FIELDS.map((f) => `${f}=?`).join(', ')}, combina_con=?, gallery_images=?`;

    const mainFile = req.files && req.files.image && req.files.image[0];
    if (mainFile) {
      sql += ', image_path=?';
      fields.push(`img/productos/${mainFile.filename}`);
    }
    sql += ' WHERE sku=?';
    fields.push(sku);

    const [result] = await pool.execute(sql, fields);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'not_found' });
    return res.json({ ok: true });
  } catch (err) {
    console.error('[admin/products/:sku] update db error:', err.message);
    return res.status(500).json({ error: 'server_error' });
  }
});

/**
 * DELETE /api/admin/products/:sku — borra la fila (seguro: order_items
 * guarda su propio snapshot de sku/name/precio, no una FK viva). La UI del
 * panel deberia ofrecer "desactivar" (PUT con active=false) como accion
 * primaria y dejar este delete duro como accion secundaria confirmada.
 */
router.delete('/admin/products/:sku', requireXhrHeader, requireAdmin, async (req, res) => {
  try {
    const [result] = await pool.execute('DELETE FROM products WHERE sku = ?', [req.params.sku]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'not_found' });
    return res.json({ ok: true });
  } catch (err) {
    console.error('[admin/products/:sku] delete db error:', err.message);
    return res.status(500).json({ error: 'server_error' });
  }
});

module.exports = router;
