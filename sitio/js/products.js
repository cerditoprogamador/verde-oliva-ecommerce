/* Sincroniza precio/stock/foto/contenido/idioma de la tienda publica con
 * lo que edita el admin en /admin/productos.html. Se carga en catalogo.html
 * y en cada producto-*.html (curada o generica), despues de cart.js.
 *
 * Piezas independientes, pueden aplicar varias en la misma pagina:
 *  1) syncProductCards() — toda card que enlaza a "producto-<sku>.html"
 *     (catalogo.html Y las mini-cards "combina con" de cada ficha):
 *     precio/foto/data-sku en vivo. Producto inactivo o sin stock -> se
 *     saca la card del DOM.
 *  2) syncOwnFicha() en una ficha CURADA (las 17 originales, HTML escrito
 *     a mano): aplica overrides opcionales, campo por campo — si el admin
 *     cargo un valor en espanol, pisa el nodo correspondiente (bilingue:
 *     usa la version en ingles del admin si existe y el sitio esta en
 *     ingles, si no cae a la version en espanol del admin — nunca al
 *     texto original curado, ver applyCuratedOverrides). Si el campo esta
 *     vacio, la ficha se queda con su copy original tal cual siempre estuvo,
 *     bilingue por el sistema data-i18n de siempre.
 *  3) syncOwnFicha() en la ficha GENERICA (producto-generic.html, servida
 *     por el server cuando no existe un .html propio): renderiza TODO el
 *     contenido desde cero, bilingue.
 *  4) La galeria de fotos (imagen principal + hasta 3 adicionales) se
 *     reconstruye — con miniaturas clickeables reales — en la ficha
 *     generica siempre, y en una ficha curada solo si el admin subio
 *     fotos de galeria (si no, se deja la galeria original intacta).
 */
