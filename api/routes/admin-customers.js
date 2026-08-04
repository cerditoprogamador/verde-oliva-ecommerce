const express = require('express');
const pool = require('../lib/db');
const { requireAdmin } = require('../lib/requireAdmin');

const router = express.Router();

/**
 * GET /api/admin/customers — usuarios registrados (login Google) con
 * cantidad de pedidos y total gastado (solo pedidos aprobados cuentan
 * como "gastado real").
 */
router.get('/admin/customers', requireAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT u.id, u.email, u.name, u.avatar_url, u.created_at, u.last_login_at,
              COUNT(o.id) AS order_count,
              COALESCE(SUM(CASE WHEN o.status = 'approved' THEN o.subtotal_cents ELSE 0 END), 0) AS total_spent_cents
         FROM users u
         LEFT JOIN orders o ON o.user_id = u.id
        GROUP BY u.id
        ORDER BY u.created_at DESC`
    );
    return res.json({ customers: rows });
  } catch (err) {
    console.error('[admin/customers] db error:', err.message);
    return res.status(500).json({ error: 'server_error' });
  }
});

/**
 * GET /api/admin/customers/:id — perfil + historial de pedidos completo
 * (mismo shape que GET /api/orders, pero por :id en vez de session.userId).
 */
router.get('/admin/customers/:id', requireAdmin, async (req, res) => {
  try {
    const [users] = await pool.execute(
      'SELECT id, email, name, avatar_url, created_at, last_login_at FROM users WHERE id = ?',
      [req.params.id]
    );
    const customer = users[0];
    if (!customer) return res.status(404).json({ error: 'not_found' });

    const [orders] = await pool.execute(
      `SELECT id, status, fulfillment_status, subtotal_cents, currency, created_at
         FROM orders WHERE user_id = ? ORDER BY created_at DESC`,
      [req.params.id]
    );

    if (orders.length === 0) {
      return res.json({ customer, orders: [] });
    }

    const orderIds = orders.map((o) => o.id);
    const placeholders = orderIds.map(() => '?').join(',');
    const [items] = await pool.query(
      `SELECT order_id, sku, name, unit_price_cents, qty, line_total_cents
         FROM order_items WHERE order_id IN (${placeholders})`,
      orderIds
    );
    const itemsByOrder = items.reduce((acc, item) => {
      (acc[item.order_id] = acc[item.order_id] || []).push(item);
      return acc;
    }, {});

    const result = orders.map((o) => ({ ...o, items: itemsByOrder[o.id] || [] }));
    return res.json({ customer, orders: result });
  } catch (err) {
    console.error('[admin/customers/:id] db error:', err.message);
    return res.status(500).json({ error: 'server_error' });
  }
});

module.exports = router;
