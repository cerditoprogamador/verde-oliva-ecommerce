/**
 * Prueba rapida del mail de confirmacion sin pasar por todo el flujo de
 * Mercado Pago: toma productos reales de la base (para que la venta
 * cruzada de verdad se calcule, no una lista inventada), arma un pedido de
 * ejemplo con la plantilla real y lo manda a la direccion que le pases.
 * Util para validar SMTP_* en .env antes de probar un checkout real.
 *
 * Uso:
 *   node scripts/test-email.js tu-email@gmail.com [sku1] [sku2]
 *   (sin skus, usa los primeros 2 productos activos que encuentre)
 */
require('dotenv').config();
const pool = require('../lib/db');
const { sendMail } = require('../lib/mailer');
const { getCrossSellProducts } = require('../lib/crossSell');
const { renderOrderConfirmationEmail } = require('../lib/emailTemplates/orderConfirmation');

async function main() {
  const to = process.argv[2];
  if (!to) {
    console.error('[test-email] Uso: node scripts/test-email.js tu-email@gmail.com [sku1] [sku2]');
    process.exit(1);
  }
  const skusArg = process.argv.slice(3);

  let products;
  if (skusArg.length > 0) {
    const placeholders = skusArg.map(() => '?').join(',');
    [products] = await pool.query(
      `SELECT sku, name, price_cents FROM products WHERE sku IN (${placeholders}) AND active = 1`,
      skusArg
    );
  } else {
    [products] = await pool.query(
      'SELECT sku, name, price_cents FROM products WHERE active = 1 ORDER BY sku LIMIT 2'
    );
  }

  if (products.length === 0) {
    console.error('[test-email] no encontre productos activos en la base (revisa el/los sku pasado(s), o que products tenga filas)');
    process.exit(1);
  }

  const items = products.map((p) => ({
    sku: p.sku,
    name: p.name,
    qty: 1,
    unit_price_cents: p.price_cents,
    line_total_cents: p.price_cents,
  }));
  const subtotalCents = items.reduce((n, i) => n + i.line_total_cents, 0);

  const crossSell = await getCrossSellProducts(items.map((i) => i.sku));
  console.log(`[test-email] items: ${items.map((i) => i.sku).join(', ')}`);
  console.log(`[test-email] venta cruzada encontrada: ${crossSell.map((p) => p.sku).join(', ') || '(ninguna)'}`);

  const baseUrl = process.env.PUBLIC_BASE_URL || `http://localhost:${process.env.PORT || 3000}`;

  const { subject, html } = renderOrderConfirmationEmail({
    order: { id: 999, subtotal_cents: subtotalCents, created_at: new Date() },
    items,
    customerName: 'Prueba',
    crossSell,
    baseUrl,
  });

  const ok = await sendMail({ to, subject, html });
  if (!ok) {
    console.error('[test-email] no se pudo enviar — revisa SMTP_HOST/SMTP_USER/SMTP_PASS en .env y los logs de arriba');
    process.exit(1);
  }
  console.log(`[test-email] mail de prueba enviado a ${to}`);
  process.exit(0);
}

main().catch((err) => {
  console.error('[test-email] error:', err.message);
  process.exit(1);
});
