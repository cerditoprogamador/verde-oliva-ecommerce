/**
 * Seed uno-shot de la tabla `products` con los 17 SKU del catalogo real
 * (transcritos aca tal cual estaban en el viejo objeto PRODUCTS de
 * api/products.js, que ahora pasa a leer de esta tabla en vez de tener
 * los datos en memoria — ver api/products.js y brand/05-catalogo.md).
 *
 * Idempotente: usa INSERT ... ON DUPLICATE KEY UPDATE, asi que se puede
 * re-correr sin duplicar filas ni pisar stock_qty/active que el admin ya
 * haya modificado a mano (ver el UPDATE de abajo: no toca esas columnas
 * si la fila ya existe).
 *
 * Uso:
 *   node scripts/seed-products.js
 */
const fs = require('fs');
const path = require('path');
const pool = require('../lib/db');

const CATALOG = [
  { sku: 'aceite-corporal', name: 'Aceite corporal', linea: 'Eco Cosmética', formato: '250 ml', priceCents: 1850000 },
  { sku: 'acondicionador-capilar', name: 'Acondicionador capilar', linea: 'Eco Cosmética', formato: '250 ml', priceCents: 1350000 },
  { sku: 'crema-humectante-facial', name: 'Crema humectante facial', linea: 'Eco Cosmética', formato: '50 gr', priceCents: 1800000 },
  { sku: 'crema-exfoliante-fina', name: 'Crema exfoliante fina', linea: 'Eco Cosmética', formato: '50 gr', priceCents: 1550000 },
  { sku: 'crema-exfoliante-gruesa', name: 'Crema exfoliante gruesa', linea: 'Eco Cosmética', formato: '50 gr', priceCents: 1550000 },
  { sku: 'emulsion-de-limpieza', name: 'Emulsión de limpieza', linea: 'Eco Cosmética', formato: '250 ml', priceCents: 1900000 },
  { sku: 'emulsion-humectante-corporal', name: 'Emulsión humectante corporal', linea: 'Eco Cosmética', formato: '250 ml', priceCents: 1900000 },
  { sku: 'espuma-de-bano', name: 'Espuma de baño', linea: 'Eco Cosmética', formato: '250 ml', priceCents: 1900000 },
  { sku: 'locion-hidratante', name: 'Loción hidratante', linea: 'Eco Cosmética', formato: '250 ml', priceCents: 1570000 },
  { sku: 'mascara-de-barro', name: 'Máscara de barro', linea: 'Eco Cosmética', formato: '50 ml', priceCents: 1550000 },
  { sku: 'sales-de-bano', name: 'Sales de baño', linea: 'Eco Cosmética', formato: '250 gr', priceCents: 1570000 },
  { sku: 'shampoo', name: 'Shampoo', linea: 'Eco Cosmética', formato: '250 ml', priceCents: 1400000 },
  { sku: 'aceite-miorrelajante', name: 'Aceite miorrelajante', linea: 'Línea Spa de Olivoterapia', formato: '300 ml', priceCents: 2450000 },
  { sku: 'aceite-drenaje-linfatico', name: 'Aceite drenaje linfático', linea: 'Línea Spa de Olivoterapia', formato: '300 ml', priceCents: 2650000 },
  { sku: 'emulsion-acido-hialuronico', name: 'Emulsión ácido hialurónico', linea: 'Línea Spa de Olivoterapia', formato: '60 ml', priceCents: 2300000 },
  { sku: 'neblina-hidratante', name: 'Neblina hidratante', linea: 'Línea Spa de Olivoterapia', formato: '60 ml', priceCents: 1550000 },
  { sku: 'aceite-oliva-vallesi', name: 'Aceite de Oliva Extra Virgen Vallesi Arauco', linea: 'Vallesi Arauco', formato: '500 ml', priceCents: 3900000 },
];

const IMG_DIR = path.join(__dirname, '..', '..', 'sitio', 'img', 'productos');
const IMG_EXTS = ['jpg', 'png', 'webp'];

function findImagePath(sku) {
  for (const ext of IMG_EXTS) {
    if (fs.existsSync(path.join(IMG_DIR, `${sku}.${ext}`))) {
      return `img/productos/${sku}.${ext}`;
    }
  }
  return null;
}

async function main() {
  for (const p of CATALOG) {
    const imagePath = findImagePath(p.sku);
    await pool.execute(
      `INSERT INTO products (sku, name, linea, formato, price_cents, stock_qty, active, image_path)
       VALUES (?, ?, ?, ?, ?, 100, 1, ?)
       ON DUPLICATE KEY UPDATE name = VALUES(name), linea = VALUES(linea),
         formato = VALUES(formato), price_cents = VALUES(price_cents),
         image_path = COALESCE(products.image_path, VALUES(image_path))`,
      [p.sku, p.name, p.linea, p.formato, p.priceCents, imagePath]
    );
    console.log(`[seed-products] ${p.sku} ok${imagePath ? '' : ' (sin foto)'}`);
  }
  console.log(`[seed-products] listo: ${CATALOG.length} productos.`);
  process.exit(0);
}

main().catch((err) => {
  console.error('[seed-products] error:', err);
  process.exit(1);
});
