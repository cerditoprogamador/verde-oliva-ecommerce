const express = require('express');
const { MercadoPagoConfig, Payment } = require('mercadopago');
const pool = require('../lib/db');
const { sendMail } = require('../lib/mailer');
const { getCrossSellProducts } = require('../lib/crossSell');
const { renderOrderConfirmationEmail } = require('../lib/emailTemplates/orderConfirmation');

const router = express.Router();

// Sin requireXhrHeader aca a proposito: este endpoint lo llama el servidor
// de Mercado Pago, no el navegador del usuario — no puede mandar el header
// custom que usamos como mitigacion CSRF en el resto de /api/*. La
// autenticidad de esta notificacion no se valida por el header ni por el
// body (ver mas abajo, nunca se confia en el body del webhook): se valida
// re-consultando el pago por id contra la API de MP con nuestro propio
// access token.

/**
 * Mapea el `status` de un pago de Mercado Pago al enum de `orders.status`.
 * https://www.mercadopago.com.ar/developers/es/docs/checkout-api/payment-management/status
 */
function mapStatus(mpStatus) {
  switch (mpStatus) {
    case 'approved':
      return 'approved';
    case 'rejected':
      return 'rejected';
    case 'cancelled':
      return 'cancelled';
    case 'refunded':
    case 'charged_back':
      return 'refunded';
    case 'pending':
    case 'in_process':
    case 'in_mediation':
    case 'authorized':
    default:
      return 'pending';
  }
}

/**
 * POST /api/webhooks/mercadopago
 *
 * MP manda distintos formatos historicamente (query params `?topic=payment&id=...`,
 * o body JSON `{type:'payment', data:{id:...}}`). Se soportan ambos, pero en
 * ningun caso se usa nada del body/query mas alla del id para decidir el
 * estado: el estado real siempre se re-consulta a la API de MP.
 */
router.post('/webhooks/mercadopago', async (req, res) => {
  // Responder 200 rapido es mas importante que procesar todo sincrono: MP
  // reintenta agresivamente ante timeout o status != 200. Si algo falla,
  // logueamos pero igual devolvemos 200 para no entrar en un loop de
  // reintentos por un error que probablemente sea nuestro, no de MP.
  try {
    const type = req.query.type || req.query.topic || (req.body && req.body.type);
    const paymentId =
      (req.body && req.body.data && req.body.data.id) ||
      req.query['data.id'] ||
      req.query.id;

    if (type !== 'payment' || !paymentId) {
      // Otras notificaciones (merchant_order, etc.) — no nos interesan hoy.
      return res.sendStatus(200);
    }

    const mpAccessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    if (!mpAccessToken) {
      console.error('[webhook] falta MERCADOPAGO_ACCESS_TOKEN, no puedo verificar el pago');
      return res.sendStatus(200);
    }

    const mpClient = new MercadoPagoConfig({ accessToken: mpAccessToken });
    const paymentClient = new Payment(mpClient);

    // Nunca confiar en el body del webhook: se vuelve a pedir el pago por
    // id a la API de MP, que es la unica fuente de verdad del estado real.
    const payment = await paymentClient.get({ id: paymentId });

    const orderId = payment.external_reference;
    const status = mapStatus(payment.status);

    if (!orderId) {
      console.error('[webhook] pago sin external_reference:', paymentId);
      return res.sendStatus(200);
    }

    // Idempotente por mp_payment_id: si esta notificacion ya se proceso
    // (mismo payment id ya guardado con el mismo status), UPDATE no hace
    // nada nuevo. La columna mp_payment_id es UNIQUE, asi que dos ordenes
    // nunca terminan apuntando al mismo pago.
    const [result] = await pool.execute(
      `UPDATE orders
         SET status = ?, mp_payment_id = ?
         WHERE id = ? AND (mp_payment_id IS NULL OR mp_payment_id = ?)`,
      [status, String(paymentId), orderId, String(paymentId)]
    );

    if (result.affectedRows === 0) {
      console.warn(`[webhook] orden ${orderId} no actualizada (no existe, o mp_payment_id ya pertenece a otro pago)`);
    } else if (status === 'approved') {
      // affectedRows > 0 aca significa que esta UPDATE realmente cambio
      // algo (mysql2 no cuenta como "affected" un UPDATE que deja los
      // mismos valores) — asi que esto corre una sola vez por pedido,
      // nunca dos veces por un reintento de MP con el mismo status.
      const [items] = await pool.execute(
        'SELECT sku, qty, name, unit_price_cents, line_total_cents FROM order_items WHERE order_id = ?',
        [orderId]
      );
      for (const item of items) {
        await pool.execute(
          'UPDATE products SET stock_qty = GREATEST(stock_qty - ?, 0) WHERE sku = ?',
          [item.qty, item.sku]
        );
      }

      // Mail de confirmacion: se dispara sin await (ver comentario arriba
      // sobre responder 200 rapido) y con su propio catch — un fallo de
      // SMTP nunca puede afectar la respuesta al webhook de MP.
      sendOrderConfirmationEmail(orderId, items).catch((err) => {
        console.error('[webhook] error armando/enviando mail de confirmacion:', err.message);
      });
    }

    return res.sendStatus(200);
  } catch (err) {
    console.error('[webhook] error procesando notificacion:', err.message);
    // Igual 200: preferimos investigar en logs antes que generar un loop
    // de reintentos infinito de MP por un fallo transitorio nuestro.
    return res.sendStatus(200);
  }
});

/**
 * Arma y envia el mail de confirmacion para un pedido recien aprobado.
 * Separado en su propia funcion (en vez de inline en el handler) para que
 * el .catch() del caller cubra tanto los queries de armado (comprador,
 * venta cruzada) como el envio en si.
 */
async function sendOrderConfirmationEmail(orderId, items) {
  const [orders] = await pool.execute(
    `SELECT o.id, o.subtotal_cents, o.created_at, u.email AS customer_email, u.name AS customer_name
       FROM orders o
       JOIN users u ON u.id = o.user_id
      WHERE o.id = ?`,
    [orderId]
  );
  const order = orders[0];
  if (!order || !order.customer_email) return;

  const skus = items.map((item) => item.sku);
  const crossSell = await getCrossSellProducts(skus);

  const baseUrl = process.env.PUBLIC_BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
  const { subject, html } = renderOrderConfirmationEmail({
    order,
    items,
    customerName: order.customer_name,
    crossSell,
    baseUrl,
  });

  await sendMail({ to: order.customer_email, subject, html });
}

module.exports = router;
