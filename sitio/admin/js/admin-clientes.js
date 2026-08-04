(function () {
  'use strict';
  var A = window.VOAdmin;
  var STATUS_LABEL = {
    pending: 'Pendiente', approved: 'Aprobado', rejected: 'Rechazado',
    cancelled: 'Cancelado', refunded: 'Reembolsado',
  };
  var overlay = document.getElementById('modalOverlay');
  var alertEl = document.getElementById('alert');

  function render(customers) {
    var rows = document.getElementById('rows');
    var cards = document.getElementById('cards');
    if (!customers.length) {
      rows.innerHTML = '<tr><td colspan="6" class="adm-empty">Todavía no hay clientes registrados.</td></tr>';
      cards.innerHTML = '<p class="adm-empty">Todavía no hay clientes registrados.</p>';
      return;
    }
    rows.innerHTML = customers.map(function (c) {
      return '<tr>' +
        '<td>' + A.escapeHtml(c.name || '—') + '</td>' +
        '<td>' + A.escapeHtml(c.email) + '</td>' +
        '<td>' + A.escapeHtml(c.created_at) + '</td>' +
        '<td>' + c.order_count + '</td>' +
        '<td>' + A.fmtMoney(c.total_spent_cents) + '</td>' +
        '<td><button class="adm-btn-icon" type="button" data-detail="' + c.id + '">Ver historial</button></td>' +
      '</tr>';
    }).join('');

    cards.innerHTML = customers.map(function (c) {
      return '<div class="adm-card-row" data-card-open="' + c.id + '">' +
        '<div class="adm-card-row-info">' +
          '<strong>' + A.escapeHtml(c.name || '—') + '</strong>' +
          '<span class="adm-card-row-meta">' + A.escapeHtml(c.email) + '</span>' +
          '<span class="adm-card-row-meta">Registrado: ' + A.escapeHtml(c.created_at) + '</span>' +
          '<span class="adm-card-row-price">' + c.order_count + ' pedidos · ' + A.fmtMoney(c.total_spent_cents) + '</span>' +
        '</div>' +
        '<div class="adm-actions">' +
          '<button class="adm-btn-icon" type="button" data-detail="' + c.id + '">Ver historial</button>' +
        '</div>' +
      '</div>';
    }).join('');
  }

  function load() {
    return A.api('/customers').then(function (d) {
      render(d.customers);
    }).catch(function () {
      alertEl.innerHTML = '<div class="adm-alert adm-alert-error">No se pudieron cargar los clientes.</div>';
    });
  }

  function openDetail(id) {
    A.api('/customers/' + id).then(function (d) {
      document.getElementById('d-name').textContent = d.customer.name || 'Cliente';
      document.getElementById('d-email').textContent = d.customer.email;
      var ordersEl = document.getElementById('d-orders');
      ordersEl.innerHTML = d.orders.length
        ? d.orders.map(function (o) {
            return '<tr><td>#' + o.id + '</td><td>' + A.escapeHtml(o.created_at) + '</td><td>' +
              A.fmtMoney(o.subtotal_cents) + '</td><td><span class="adm-badge adm-badge-' + o.status + '">' +
              (STATUS_LABEL[o.status] || o.status) + '</span></td></tr>';
          }).join('')
        : '<tr><td colspan="4" class="adm-empty">Sin pedidos todavía.</td></tr>';
      overlay.classList.add('open');
    });
  }

  document.getElementById('customerList').addEventListener('click', function (e) {
    var id = e.target.getAttribute('data-detail');
    if (id) { openDetail(id); return; }
    var card = e.target.closest('[data-card-open]');
    if (card) openDetail(card.getAttribute('data-card-open'));
  });
  document.getElementById('btnClose').addEventListener('click', function () {
    overlay.classList.remove('open');
  });
  overlay.addEventListener('click', function (e) { if (e.target === overlay) overlay.classList.remove('open'); });

  A.guard('clientes.html').then(load).catch(function () {});
})();
