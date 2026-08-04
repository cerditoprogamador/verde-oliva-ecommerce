const express = require('express');
const { MercadoPagoConfig, Preference } = require('mercadopago');
const pool = require('../lib/db');
const { requireAuth } = require('../lib/requireAuth');
const { requireXhrHeader } = require('../lib/csrf');
const { priceItems } = require('../products');

const router = express.Router();

// requireXhrHeader atado a esta ruta puntual, no con router.use(): varios
// routers de este backend se montan todos bajo '/api' en server.js, y un
// router.use() sin path interceptaria tambien requests de otros routers
// montados en ese mismo prefijo (ver el comentario equivalente en
// routes/auth.js).

/**
 * POST /api/checkout
 * Requiere sesion (401 si no). body: { items: [{sku, qty}] }.
 * Nunca se confia en un precio que venga en el body (ni siquiera se lee
 * un eventual `price` en cada item) — todo se re-cotiza contra
 * api/products.js, que sale de brand/05-catalogo.md.
 */
router.post('/checkout', requireXhrHeader, requireAuth, async (req, res) => {
  const items = (req.body && req.body.items) || [];

  let priced;
  try {
    priced = await priceItems(items);
  } catch (err) {
    return res.status(err.status || 400).json({ error: err.message });
  }

  const mpAccessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!mpAccessToken) {
    console.error('[checkout] falta MERCADOPAGO_ACCESS_TOKEN');
    return res.status(500).json({ error: 'payment_provider_not_configured' });
  }

  let conn;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();

    const [orderResult] = await conn.execute(
      `INSERT INTO orders (user_id, status, currency, subtotal_cents)
       VALUES (?, 'pending', 'ARS', ?)`,
      [req.session.userId, priced.subtotalCents]
    );
    const orderId = orderResult.insertId;

    for (const item of priced.items) {
      await conn.execute(
        `INSERT INTO order_items (order_id, sku, name, unit_price_cents, qty, line_total_cents)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [orderId, item.sku, item.name, item.unitPriceCents, item.qty, item.lineTotalCents]
      );
    }

    await conn.commit();

    // Crear la preference de Mercado Pago (Checkout Pro) recien despues
    // de que la orden quedo persistida — si esto falla, la orden queda
    // 'pending' sin preference y se puede reintentar / limpiar a mano.
    const mpClient = new MercadoPagoConfig({ accessToken: mpAccessToken });
    const preferenceClient = new Preference(mpClient);

    const baseUrl = process.env.PUBLIC_BASE_URL || `${req.protocol}://${req.get('host')}`;

    const preference = await preferenceClient.create({
      body: {
        items: priced.items.map((item) => ({
          id: item.sku,
          title: item.name,
          quantity: item.qty,
          unit_price: item.unitPriceCents / 100,
          currency_id: 'ARS',
        })),
        external_reference: String(orderId),
        back_urls: {
          success: `${baseUrl}/checkout-exito.html`,
          failure: `${baseUrl}/checkout-error.html`,
          pending: `${baseUrl}/checkout-pendiente.html`,
        },
        auto_return: 'approved',
        notification_url: `${baseUrl}/api/webhooks/mercadopago`,
      },
    });

    await pool.execute('UPDATE orders SET mp_preference_id = ? WHERE id = ?', [
      preference.id,
      orderId,
    ]);

    return res.json({ init_point: preference.init_point });
  } catch (err) {
    if (conn) {
      try {
        await conn.rollback();
      } catch (rollbackErr) {
        console.error('[checkout] rollback failed:', rollbackErr.message);
      }
    }
    console.error('[checkout] error:', err.message);
    return res.status(500).json({ error: 'checkout_failed' });
  } finally {
    if (conn) conn.release();
  }
});

module.exports = router;