(function () {
  'use strict';

  function fmt(pesos) {
    return '$' + Math.round(pesos).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  function applyAnchor(a, product) {
    var wrap = a.closest('.card-w') || a.closest('article');

    if (!product || product.stock_qty <= 0) {
      (wrap || a).remove();
      return;
    }

    var priceEl = a.querySelector('.card-p');
    if (priceEl) priceEl.textContent = fmt(product.price_cents / 100);
    var img = a.querySelector('img');
    if (img && product.image_path) img.src = product.image_path;

    if (wrap && wrap.classList.contains('card-w')) {
      wrap.dataset.precio = Math.round(product.price_cents / 100);
      var btn = wrap.querySelector('[data-add]');
      if (btn) {
        btn.setAttribute('data-sku', product.sku);
        btn.setAttribute('data-price', Math.round(product.price_cents / 100));
        btn.setAttribute('data-name', product.name);
      }
    }
  }

  function syncProductCards() {
    var anchors = document.querySelectorAll('a.card[href^="producto-"]');
    if (!anchors.length) return;

    fetch('/api/products')
      .then(function (r) { return r.json(); })
      .then(function (d) {
        var bySku = {};
        (d.products || []).forEach(function (p) { bySku[p.sku] = p; });
        anchors.forEach(function (a) {
          var m = a.getAttribute('href').match(/^producto-([a-z0-9-]+)\.html$/i);
          if (!m) return;
          applyAnchor(a, bySku[m[1]]);
        });
      })
      .catch(function (err) {
        console.error('[products] no se pudo sincronizar el catalogo:', err);
      });
  }

  /* ══ contenido bilingue dinamico (overrides + ficha generica) ══
   * El contenido que carga el admin es ES + un EN opcional (nunca el
   * ingles curado original de la pagina). Se registra cada elemento
   * pisado junto con sus dos versiones, y se vuelve a renderizar cada
   * vez que el usuario cambia de idioma — asi el override sigue vivo
   * en vez de que i18n.js lo revierta al texto original cacheado. */
  var bilingualTargets = [];

  function currentLang() {
    return document.documentElement.lang === 'en' ? 'en' : 'es';
  }

  function deI18n(el) {
    if (!el) return;
    el.removeAttribute('data-i18n');
    delete el.dataset.esCache;
  }

  function writeMultiline(el, text) {
    var lines = text.split('\n').map(function (l) { return l.trim(); }).filter(Boolean);
    if (!lines.length) return;
    if (el.tagName === 'UL' || el.tagName === 'OL') {
      el.innerHTML = lines.map(function (l) { return '<li>' + l + '</li>'; }).join('');
    } else {
      el.innerHTML = lines.map(function (l) { return '<p>' + l + '</p>'; }).join('');
    }
  }

  function renderBilingualTarget(t) {
    var text = (currentLang() === 'en' && t.en) ? t.en : t.es;
    if (t.multiline) {
      writeMultiline(t.el, text);
    } else {
      t.el.textContent = text;
    }
  }

  /* Registra un override bilingue de texto simple (una linea/parrafo). */
  function registerBilingual(el, es, en) {
    if (!el || !es) return;
    deI18n(el);
    var t = { el: el, es: es, en: en || '', multiline: false };
    bilingualTargets.push(t);
    renderBilingualTarget(t);
  }

  /* Idem, pero el texto puede tener varias lineas (separadas por \n) que
   * se convierten en <li> (si el destino es <ul>/<ol>) o <p> (si no). */
  function registerBilingualBody(el, es, en) {
    if (!el || !es) return;
    deI18n(el);
    var t = { el: el, es: es, en: en || '', multiline: true };
    bilingualTargets.push(t);
    renderBilingualTarget(t);
  }

  document.addEventListener('vo:lang-changed', function () {
    bilingualTargets.forEach(renderBilingualTarget);
  });

  /* Matchea un <details> del acordeon por el espanol original: dataset.esCache
   * (si i18n.js ya trad	ujo la pagina antes de que esta fetch resuelva) o el
   * texto visible actual (si i18n.js todavia no corrio) — nunca por texto
   * en ingles, que no es estable ni parte del contrato de esta funcion. */
  function findAccordionBodyBySummary(summaryText) {
    var summaries = document.querySelectorAll('.acc summary');
    for (var i = 0; i < summaries.length; i++) {
      var original = summaries[i].dataset.esCache || summaries[i].textContent.trim();
      if (original === summaryText) {
        return summaries[i].parentElement.querySelector('.body');
      }
    }
    return null;
  }

  function overrideCombinaWhy(combinaCon) {
    if (!combinaCon || !combinaCon.length) return;
    combinaCon.forEach(function (entry) {
      if (!entry.why) return;
      var a = document.querySelector('a.card[href="producto-' + entry.sku + '.html"]');
      if (!a) return;
      var why = a.querySelector('.card-why');
      if (why) registerBilingual(why, entry.why, entry.why_en);
    });
  }

  function applyCuratedOverrides(p) {
    registerBilingual(document.querySelector('.info .lead'), p.ficha_lead, p.ficha_lead_en);
    registerBilingual(document.querySelector('.warn p'), p.que_esperar, p.que_esperar_en);
    registerBilingual(document.querySelector('.dark .wrap p[data-i18n^="origen"]'), p.origen, p.origen_en);
    registerBilingualBody(findAccordionBodyBySummary('Ingredientes (INCI)'), p.ingredientes_inci, p.ingredientes_inci_en);
    registerBilingualBody(findAccordionBodyBySummary('Seguridad'), p.seguridad, p.seguridad_en);

    // Orden fijo por regla de marca (brand/07): para qué sirve, para qué
    // piel, cuándo, cómo — en ese orden, en cada una de las 17 fichas.
    var qaFields = [
      [p.para_que_sirve, p.para_que_sirve_en],
      [p.para_que_piel, p.para_que_piel_en],
      [p.cuando_usar, p.cuando_usar_en],
      [p.como_usar, p.como_usar_en],
    ];
    document.querySelectorAll('.qa .q').forEach(function (card, i) {
      var pair = qaFields[i];
      if (!pair || !pair[0]) return;
      var body = card.querySelector('p, ul, ol');
      registerBilingualBody(body, pair[0], pair[1]);
    });

    overrideCombinaWhy(p.combina_con);
  }

  /* ══ galeria de fotos (principal + hasta 3 adicionales) ══
   * Mismo patron visual/interactivo que ya tenian las 17 fichas curadas
   * (grid .gal con un .main grande + botones .th clickeables), pero con
   * fotos reales en vez de ilustraciones SVG — reconstruido en JS para
   * poder alimentarlo con los paths que suba el admin. */
  function renderGallery(galEl, images, altText) {
    if (!galEl || !images.length) return;
    var safeAlt = (altText || '').replace(/"/g, '&quot;');
    var mainHtml = '<div class="ph ph4 main" id="gmain" role="img" aria-label="' + safeAlt + '">' +
      '<img src="' + images[0] + '" alt="' + safeAlt + '" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover"></div>';
    var thumbsHtml = '';
    if (images.length > 1) {
      thumbsHtml = images.map(function (src, i) {
        return '<button class="ph ph4 th" type="button" aria-current="' + (i === 0 ? 'true' : 'false') +
          '" data-img="' + src + '" aria-label="Ver foto ' + (i + 1) + '">' +
          '<img src="' + src + '" alt="" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover"></button>';
      }).join('');
    }
    galEl.innerHTML = mainHtml + thumbsHtml;

    var mainImg = galEl.querySelector('#gmain img');
    galEl.querySelectorAll('.th').forEach(function (btn) {
      btn.addEventListener('click', function () {
        galEl.querySelectorAll('.th').forEach(function (b) { b.setAttribute('aria-current', 'false'); });
        btn.setAttribute('aria-current', 'true');
        mainImg.src = btn.getAttribute('data-img');
      });
    });
  }

  function galleryImagesFor(p) {
    return [p.image_path].concat(p.gallery_images || []).filter(Boolean);
  }

  /* ══ render completo de la ficha generica (SKU sin .html propio) ══ */

  function qaCardHtml(icon, label) {
    return '<div class="q"><h3><svg width="20" height="20"><use href="#' + icon + '"/></svg><span>' + label +
      '</span></h3><p></p></div>';
  }

  function buildCombinaCard(entry, product) {
    var art = document.createElement('article');
    var priceHtml = product ? '<p class="card-p">' + fmt(product.price_cents / 100) + '</p>' : '';
    var imgSrc = product && product.image_path ? product.image_path : '';
    art.innerHTML =
      '<a class="card" href="producto-' + entry.sku + '.html">' +
        '<div class="ph ph2"><img src="' + imgSrc + '" alt="" loading="lazy"></div>' +
        '<div class="card-b">' +
          '<h3 class="card-t"></h3>' +
          priceHtml +
          '<p class="card-why"></p>' +
        '</div>' +
      '</a>';
    art.querySelector('.card-t').textContent = product ? product.name : entry.sku;
    registerBilingual(art.querySelector('.card-why'), entry.why || '', entry.why_en);
    return art;
  }

  function renderGenericFicha(p) {
    document.title = p.name + ' — Verde Oliva Olivoterapia';
    document.getElementById('gf-crumb').textContent = p.name;
    document.getElementById('gf-kicker').textContent = p.linea || '';
    document.getElementById('gf-name').textContent = p.name;
    document.getElementById('gf-price').textContent = fmt(p.price_cents / 100);

    var pmeta = document.getElementById('gf-pmeta');
    var tags = [p.formato, p.para_que_piel].filter(Boolean);
    pmeta.innerHTML = tags.map(function (t) { return '<span class="tagl">' + t + '</span>'; }).join('');

    if (p.ficha_lead) {
      var leadEl = document.getElementById('gf-lead');
      registerBilingual(leadEl, p.ficha_lead, p.ficha_lead_en);
      leadEl.hidden = false;
    }

    renderGallery(document.getElementById('gf-gallery'), galleryImagesFor(p), p.name);

    if (p.stock_qty <= 0) {
      document.getElementById('gf-stock').hidden = true;
      var addBtn = document.getElementById('add');
      addBtn.disabled = true;
      addBtn.textContent = 'Agotado';
    }

    // Bloque educativo: cada tarjeta solo aparece si el admin cargo ese campo.
    var qa = [
      ['i-droplet', 'Para qué sirve', p.para_que_sirve, p.para_que_sirve_en],
      ['i-leaf', 'Para qué piel', p.para_que_piel, p.para_que_piel_en],
      ['i-clock', 'Cuándo usarlo', p.cuando_usar, p.cuando_usar_en],
      ['i-hand', 'Cómo se usa', p.como_usar, p.como_usar_en],
    ].filter(function (row) { return row[2]; });

    if (qa.length) {
      var qaEl = document.getElementById('gf-qa');
      qaEl.innerHTML = qa.map(function (row) { return qaCardHtml(row[0], row[1]); }).join('');
      qaEl.querySelectorAll('.q').forEach(function (card, i) {
        registerBilingualBody(card.querySelector('p'), qa[i][2], qa[i][3]);
      });
      document.getElementById('gf-edu').hidden = false;
    }

    if (p.que_esperar) {
      registerBilingualBody(document.getElementById('gf-warn-text'), p.que_esperar, p.que_esperar_en);
      document.getElementById('gf-warn').hidden = false;
      document.getElementById('gf-edu').hidden = false;
    }

    if (p.origen) {
      registerBilingual(document.getElementById('gf-origen'), p.origen, p.origen_en);
    }

    if (p.ingredientes_inci) {
      registerBilingual(document.getElementById('gf-ingredientes'), p.ingredientes_inci, p.ingredientes_inci_en);
    }
    if (p.seguridad) {
      registerBilingual(document.getElementById('gf-seguridad'), p.seguridad, p.seguridad_en);
    }

    if (p.combina_con && p.combina_con.length) {
      Promise.all(p.combina_con.map(function (entry) {
        return fetch('/api/products/' + entry.sku).then(function (r) { return r.ok ? r.json() : null; })
          .then(function (d) { return { entry: entry, product: d && d.product }; })
          .catch(function () { return { entry: entry, product: null }; });
      })).then(function (results) {
        var grid = document.getElementById('gf-combina-grid');
        results.forEach(function (r) { grid.appendChild(buildCombinaCard(r.entry, r.product)); });
        document.getElementById('gf-combina-section').hidden = false;
      });
    }
  }

  function syncOwnFicha() {
    var m = location.pathname.match(/producto-([a-z0-9-]+)\.html$/i);
    if (!m) return;
    var sku = m[1];
    var isGeneric = document.body.hasAttribute('data-generic-ficha');

    fetch('/api/products/' + sku)
      .then(function (r) {
        if (!r.ok) throw new Error('not_found');
        return r.json();
      })
      .then(function (d) {
        var p = d.product;
        window.VOCurrentProduct = {
          sku: p.sku,
          name: p.name,
          price: Math.round(p.price_cents / 100),
        };

        if (isGeneric) {
          renderGenericFicha(p);
          return;
        }

        // Ficha curada: precio/stock ya se pisan siempre (igual que antes);
        // la galeria solo se reconstruye si el admin subio fotos extra
        // (si no, se deja la galeria original con sus miniaturas intacta,
        // solo se actualiza la foto principal). El contenido educativo
        // solo se pisa si el admin cargo un valor.
        var priceEl = document.querySelector('.price');
        if (priceEl) priceEl.textContent = fmt(p.price_cents / 100);

        var galleryImages = galleryImagesFor(p);
        if (p.gallery_images && p.gallery_images.length) {
          renderGallery(document.querySelector('.gal'), galleryImages, p.name);
        } else if (p.image_path) {
          var main = document.querySelector('#gmain img');
          if (main) main.src = p.image_path;
          // La primera miniatura ("ver el envase") es la misma foto que la
          // principal en las 17 fichas originales — si no, un click ahi
          // volvería a mostrar la foto vieja que quedó hardcodeada en su
          // data-img.
          var firstThumb = document.querySelector('.gal .th[data-img]');
          if (firstThumb) {
            firstThumb.setAttribute('data-img', p.image_path);
            var thumbImg = firstThumb.querySelector('img');
            if (thumbImg) thumbImg.src = p.image_path;
          }
        }

        if (p.stock_qty <= 0) {
          var addBtn = document.getElementById('add');
          if (addBtn) {
            addBtn.disabled = true;
            addBtn.textContent = 'Agotado';
          }
        }
        applyCuratedOverrides(p);
      })
      .catch(function (err) {
        // Ficha curada: si la API no responde o el sku no existe mas, se
        // queda con los valores estaticos originales (nunca rompe la
        // compra). Ficha generica: no hay fallback posible (no hay copy
        // hardcodeado) — esto solo pasaria si el producto fue borrado
        // justo despues de cargar la pagina.
        console.error('[products] no se pudo sincronizar la ficha:', err);
      });
  }

  document.addEventListener('DOMContentLoaded', function () {
    syncProductCards();
    syncOwnFicha();
  });
})();
