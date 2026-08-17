/**
 * Mail de confirmacion de compra: comprobante (NO factura fiscal, no hay
 * integracion AFIP/CAE) + venta cruzada. HTML con estilos inline nada mas
 * (tablas, sin <link>/<script>) porque asi lo requieren los clientes de
 * mail. Tokens de color y tipografia calcados de sitio/css/base.css
 * (--oliva #3A4433, --crema #F7F4EC, --oro #B08D3F, --corteza #1C1917).
 * Formato de precio identico a sitio/js/cart.js (fmt(): "$19.000").
 */

function fmt(cents) {
  const n = Math.round((cents || 0) / 100);
  return '$' + n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function escapeHtml(str) {
  return String(str || '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

function itemsRows(items) {
  return items.map((item) => `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid #E4DCC8;font:400 14px/1.4 Arial,sans-serif;color:#1C1917;">
        ${escapeHtml(item.name)}
      </td>
      <td style="padding:12px 0;border-bottom:1px solid #E4DCC8;font:400 14px/1.4 Arial,sans-serif;color:#1C1917;text-align:center;">
        ${item.qty}
      </td>
      <td style="padding:12px 0;border-bottom:1px solid #E4DCC8;font:400 14px/1.4 Arial,sans-serif;color:#1C1917;text-align:right;">
        ${fmt(item.unit_price_cents)}
      </td>
      <td style="padding:12px 0;border-bottom:1px solid #E4DCC8;font:600 14px/1.4 Arial,sans-serif;color:#1C1917;text-align:right;">
        ${fmt(item.line_total_cents)}
      </td>
    </tr>`).join('');
}

function crossSellCards(crossSell, baseUrl) {
  if (!crossSell || crossSell.length === 0) return '';
  const cards = crossSell.map((p) => `
    <td style="width:${Math.floor(100 / crossSell.length)}%;padding:0 8px;vertical-align:top;">
      <a href="${baseUrl}/producto-${encodeURIComponent(p.sku)}.html" style="text-decoration:none;color:inherit;">
        <img src="${baseUrl}/${p.image_path || 'img/logo.png'}" alt="${escapeHtml(p.name)}"
             width="100%" style="display:block;border-radius:4px;margin-bottom:8px;max-width:100%;height:auto;" />
        <div style="font:600 13px/1.35 Arial,sans-serif;color:#3A4433;margin-bottom:2px;">
          ${escapeHtml(p.name)}
        </div>
        <div style="font:400 12px/1.4 Arial,sans-serif;color:#616F36;margin-bottom:4px;">
          ${escapeHtml(p.why)}
        </div>
        <div style="font:600 13px/1 Arial,sans-serif;color:#1C1917;">
          ${fmt(p.price_cents)}
        </div>
      </a>
    </td>`).join('');

  return `
    <tr>
      <td style="padding:32px 32px 8px;">
        <div style="font:700 13px/1 Arial,sans-serif;letter-spacing:.05em;text-transform:uppercase;color:#B08D3F;margin-bottom:16px;">
          Tambien te puede interesar
        </div>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>${cards}</tr></table>
      </td>
    </tr>`;
}

function renderOrderConfirmationEmail({ order, items, customerName, crossSell, baseUrl }) {
  const subject = `Verde Oliva — Comprobante de tu compra #${order.id}`;
  const dateStr = new Date(order.created_at || Date.now()).toLocaleDateString('es-AR', {
    day: '2-digit', month: 'long', year: 'numeric',
  });

  const html = `
<!doctype html>
<html lang="es">
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /></head>
<body style="margin:0;padding:0;background:#F1EBDD;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F1EBDD;padding:24px 0;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background:#F7F4EC;max-width:600px;width:100%;">

        <tr><td style="background:#3A4433;padding:28px 32px;text-align:center;">
          <img src="${baseUrl}/img/logo.png" alt="Verde Oliva Olivoterapia" height="40" style="height:40px;display:inline-block;" />
        </td></tr>

        <tr><td style="padding:32px 32px 8px;">
          <div style="font:700 12px/1 Arial,sans-serif;letter-spacing:.08em;text-transform:uppercase;color:#B08D3F;margin-bottom:8px;">
            Comprobante de compra
          </div>
          <h1 style="font:600 22px/1.3 Georgia,serif;color:#1C1917;margin:0 0 4px;">
            Pedido #${order.id}
          </h1>
          <div style="font:400 13px/1.4 Arial,sans-serif;color:#616F36;">
            ${escapeHtml(customerName || '')} · ${dateStr}
          </div>
        </td></tr>

        <tr><td style="padding:16px 32px 8px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <thead>
              <tr>
                <th align="left" style="font:600 11px/1 Arial,sans-serif;text-transform:uppercase;letter-spacing:.04em;color:#616F36;padding-bottom:8px;border-bottom:2px solid #3A4433;">Producto</th>
                <th align="center" style="font:600 11px/1 Arial,sans-serif;text-transform:uppercase;letter-spacing:.04em;color:#616F36;padding-bottom:8px;border-bottom:2px solid #3A4433;">Cant.</th>
                <th align="right" style="font:600 11px/1 Arial,sans-serif;text-transform:uppercase;letter-spacing:.04em;color:#616F36;padding-bottom:8px;border-bottom:2px solid #3A4433;">Precio</th>
                <th align="right" style="font:600 11px/1 Arial,sans-serif;text-transform:uppercase;letter-spacing:.04em;color:#616F36;padding-bottom:8px;border-bottom:2px solid #3A4433;">Subtotal</th>
              </tr>
            </thead>
            <tbody>${itemsRows(items)}</tbody>
          </table>
        </td></tr>

        <tr><td style="padding:8px 32px 24px;text-align:right;">
          <span style="font:600 13px/1 Arial,sans-serif;color:#616F36;margin-right:12px;">Total</span>
          <span style="font:700 20px/1 Arial,sans-serif;color:#3A4433;">${fmt(order.subtotal_cents)}</span>
        </td></tr>

        <tr><td style="padding:0 32px 24px;">
          <div style="font:400 11px/1.5 Arial,sans-serif;color:#8A8478;border-top:1px solid #E4DCC8;padding-top:16px;">
            Este comprobante no reemplaza una factura fiscal.
          </div>
        </td></tr>

        ${crossSellCards(crossSell, baseUrl)}

        <tr><td style="background:#3A4433;padding:24px 32px;text-align:center;">
          <div style="font:400 12px/1.6 Arial,sans-serif;color:#F7F4EC;">
            Verde Oliva Olivoterapia · Coquimbito, Maipú, Mendoza<br />
            <a href="${baseUrl}/terminos.html" style="color:#D4C4A8;">Términos</a> ·
            <a href="${baseUrl}/privacidad.html" style="color:#D4C4A8;">Privacidad</a>
          </div>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  return { subject, html };
}

module.exports = { renderOrderConfirmationEmail };
