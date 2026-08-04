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
  var currentOrderId = null;
  var alertEl = document.getElementById('alert');
  var overlay = document.getElementById('modalOverlay');

  function badge(cls, label) {
    return '<span class="adm-badge adm-badge-' + cls + '">' + label + '</span>';
  }

  function render(orders) {
    var rows = document.getElementById('rows');
    var cards = document.getElementById('cards');
    if (!orders.length) {
      rows.innerHTML = '<tr><td colspan="7" class="adm-empty">No hay pedidos todavía.</td></tr>';
      cards.innerHTML = '<p class="adm-empty">No hay pedidos todavía.</p>';
      return;
    }
    rows.innerHTML = orders.map(function (o) {
      return '<tr>' +
        '<td>#' + o.id + '</td>' +
        '<td>' + A.escapeHtml(o.customer_name || o.customer_email) + '</td>' +
        '<td>' + A.escapeHtml(o.created_at) + '</td>' +
        '<td>' + A.fmtMoney(o.subtotal_cents) + '</td>' +
        '<td>' + badge(o.status, STATUS_LABEL[o.status] || o.status) + '</td>' +
        '<td>' + badge(o.fulfillment_status, FULFILLMENT_LABEL[o.fulfillment_status] || o.fulfillment_status) + '</td>' +
        '<td><button class="adm-btn-icon" type="button" data-detail="' + o.id + '">Ver detalle</button></td>' +
      '</tr>';
    }).join('');

    // Version mobile: tarjeta con lo esencial (cliente, fecha, total,
    // ambos estados) + un boton grande que abre el detalle con todo
    // editable, en vez de una fila con scroll horizontal.
    cards.innerHTML = orders.map(function (o) {
      return '<div class="adm-card-row" data-card-open="' + o.id + '">' +
        '<div class="adm-card-row-info">' +
          '<strong>#' + o.id + ' — ' + A.escapeHtml(o.customer_name || o.customer_email) + '</strong>' +
          '<span class="adm-card-row-meta">' + A.escapeHtml(o.created_at) + '</span>' +
          '<span class="adm-card-row-price">' + A.fmtMoney(o.subtotal_cents) + '</span>' +
        '</div>' +
        '<div class="adm-card-row-badges">' +
          badge(o.status, STATUS_LABEL[o.status] || o.status) +
          badge(o.fulfillment_status, FULFILLMENT_LABEL[o.fulfillment_status] || o.fulfillment_status) +
        '</div>' +
        '<div class="adm-actions">' +
          '<button class="adm-btn-icon" type="button" data-detail="' + o.id + '">Ver detalle</button>' +
        '</div>' +
      '</div>';
    }).join('');
  }

  function load() {
    var status = document.getElementById('filterStatus').value;
    var qs = status ? '?status=' + encodeURIComponent(status) : '';
    return A.api('/orders' + qs).then(function (d) {
      render(d.orders);
    }).catch(function () {
      alertEl.innerHTML = '<div class="adm-alert adm-alert-error">No se pudieron cargar los pedidos.</div>';
    });
  }

  function openDetail(id) {
    currentOrderId = id;
    var modalAlert = document.getElementById('modalAlert');
    modalAlert.innerHTML = '';
    A.api('/orders/' + id).then(function (d) {
      var o = d.order;
      document.getElementById('d-id').textContent = '#' + o.id;
      document.getElementById('d-customer').textContent = (o.customer_name || '') + ' (' + o.customer_email + ')';
      document.getElementById('d-date').textContent = o.created_at;
      document.getElementById('d-status').innerHTML = badge(o.status, STATUS_LABEL[o.status] || o.status);
      document.getElementById('d-items').innerHTML = o.items.map(function (it) {
        return '<tr><td>' + A.escapeHtml(it.name) + '</td><td>' + it.qty + '</td><td>' +
          A.fmtMoney(it.unit_price_cents) + '</td><td>' + A.fmtMoney(it.line_total_cents) + '</td></tr>';
      }).join('');
      document.getElementById('d-fulfillment').value = o.fulfillment_status;
      document.getElementById('d-fulfillment').disabled = o.status !== 'approved';
      document.getElementById('btnSaveFulfillment').disabled = o.status !== 'approved';
      if (o.status !== 'approved') {
        modalAlert.innerHTML = '<div class="adm-alert adm-alert-error">El pago todavía no está aprobado — no se puede gestionar la logística hasta que Mercado Pago confirme el pago.</div>';
      }
      overlay.classList.add('open');
    });
  }

  document.getElementById('orderList').addEventListener('click', function (e) {
    var id = e.target.getAttribute('data-detail');
    if (id) { openDetail(id); return; }
    // Tocar cualquier parte de la tarjeta (mobile) abre el mismo detalle
    // que el boton "Ver detalle" — un solo destino, no hace falta apuntar
    // justo al boton chico.
    var card = e.target.closest('[data-card-open]');
    if (card) openDetail(card.getAttribute('data-card-open'));
  });

  document.getElementById('btnClose').addEventListener('click', function () {
    overlay.classList.remove('open');
  });
  overlay.addEventListener('click', function (e) { if (e.target === overlay) overlay.classList.remove('open'); });

  document.getElementById('btnSaveFulfillment').addEventListener('click', function () {
    var modalAlert = document.getElementById('modalAlert');
    var value = document.getElementById('d-fulfillment').value;
    A.api('/orders/' + currentOrderId + '/fulfillment', { method: 'PUT', body: { fulfillment_status: value } })
      .then(function () {
        overlay.classList.remove('open');
        return load();
      })
      .catch(function () {
        modalAlert.innerHTML = '<div class="adm-alert adm-alert-error">No se pudo actualizar el estado.</div>';
      });
  });

  document.getElementById('filterStatus').addEventListener('change', load);

  A.guard('pedidos.html').then(load).catch(function () {});
})();
