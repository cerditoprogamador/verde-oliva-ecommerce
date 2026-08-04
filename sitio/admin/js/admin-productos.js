(function () {
  'use strict';
  var A = window.VOAdmin;
  var products = [];

  var overlay = document.getElementById('modalOverlay');
  var form = document.getElementById('productForm');
  var alertEl = document.getElementById('alert');
  var modalAlert = document.getElementById('modalAlert');
  var combinaRowsEl = document.getElementById('combinaRows');

  // Campos de contenido de ficha: id del elemento <-> columna en products.
  // Cada uno tiene su par _en (ver admin.css .adm-field-bilingual).
  var FICHA_FIELDS_BASE = [
    ['f-ficha-lead', 'ficha_lead'],
    ['f-para-que-sirve', 'para_que_sirve'],
    ['f-para-que-piel', 'para_que_piel'],
    ['f-cuando-usar', 'cuando_usar'],
    ['f-como-usar', 'como_usar'],
    ['f-que-esperar', 'que_esperar'],
    ['f-origen', 'origen'],
    ['f-ingredientes', 'ingredientes_inci'],
    ['f-seguridad', 'seguridad'],
  ];
  var FICHA_FIELDS = FICHA_FIELDS_BASE.concat(
    FICHA_FIELDS_BASE.map(function (pair) { return [pair[0] + '-en', pair[1] + '_en']; })
  );

  // Slots de galeria: id del <input type=file>, id del <img> preview, id
  // del checkbox "quitar" (null para el principal, que no se puede quitar).
  var GALLERY_SLOTS = [
    { file: 'f-image', preview: 'f-preview', remove: null, field: 'image' },
    { file: 'f-image-2', preview: 'f-preview-2', remove: 'f-remove-2', field: 'image_2' },
    { file: 'f-image-3', preview: 'f-preview-3', remove: 'f-remove-3', field: 'image_3' },
    { file: 'f-image-4', preview: 'f-preview-4', remove: 'f-remove-4', field: 'image_4' },
  ];

  function badge(active) {
    return active
      ? '<span class="adm-badge adm-badge-approved">Activo</span>'
      : '<span class="adm-badge adm-badge-cancelled">Inactivo</span>';
  }

  function render() {
    var rows = document.getElementById('rows');
    var cards = document.getElementById('cards');
    if (!products.length) {
      rows.innerHTML = '<tr><td colspan="7" class="adm-empty">No hay productos todavía.</td></tr>';
      cards.innerHTML = '<p class="adm-empty">No hay productos todavía.</p>';
      return;
    }
    rows.innerHTML = products.map(function (p) {
      var img = p.image_path ? '<img class="adm-thumb" src="../' + A.escapeHtml(p.image_path) + '" alt="">' : '—';
      var lowClass = p.stock_qty <= 5 ? ' low' : '';
      return '<tr>' +
        '<td>' + img + '</td>' +
        '<td class="adm-td-name" title="' + A.escapeHtml(p.name) + '">' + A.escapeHtml(p.name) + '</td>' +
        '<td class="adm-td-linea">' + A.escapeHtml([p.linea, p.formato].filter(Boolean).join(' · ')) + '</td>' +
        '<td>' + A.fmtMoney(p.price_cents) + '</td>' +
        '<td><input type="number" class="adm-stock-input' + lowClass + '" data-stock="' + p.sku + '" value="' + p.stock_qty + '" min="0"></td>' +
        '<td>' + badge(!!p.active) + '</td>' +
        '<td><div class="adm-actions adm-actions-table">' +
          '<button class="adm-btn-icon" type="button" data-edit="' + p.sku + '">Editar</button>' +
          '<button class="adm-btn-icon" type="button" data-toggle="' + p.sku + '">' + (p.active ? 'Desactivar' : 'Activar') + '</button>' +
          '<button class="adm-btn-icon danger" type="button" data-delete="' + p.sku + '">Eliminar</button>' +
        '</div></td>' +
      '</tr>';
    }).join('');

    // Version mobile de la misma info: tarjeta con foto grande arriba (a
    // todo el ancho, como una mini ficha) en vez de fila con scroll
    // horizontal — la tabla arriba se oculta por CSS bajo 760px.
    cards.innerHTML = products.map(function (p) {
      var img = p.image_path
        ? '<img class="adm-card-row-thumb" src="../' + A.escapeHtml(p.image_path) + '" alt="">'
        : '<div class="adm-card-row-thumb-ph"></div>';
      var lowClass = p.stock_qty <= 5 ? ' low' : '';
      return '<div class="adm-card-row has-photo">' +
        '<div class="adm-card-photo" data-card-open="' + p.sku + '">' +
          img +
          badge(!!p.active) +
        '</div>' +
        '<div class="adm-card-body">' +
          '<div class="adm-card-body-head" data-card-open="' + p.sku + '">' +
            '<div class="adm-card-row-info">' +
              '<strong>' + A.escapeHtml(p.name) + '</strong>' +
              '<span class="adm-card-row-meta">' + A.escapeHtml([p.linea, p.formato].filter(Boolean).join(' · ')) + '</span>' +
              '<span class="adm-card-row-price">' + A.fmtMoney(p.price_cents) + '</span>' +
            '</div>' +
          '</div>' +
          '<div class="adm-card-row-stock">' +
            '<label>Stock</label>' +
            '<input type="number" class="adm-stock-input' + lowClass + '" data-stock="' + p.sku + '" value="' + p.stock_qty + '" min="0">' +
          '</div>' +
          '<div class="adm-actions">' +
            '<button class="adm-btn-icon" type="button" data-edit="' + p.sku + '">Editar</button>' +
            '<button class="adm-btn-icon" type="button" data-toggle="' + p.sku + '">' + (p.active ? 'Desactivar' : 'Activar') + '</button>' +
            '<button class="adm-btn-icon danger" type="button" data-delete="' + p.sku + '">Eliminar</button>' +
          '</div>' +
        '</div>' +
      '</div>';
    }).join('');
  }

  function load() {
    return A.api('/products').then(function (d) {
      products = d.products;
      render();
    }).catch(function () {
      alertEl.innerHTML = '<div class="adm-alert adm-alert-error">No se pudieron cargar los productos.</div>';
    });
  }

  /* combina_con/gallery_images vienen como string JSON crudo en la lista
     (GET /admin/products no los parsea, a diferencia del detalle de a uno). */
  function parseJsonField(raw) {
    if (Array.isArray(raw)) return raw;
    if (typeof raw === 'string' && raw) {
      try { return JSON.parse(raw); } catch (e) { return []; }
    }
    return [];
  }

  function renderCombinaRows(currentSku, existing) {
    var options = '<option value="">— ninguno —</option>' + products
      .filter(function (p) { return p.sku !== currentSku; })
      .map(function (p) { return '<option value="' + p.sku + '">' + A.escapeHtml(p.name) + '</option>'; })
      .join('');

    combinaRowsEl.innerHTML = [0, 1, 2].map(function (i) {
      var entry = existing[i] || { sku: '', why: '', why_en: '' };
      return '<div class="adm-combina-row">' +
        '<select class="combina-sku" data-i="' + i + '">' + options + '</select>' +
        '<input type="text" class="combina-why" data-i="' + i + '" placeholder="Por qué combina (ES)" value="' + A.escapeHtml(entry.why) + '">' +
        '<input type="text" class="combina-why-en" data-i="' + i + '" placeholder="Por qué combina (EN, opcional)" value="' + A.escapeHtml(entry.why_en || '') + '">' +
      '</div>';
    }).join('');

    [0, 1, 2].forEach(function (i) {
      var entry = existing[i];
      if (!entry || !entry.sku) return;
      var sel = combinaRowsEl.querySelector('select[data-i="' + i + '"]');
      if (sel) sel.value = entry.sku;
    });
  }

  function collectCombinaCon() {
    var rows = [].slice.call(combinaRowsEl.querySelectorAll('.adm-combina-row'));
    var arr = rows.map(function (row) {
      return {
        sku: row.querySelector('.combina-sku').value,
        why: row.querySelector('.combina-why').value.trim(),
        why_en: row.querySelector('.combina-why-en').value.trim(),
      };
    }).filter(function (it) { return it.sku; });
    return arr.length ? JSON.stringify(arr) : '';
  }

  function resetGallerySlots() {
    GALLERY_SLOTS.forEach(function (slot) {
      document.getElementById(slot.file).value = '';
      var preview = document.getElementById(slot.preview);
      preview.src = '';
      preview.hidden = true;
      if (slot.remove) document.getElementById(slot.remove).checked = false;
    });
  }

  function populateGallerySlots(product) {
    var paths = [product.image_path].concat(parseJsonField(product.gallery_images));
    GALLERY_SLOTS.forEach(function (slot, i) {
      if (!paths[i]) return;
      var preview = document.getElementById(slot.preview);
      preview.src = '../' + paths[i];
      preview.hidden = false;
    });
  }

  function wireGallerySlotPreviews() {
    GALLERY_SLOTS.forEach(function (slot) {
      document.getElementById(slot.file).addEventListener('change', function (e) {
        var file = e.target.files[0];
        var preview = document.getElementById(slot.preview);
        if (!file) return;
        preview.src = URL.createObjectURL(file);
        preview.hidden = false;
        if (slot.remove) document.getElementById(slot.remove).checked = false;
      });
      if (slot.remove) {
        document.getElementById(slot.remove).addEventListener('change', function (e) {
          if (!e.target.checked) return;
          document.getElementById(slot.file).value = '';
          var preview = document.getElementById(slot.preview);
          preview.src = '';
          preview.hidden = true;
        });
      }
    });
  }

  function appendGalleryFiles(fd) {
    GALLERY_SLOTS.forEach(function (slot) {
      var file = document.getElementById(slot.file).files[0];
      if (file) fd.append(slot.field, file);
      if (slot.remove && document.getElementById(slot.remove).checked) {
        fd.append('remove_' + slot.field, 'true');
      }
    });
  }

  function openModal(product) {
    modalAlert.innerHTML = '';
    form.reset();
    resetGallerySlots();
    document.getElementById('fichaDetails').open = false;

    if (product) {
      document.getElementById('modalTitle').textContent = 'Editar producto';
      document.getElementById('f-original-sku').value = product.sku;
      document.getElementById('f-sku').value = product.sku;
      document.getElementById('f-sku').disabled = true;
      document.getElementById('f-name').value = product.name;
      document.getElementById('f-linea').value = product.linea || '';
      document.getElementById('f-formato').value = product.formato || '';
      document.getElementById('f-price').value = Math.round(product.price_cents / 100);
      document.getElementById('f-stock').value = product.stock_qty;
      document.getElementById('f-description').value = product.description || '';
      document.getElementById('f-active').checked = !!product.active;
      FICHA_FIELDS.forEach(function (pair) {
        document.getElementById(pair[0]).value = product[pair[1]] || '';
      });
      renderCombinaRows(product.sku, parseJsonField(product.combina_con));
      populateGallerySlots(product);
    } else {
      document.getElementById('modalTitle').textContent = 'Nuevo producto';
      document.getElementById('f-original-sku').value = '';
      document.getElementById('f-sku').disabled = false;
      document.getElementById('f-active').checked = true;
      renderCombinaRows('', []);
    }
    overlay.classList.add('open');
  }

  function closeModal() {
    overlay.classList.remove('open');
  }

  /* FormData con todos los campos de un producto ya cargado, para las
     acciones rapidas de tabla (activar/desactivar, guardar stock) que no
     pasan por el modal: un PUT reemplaza todo lo que manda, asi que hay
     que reenviar el contenido de ficha/bilingue/combina-con ya guardado
     para no perderlo — solo `overrides` cambia respecto al producto actual. */
  function buildPreservedFormData(p, overrides) {
    overrides = overrides || {};
    var fd = new FormData();
    fd.append('name', p.name);
    fd.append('linea', p.linea || '');
    fd.append('formato', p.formato || '');
    fd.append('price_cents', overrides.price_cents != null ? overrides.price_cents : p.price_cents);
    fd.append('stock_qty', overrides.stock_qty != null ? overrides.stock_qty : p.stock_qty);
    fd.append('active', (overrides.active != null ? overrides.active : p.active) ? 'true' : 'false');
    fd.append('description', p.description || '');
    FICHA_FIELDS.forEach(function (pair) {
      fd.append(pair[1], p[pair[1]] || '');
    });
    fd.append('combina_con', typeof p.combina_con === 'string' ? p.combina_con : '');
    return fd;
  }

  function saveStock(sku, newStock, inputEl) {
    var p = products.filter(function (pp) { return pp.sku === sku; })[0];
    if (!p) return;
    var fd = buildPreservedFormData(p, { stock_qty: newStock });
    inputEl.disabled = true;
    A.api('/products/' + sku, { method: 'PUT', body: fd }).then(function () {
      p.stock_qty = newStock;
      inputEl.disabled = false;
      inputEl.classList.toggle('low', newStock <= 5);
      inputEl.classList.add('saved');
      setTimeout(function () { inputEl.classList.remove('saved'); }, 1200);
    }).catch(function () {
      inputEl.disabled = false;
      inputEl.value = p.stock_qty;
      alertEl.innerHTML = '<div class="adm-alert adm-alert-error">No se pudo guardar el stock.</div>';
    });
  }

  document.getElementById('btnNew').addEventListener('click', function () { openModal(null); });
  document.getElementById('btnCancel').addEventListener('click', closeModal);
  overlay.addEventListener('click', function (e) { if (e.target === overlay) closeModal(); });
  wireGallerySlotPreviews();

  document.getElementById('productList').addEventListener('change', function (e) {
    var sku = e.target.getAttribute('data-stock');
    if (!sku) return;
    var value = parseInt(e.target.value, 10);
    if (!Number.isInteger(value) || value < 0) {
      var p = products.filter(function (pp) { return pp.sku === sku; })[0];
      e.target.value = p ? p.stock_qty : 0;
      return;
    }
    saveStock(sku, value, e.target);
  });

  document.getElementById('productList').addEventListener('click', function (e) {
    var editSku = e.target.getAttribute('data-edit');
    var toggleSku = e.target.getAttribute('data-toggle');
    var deleteSku = e.target.getAttribute('data-delete');

    if (editSku) {
      var product = products.filter(function (p) { return p.sku === editSku; })[0];
      if (product) openModal(product);
    } else if (toggleSku) {
      var p = products.filter(function (p) { return p.sku === toggleSku; })[0];
      if (!p) return;
      // gallery_images no se re-sube (son archivos, no texto) — al no
      // mandar ningun campo image_N ni remove_image_N, buildGalleryImages
      // en el servidor conserva los que ya estaban.
      var fd = buildPreservedFormData(p, { active: !p.active });
      A.api('/products/' + toggleSku, { method: 'PUT', body: fd }).then(load).catch(function () {
        alertEl.innerHTML = '<div class="adm-alert adm-alert-error">No se pudo cambiar el estado.</div>';
      });
    } else if (deleteSku) {
      if (!window.confirm('¿Eliminar "' + deleteSku + '" definitivamente? Esta acción no se puede deshacer.')) return;
      A.api('/products/' + deleteSku, { method: 'DELETE' }).then(load).catch(function () {
        alertEl.innerHTML = '<div class="adm-alert adm-alert-error">No se pudo eliminar el producto.</div>';
      });
    } else {
      // Tocar la foto/nombre/precio de la tarjeta (mobile) abre el modal
      // de edicion completo, igual que el boton "Editar" — no interfiere
      // con el stock inline ni los botones de accion, que estan fuera de
      // esta zona.
      var openArea = e.target.closest('[data-card-open]');
      if (openArea) {
        var sku = openArea.getAttribute('data-card-open');
        var product2 = products.filter(function (p) { return p.sku === sku; })[0];
        if (product2) openModal(product2);
      }
    }
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    modalAlert.innerHTML = '';
    var originalSku = document.getElementById('f-original-sku').value;
    var isEdit = !!originalSku;

    var fd = new FormData();
    if (!isEdit) fd.append('sku', document.getElementById('f-sku').value.trim());
    fd.append('name', document.getElementById('f-name').value.trim());
    fd.append('linea', document.getElementById('f-linea').value.trim());
    fd.append('formato', document.getElementById('f-formato').value.trim());
    fd.append('price_cents', Math.round(Number(document.getElementById('f-price').value) * 100));
    fd.append('stock_qty', document.getElementById('f-stock').value);
    fd.append('description', document.getElementById('f-description').value.trim());
    fd.append('active', document.getElementById('f-active').checked ? 'true' : 'false');
    FICHA_FIELDS.forEach(function (pair) {
      fd.append(pair[1], document.getElementById(pair[0]).value.trim());
    });
    fd.append('combina_con', collectCombinaCon());
    appendGalleryFiles(fd);

    var req = isEdit
      ? A.api('/products/' + originalSku, { method: 'PUT', body: fd })
      : A.api('/products', { method: 'POST', body: fd });

    req.then(function () {
      closeModal();
      return load();
    }).catch(function (err) {
      var msg = err.data && err.data.error === 'sku_ya_existe'
        ? 'Ese SKU ya existe.'
        : 'No se pudo guardar el producto. Revisá los datos.';
      modalAlert.innerHTML = '<div class="adm-alert adm-alert-error">' + msg + '</div>';
    });
  });

  A.guard('productos.html').then(load).catch(function () {});
})();
