(function () {
  'use strict';
  var A = window.VOAdmin;
  var STATUS_LABEL = {
    pending: 'Pendiente', approved: 'Aprobado', rejected: 'Rechazado',
    cancelled: 'Cancelado', refunded: 'Reembolsado',
  };
  var FULFILLMENT_LABEL = {
    sin_preparar: 'Sin preparar', preparando: 'Preparando', enviado: 'Enviado', entregado: 'Entregado',
  };

  A.guard('index.html').then(function () {
    return A.api('/dashboard');
  }).then(function (d) {
    var byStatus = d.orders_by_status.map(function (r) {
      return '<li><span>' + (STATUS_LABEL[r.status] || r.status) + '</span><span>' + r.count + '</span></li>';
    }).join('');
    var byFulfillment = d.orders_by_fulfillment_status.map(function (r) {
      return '<li><span>' + (FULFILLMENT_LABEL[r.fulfillment_status] || r.fulfillment_status) + '</span><span>' + r.count + '</span></li>';
    }).join('');
    var lowStock = d.low_stock_products.length
      ? d.low_stock_products.map(function (p) {
          return '<li><span>' + A.escapeHtml(p.name) + '</span><span>' + p.stock_qty + ' u.</span></li>';
        }).join('')
      : '<li><span class="muted">Ningún producto con stock bajo</span></li>';

    document.getElementById('content').innerHTML =
      '<div class="adm-stats">' +
        '<a class="adm-stat" href="pedidos.html"><p class="adm-stat-l">Ventas totales (pagos aprobados)</p><p class="adm-stat-v">' + A.fmtMoney(d.total_sales_cents) + '</p></a>' +
        '<a class="adm-stat" href="clientes.html"><p class="adm-stat-l">Clientes registrados</p><p class="adm-stat-v">' + d.total_customers + '</p></a>' +
        '<a class="adm-stat" href="pedidos.html"><p class="adm-stat-l">Pedidos por estado de pago</p><ul class="adm-stat-list">' + byStatus + '</ul></a>' +
        '<a class="adm-stat" href="pedidos.html"><p class="adm-stat-l">Pedidos aprobados por logística</p><ul class="adm-stat-list">' + byFulfillment + '</ul></a>' +
        '<a class="adm-stat" href="productos.html"><p class="adm-stat-l">Stock bajo (≤5 u.)</p><ul class="adm-stat-list">' + lowStock + '</ul></a>' +
      '</div>';
  }).catch(function (err) {
    if (err.message === 'not_authenticated') return;
    document.getElementById('content').innerHTML = '<div class="adm-alert adm-alert-error">No se pudo cargar el dashboard.</div>';
  });
})();
