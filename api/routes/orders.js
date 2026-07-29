const express = require('express');
const pool = require('../lib/db');
const { requireAuth } = require('../lib/requireAuth');

const router = express.Router();

/**
 * GET /api/orders — historial de compras del usuario logueado. Simple,
 * sin paginacion (no hace falta todavia).
 */
router.get('/orders', requireAuth, async (req, res) => {
  try {
    const [orders] = await pool.execute(
      `SELECT id, status, subtotal_cents, currency, created_at
         FROM orders
        WHERE user_id = ?
        ORDER BY created_at DESC`,
      [req.session.userId]
    );

    if (orders.length === 0) {
      return res.json({ orders: [] });
    }

    const orderIds = orders.map((o) => o.id);
    const placeholders = orderIds.map(() => '?').join(',');
    const [items] = await pool.query(
      `SELECT order_id, sku, name, unit_price_cents, qty, line_total_cents
         FROM order_items
        WHERE order_id IN (${placeholders})`,
      orderIds
    );

    const itemsByOrder = items.reduce((acc, item) => {
      (acc[item.order_id] = acc[item.order_id] || []).push({
        sku: item.sku,
        name: item.name,
        unit_price_cents: item.unit_price_cents,
        qty: item.qty,
        line_total_cents: item.line_total_cents,
      });
      return acc;
    }, {});

    const result = orders.map((o) => ({
      id: o.id,
      status: o.status,
      subtotal_cents: o.subtotal_cents,
      currency: o.currency,
      created_at: o.created_at,
      items: itemsByOrder[o.id] || [],
    }));

    return res.json({ orders: result });
  } catch (err) {
    console.error('[orders] db error:', err.message);
    return res.status(500).json({ error: 'server_error' });
  }
});

module.exports = router;
