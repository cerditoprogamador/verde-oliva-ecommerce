const express = require('express');
const pool = require('../lib/db');
const { requireXhrHeader } = require('../lib/csrf');
const { requireAdmin } = require('../lib/requireAdmin');

const router = express.Router();

const FULFILLMENT_VALUES = ['sin_preparar', 'preparando', 'enviado', 'entregado'];

/**
 * GET /api/admin/orders — todos los pedidos (no solo los del usuario
 * logueado, a diferencia de GET /api/orders). Filtros opcionales por
 * query string: ?status=, ?fulfillment_status=.
 */
router.get('/admin/orders', requireAdmin, async (req, res) => {
  try {
    const clauses = [];
    const params = [];
    if (req.query.status) {
      clauses.push('o.status = ?');
      params.push(req.query.status);
    }
    if (req.query.fulfillment_status) {
      clauses.push('o.fulfillment_status = ?');
      params.push(req.query.fulfillment_status);
    }
    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';

    const [orders] = await pool.query(
      `SELECT o.id, o.status, o.fulfillment_status, o.subtotal_cents, o.currency,
              o.created_at, u.email AS customer_email, u.name AS customer_name
         FROM orders o
         JOIN users u ON u.id = o.user_id
         ${where}
        ORDER BY o.created_at DESC`,
      params
    );
    return res.json({ orders });
  } catch (err) {
    console.error('[admin/orders] db error:', err.message);
    return res.status(500).json({ error: 'server_error' });
  }
});

/**
 * GET /api/admin/orders/:id — detalle de un pedido + sus items + cliente.
 */
router.get('/admin/orders/:id', requireAdmin, async (req, res) => {
  try {
    const [orders] = await pool.execute(
      `SELECT o.id, o.status, o.fulfillment_status, o.subtotal_cents, o.currency,
              o.created_at, o.updated_at, u.id AS customer_id, u.email AS customer_email,
              u.name AS customer_name
         FROM orders o
         JOIN users u ON u.id = o.user_id
        WHERE o.id = ?`,
      [req.params.id]
    );
    const order = orders[0];
    if (!order) return res.status(404).json({ error: 'not_found' });

    const [items] = await pool.execute(
      `SELECT sku, name, unit_price_cents, qty, line_total_cents
         FROM order_items WHERE order_id = ?`,
      [req.params.id]
    );

    return res.json({ order: { ...order, items } });
  } catch (err) {
    console.error('[admin/orders/:id] db error:', err.message);
    return res.status(500).json({ error: 'server_error' });
  }
});

/**
 * PUT /api/admin/orders/:id/fulfillment — actualiza el estado de
 * logistica. Solo tiene sentido si el pago ya esta aprobado: un pedido
 * pendiente/rechazado/cancelado no tiene nada que preparar/enviar.
 */
router.put('/admin/orders/:id/fulfillment', requireXhrHeader, requireAdmin, async (req, res) => {
  const { fulfillment_status: fulfillmentStatus } = req.body || {};
  if (!FULFILLMENT_VALUES.includes(fulfillmentStatus)) {
    return res.status(400).json({ error: 'fulfillment_status_invalido' });
  }

  try {
    const [orders] = await pool.execute('SELECT status FROM orders WHERE id = ?', [req.params.id]);
    const order = orders[0];
    if (!order) return res.status(404).json({ error: 'not_found' });
    if (order.status !== 'approved') {
      return res.status(400).json({ error: 'pedido_no_aprobado' });
    }

    await pool.execute('UPDATE orders SET fulfillment_status = ? WHERE id = ?', [
      fulfillmentStatus,
      req.params.id,
    ]);
    return res.json({ ok: true });
  } catch (err) {
    console.error('[admin/orders/:id/fulfillment] db error:', err.message);
    return res.status(500).json({ error: 'server_error' });
  }
});

module.exports = router;
