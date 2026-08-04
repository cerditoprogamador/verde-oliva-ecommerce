/* Dropdown predictivo para los inputs de busqueda (.searchbox #q en desktop,
 * .mnav-search #q-mobile en el menu). Comparte /api/products con products.js
 * (misma fuente de verdad que el admin), asi que precio/foto/stock siempre
 * coinciden con lo que ve el usuario en el catalogo o la ficha.
 *
 * En catalogo.html convive con el filtro en vivo ya cableado en su propio
 * <script>: ambos escuchan 'input' sobre el mismo campo sin pisarse (uno
 * filtra la grilla, este sugiere y linkea directo a la ficha). */
(function () {
  'use strict';

  var MAX_RESULTS = 6;
  var productsPromise = null;

  function fmt(pesos) {
    return '$' + Math.round(pesos).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  function norm(s) {
    return (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  }

  function loadProducts() {
    if (!productsPromise) {
      productsPromise = fetch('/api/products')
        .then(function (r) { return r.json(); })
        .then(function (d) { return (d.products || []).filter(function (p) { return p.stock_qty > 0; }); })
        .catch(function (err) {
          console.error('[search-predictive] no se pudo cargar el catalogo:', err);
          return [];
        });
    }
    return productsPromise;
  }

  function buildPanel(input) {
    var panel = document.createElement('div');
    panel.className = 'search-suggest';
    panel.setAttribute('role', 'listbox');
    panel.hidden = true;
    input.setAttribute('role', 'combobox');
    input.setAttribute('aria-expanded', 'false');
    input.setAttribute('aria-autocomplete', 'list');
    input.parentElement.appendChild(panel);
    return panel;
  }

  function itemHtml(p) {
    var img = p.image_path ? '<img src="' + p.image_path + '" alt="" loading="lazy">' : '<span class="ssi-ph" aria-hidden="true"></span>';
    return '<a class="search-suggest-item" role="option" href="producto-' + p.sku + '.html">' +
      img +
      '<span class="ssi-b"><span class="ssi-name">' + p.name + '</span></span>' +
      '<span class="ssi-price">' + fmt(p.price_cents / 100) + '</span>' +
      '</a>';
  }

  function render(panel, input, products, query) {
    var q = norm(query.trim());
    if (!q) {
      panel.hidden = true;
      panel.innerHTML = '';
      input.setAttribute('aria-expanded', 'false');
      return;
    }
    var matches = products.filter(function (p) { return norm(p.name).indexOf(q) !== -1; }).slice(0, MAX_RESULTS);
    if (!matches.length) {
      panel.innerHTML = '<p class="search-suggest-empty">Sin resultados para "' + query.trim() + '"</p>';
    } else {
      panel.innerHTML = matches.map(itemHtml).join('');
    }
    panel.hidden = false;
    input.setAttribute('aria-expanded', 'true');
  }

  function wire(input) {
    var panel = buildPanel(input);
    var products = [];
    var activeIndex = -1;

    function items() {
      return [].slice.call(panel.querySelectorAll('.search-suggest-item'));
    }

    function setActive(i) {
      var els = items();
      els.forEach(function (el) { el.classList.remove('is-active'); });
      if (els[i]) {
        els[i].classList.add('is-active');
        els[i].scrollIntoView({ block: 'nearest' });
      }
      activeIndex = i;
    }

    function close() {
      panel.hidden = true;
      input.setAttribute('aria-expanded', 'false');
      activeIndex = -1;
    }

    input.addEventListener('focus', function () {
      loadProducts().then(function (list) {
        products = list;
        if (input.value.trim()) render(panel, input, products, input.value);
      });
    });

    input.addEventListener('input', function () {
      activeIndex = -1;
      if (!products.length) {
        loadProducts().then(function (list) {
          products = list;
          render(panel, input, products, input.value);
        });
      } else {
        render(panel, input, products, input.value);
      }
    });

    input.addEventListener('keydown', function (e) {
      if (panel.hidden) return;
      var els = items();
      if (!els.length) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActive(activeIndex < els.length - 1 ? activeIndex + 1 : 0);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActive(activeIndex > 0 ? activeIndex - 1 : els.length - 1);
      } else if (e.key === 'Enter' && activeIndex !== -1) {
        e.preventDefault();
        els[activeIndex].click();
      } else if (e.key === 'Escape') {
        close();
      }
    });

    input.addEventListener('blur', function () {
      /* timeout: deja que un click sobre un item dispare su navegacion
       * antes de que el blur oculte el panel. */
      setTimeout(close, 150);
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.searchbox input[type="search"], .mnav-search input[type="search"]')
      .forEach(wire);
  });
})();
