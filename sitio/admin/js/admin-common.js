/* Compartido por todas las páginas de sitio/admin/. Sin i18n (herramienta
   interna en español) — mismo criterio de fetch que auth.js/cart.js del
   sitio publico: credentials same-origin + X-Requested-With para pasar
   requireXhrHeader. */
(function () {
  'use strict';

  var PAGES = [
    { href: 'index.html', label: 'Dashboard' },
    { href: 'productos.html', label: 'Productos' },
    { href: 'pedidos.html', label: 'Pedidos' },
    { href: 'clientes.html', label: 'Clientes' },
  ];

  function fmtMoney(cents) {
    var pesos = Math.round((cents || 0) / 100);
    return '$' + pesos.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  function escapeHtml(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* body debe ser un objeto plano (se manda como JSON) o una instancia de
     FormData (multipart, para las rutas de productos con imagen) — en
     ese segundo caso no se fija Content-Type: el browser arma el boundary. */
  function api(path, options) {
    options = options || {};
    var isFormData = options.body instanceof FormData;
    var headers = Object.assign({ 'X-Requested-With': 'XMLHttpRequest' }, options.headers || {});
    if (!isFormData) headers['Content-Type'] = 'application/json';

    return fetch('/api/admin' + path, {
      method: options.method || 'GET',
      credentials: 'same-origin',
      headers: headers,
      body: isFormData ? options.body : options.body ? JSON.stringify(options.body) : undefined,
    }).then(function (res) {
      return res.json().catch(function () { return {}; }).then(function (data) {
        if (!res.ok) {
          var err = new Error(data.error || 'server_error');
          err.data = data;
          err.status = res.status;
          throw err;
        }
        return data;
      });
    });
  }

  function renderNav(activeHref) {
    var el = document.getElementById('adm-nav');
    if (!el) return;
    el.innerHTML = PAGES.map(function (p) {
      var current = p.href === activeHref ? ' aria-current="page"' : '';
      return '<a href="' + p.href + '"' + current + '>' + p.label + '</a>';
    }).join('');
  }

  function wireLogout() {
    var btn = document.getElementById('adm-logout');
    if (!btn) return;
    btn.addEventListener('click', function () {
      api('/logout', { method: 'POST' }).finally(function () {
        window.location.href = 'login.html';
      });
    });
  }

  /* Sidebar en desktop, drawer deslizable en mobile (mismo patron que el
     menu mobile del sitio publico: hamburguesa + backdrop + drawer). */
  function wireSidebar() {
    var sidebar = document.getElementById('admSidebar');
    var backdrop = document.getElementById('admSidebarBackdrop');
    var toggle = document.getElementById('admMenuToggle');
    if (!sidebar || !backdrop || !toggle) return;

    function open() {
      sidebar.classList.add('open');
      backdrop.classList.add('open');
      toggle.setAttribute('aria-expanded', 'true');
    }
    function close() {
      sidebar.classList.remove('open');
      backdrop.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    }
    toggle.addEventListener('click', function () {
      if (sidebar.classList.contains('open')) close(); else open();
    });
    backdrop.addEventListener('click', close);
    sidebar.addEventListener('click', function (e) {
      if (e.target.closest('a')) close();
    });
  }

  function showUsername(username) {
    var el = document.getElementById('adm-username');
    if (el) el.textContent = username;
  }

  /* Gate de UX (no de seguridad — el limite real es requireAdmin en cada
     ruta /api/admin/*, igual que el resto del sitio ya documenta para
     requireAuth). Llamar al principio de cada pagina del panel salvo
     login.html. */
  function guard(activeHref) {
    return api('/me')
      .then(function (data) {
        if (!data.authenticated) {
          window.location.href = 'login.html';
          return Promise.reject(new Error('not_authenticated'));
        }
        showUsername(data.username);
        renderNav(activeHref);
        wireLogout();
        wireSidebar();
        return data;
      })
      .catch(function (err) {
        if (err.message !== 'not_authenticated') window.location.href = 'login.html';
        throw err;
      });
  }

  window.VOAdmin = { api: api, fmtMoney: fmtMoney, escapeHtml: escapeHtml, guard: guard };
})();
