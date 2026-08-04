const express = require('express');
const pool = require('../lib/db');
const { requireAdmin } = require('../lib/requireAdmin');

const router = express.Router();

const LOW_STOCK_THRESHOLD = 5;

/**
 * GET /api/admin/dashboard — metricas basicas para la pantalla de inicio
 * del panel. Agregados simples, sin infra nueva.
 */
router.get('/admin/dashboard', requireAdmin, async (req, res) => {
  try {
    const [[salesRow]] = await pool.query(
      `SELECT COALESCE(SUM(subtotal_cents), 0) AS total_sales_cents
         FROM orders WHERE status = 'approved'`
    );

    const [byStatus] = await pool.query(
      `SELECT status, COUNT(*) AS count FROM orders GROUP BY status`
    );

    const [byFulfillment] = await pool.query(
      `SELECT fulfillment_status, COUNT(*) AS count
         FROM orders WHERE status = 'approved'
        GROUP BY fulfillment_status`
    );

    const [lowStock] = await pool.execute(
      `SELECT sku, name, stock_qty FROM products
        WHERE active = 1 AND stock_qty <= ?
        ORDER BY stock_qty ASC`,
      [LOW_STOCK_THRESHOLD]
    );

    const [[customerRow]] = await pool.query('SELECT COUNT(*) AS count FROM users');

    return res.json({
      total_sales_cents: salesRow.total_sales_cents,
      orders_by_status: byStatus,
      orders_by_fulfillment_status: byFulfillment,
      low_stock_products: lowStock,
      total_customers: customerRow.count,
    });
  } catch (err) {
    console.error('[admin/dashboard] db error:', err.message);
    return res.status(500).json({ error: 'server_error' });
  }
});

module.exports = router;
