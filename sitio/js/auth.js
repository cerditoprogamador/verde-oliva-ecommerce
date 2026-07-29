/* Login con Google + gate de checkout, real (no demo).
   Depende de window.VOCart (cart.js) para leer el evento 'vo:checkout-request'
   y de window.VO_I18N_COMMON (i18n-common.js) para el copy en inglés del modal
   que este script inyecta — por eso este <script src> va después de esos dos
   en las 3 páginas. No depende de i18n.js: si el usuario ya tiene 'en' guardado,
   este script traduce sus propios nodos apenas los inyecta (ver primeI18nNode/
   primeI18nAria más abajo) en vez de esperar a que i18n.js vuelva a correr. */
(function(){
  'use strict';

  /* ── Google Cloud OAuth Client ID ──────────────────────────────────────
     PLACEHOLDER: no existe todavía un proyecto real en Google Cloud Console.
     Reemplazar por el Client ID real antes de que el login funcione, y
     asegurarse de que ese proyecto tenga, en "Authorized JavaScript origins",
     el dominio real donde esto quede publicado (p. ej. https://verdeoliva.com.ar). */
  var GOOGLE_CLIENT_ID = 'REPLACE_WITH_REAL_GOOGLE_CLIENT_ID';

  var LANG_KEY = 'vo-lang';
  function isEn(){
    try{ return localStorage.getItem(LANG_KEY) === 'en'; }
    catch(e){ return false; }
  }
  function dictValue(key){
    return (window.VO_I18N_COMMON && window.VO_I18N_COMMON[key] != null) ? window.VO_I18N_COMMON[key] : null;
  }
  /* texto dinámico (no ligado a un nodo data-i18n existente, p.ej. el toast) */
  function t(key, fallbackEs){
    if(isEn()){
      var v = dictValue(key);
      if(v != null) return v;
    }
    return fallbackEs;
  }
  /* Misma lógica de caché que i18n.js (dataset.esCache / esAriaCache), para que
     un toggle posterior de idioma no rompa por nodos que este script ya tradujo
     "a mano" en la carga inicial. */
  function primeI18nNode(el){
    var key = el.getAttribute('data-i18n');
    if(!key) return;
    if(el.dataset.esCache === undefined) el.dataset.esCache = el.innerHTML;
    if(isEn()){
      var v = dictValue(key);
      if(v != null) el.innerHTML = v;
    }
  }
  function primeI18nAria(el){
    var key = el.getAttribute('data-i18n-aria');
    if(!key) return;
    if(el.dataset.esAriaCache === undefined) el.dataset.esAriaCache = el.getAttribute('aria-label') || '';
    if(isEn()){
      var v = dictValue(key);
      if(v != null) el.setAttribute('aria-label', v);
    }
  }
  function primeScope(scopeEl){
    scopeEl.querySelectorAll('[data-i18n]').forEach(primeI18nNode);
    scopeEl.querySelectorAll('[data-i18n-aria]').forEach(primeI18nAria);
  }

  function escapeHtml(s){
    return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
    });
  }

  /* ── estado ── */
  var currentUser = null;
  var pendingCheckoutDetail = null; /* items/subtotal a reintentar tras login */
  var openedFromCheckout = false;

  /* ══ 1. Modal de login — inyectado sincrónicamente, apenas corre este script,
     sin esperar DOMContentLoaded, para que i18n.js (si ya corrió) o el propio
     priming de arriba lo dejen en el idioma correcto antes de que se vea. ══ */
  function buildModal(){
    if(document.querySelector('[data-vo-auth-modal]')) return;
    document.head.insertAdjacentHTML('beforeend',
      '<style>'+
      '.vo-auth-overlay{position:fixed;inset:0;background:rgba(28,25,23,.5);z-index:198;opacity:0;pointer-events:none;transition:opacity .25s ease}'+
      '.vo-auth-overlay.open{opacity:1;pointer-events:auto}'+
      '.vo-auth-modal{position:fixed;top:50%;left:50%;transform:translate(-50%,-46%);width:min(380px,92vw);'+
      ' background:var(--crema,#F7F4EC);z-index:199;border-radius:3px;box-shadow:0 24px 64px -16px rgba(28,25,23,.4);'+
      ' opacity:0;pointer-events:none;transition:opacity .25s ease,transform .25s ease;'+
      ' font-family:var(--fb,Inter,sans-serif);padding:1.6rem 1.5rem 1.8rem}'+
      '.vo-auth-modal.open{opacity:1;pointer-events:auto;transform:translate(-50%,-50%)}'+
      '.vo-auth-head{display:flex;align-items:flex-start;justify-content:space-between;gap:1rem;margin-bottom:.2rem}'+
      '.vo-auth-head h2{font-family:var(--fs,serif);font-size:1.5rem;margin:0}'+
      '.vo-auth-close{background:none;border:0;font-size:1.4rem;line-height:1;cursor:pointer;color:var(--corteza,#1C1917);padding:.2rem .4rem;flex:none}'+
      '.vo-auth-context{font-size:.88rem;color:var(--tinta,#54584B);margin:.3rem 0 1.3rem}'+
      '.vo-auth-btnwrap{display:flex;justify-content:center;padding:.2rem 0 .3rem;min-height:44px}'+
      '.vo-auth-error{font-size:.82rem;color:var(--terra-t,#A25C3D);margin-top:1rem;display:none}'+
      '.vo-auth-error.show{display:block}'+
      '.vo-acct-wrap{position:relative;display:inline-flex}'+
      '.vo-acct-menu{position:absolute;top:calc(100% + 6px);right:0;background:var(--crema,#F7F4EC);'+
      ' border:1px solid var(--linea,rgba(58,68,51,.18));border-radius:2px;box-shadow:0 12px 32px -12px rgba(28,25,23,.3);'+
      ' min-width:150px;z-index:60;display:none}'+
      '.vo-acct-menu.open{display:block}'+
      '.vo-acct-menu button{display:block;width:100%;text-align:left;background:none;border:0;padding:.75rem 1rem;'+
      ' font:500 .82rem var(--fb,Inter,sans-serif);color:var(--corteza,#1C1917);cursor:pointer}'+
      '.vo-acct-menu button:hover{background:rgba(58,68,51,.07)}'+
      '.vo-acct-name{font:600 .74rem/1 var(--fb,Inter,sans-serif);color:var(--oliva,#3A4433);padding:0 .3rem;'+
      ' max-width:96px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}'+
      '.vo-acct-avatar{width:28px;height:28px;border-radius:50%;object-fit:cover;display:block}'+
      '.iconbtn.vo-acct-signed{width:auto;min-width:44px;padding:0 .5rem}'+
      '.vo-toast{position:fixed;left:50%;bottom:22px;transform:translateX(-50%) translateY(12px);z-index:299;'+
      ' background:var(--oliva,#3A4433);color:var(--crema,#F7F4EC);font:500 .85rem/1.4 var(--fb,Inter,sans-serif);'+
      ' padding:.85rem 1.2rem;border-radius:2px;max-width:min(360px,86vw);text-align:center;box-shadow:0 12px 32px -10px rgba(28,25,23,.4);'+
      ' opacity:0;pointer-events:none;transition:opacity .25s ease,transform .25s ease}'+
      '.vo-toast.show{opacity:1;transform:translateX(-50%) translateY(0)}'+
      '</style>'
    );
    document.body.insertAdjacentHTML('beforeend',
      '<div class="vo-auth-overlay" data-vo-auth-overlay hidden></div>'+
      '<div class="vo-auth-modal" data-vo-auth-modal role="dialog" aria-modal="true" aria-labelledby="vo-auth-h" hidden>'+
      '  <div class="vo-auth-head">'+
      '    <h2 id="vo-auth-h" data-i18n="auth-titulo">Iniciar sesión</h2>'+
      '    <button type="button" class="vo-auth-close" data-vo-auth-close aria-label="Cerrar" data-i18n-aria="auth-cerrar-aria">&times;</button>'+
      '  </div>'+
      '  <p class="vo-auth-context" data-vo-auth-context hidden data-i18n="auth-contexto-checkout">Necesitás iniciar sesión para finalizar la compra</p>'+
      '  <div class="vo-auth-btnwrap" id="g_id_signin"></div>'+
      '  <p class="vo-auth-error" data-vo-auth-error data-i18n="auth-error">No pudimos iniciar sesión. Intentá de nuevo.</p>'+
      '</div>'
    );
    primeScope(document.querySelector('[data-vo-auth-modal]'));
  }

  function openModal(fromCheckout){
    openedFromCheckout = !!fromCheckout;
    var overlay = document.querySelector('[data-vo-auth-overlay]');
    var modal = document.querySelector('[data-vo-auth-modal]');
    var ctx = document.querySelector('[data-vo-auth-context]');
    var err = document.querySelector('[data-vo-auth-error]');
    if(!overlay || !modal) return;
    if(err) err.classList.remove('show');
    if(ctx) ctx.hidden = !openedFromCheckout;
    overlay.hidden = false; modal.hidden = false;
    requestAnimationFrame(function(){ overlay.classList.add('open'); modal.classList.add('open'); });
    renderGoogleButton();
  }
  function closeModal(){
    var overlay = document.querySelector('[data-vo-auth-overlay]');
    var modal = document.querySelector('[data-vo-auth-modal]');
    if(!overlay || !modal) return;
    overlay.classList.remove('open'); modal.classList.remove('open');
    setTimeout(function(){ overlay.hidden = true; modal.hidden = true; }, 250);
  }
  function showModalError(){
    var err = document.querySelector('[data-vo-auth-error]');
    if(err) err.classList.add('show');
  }

  /* ══ 2. Toast simple para errores de checkout (no depende del drawer de cart.js) ══ */
  function showToast(msg){
    var el = document.querySelector('[data-vo-toast]');
    if(!el){
      document.body.insertAdjacentHTML('beforeend', '<div data-vo-toast class="vo-toast" role="status" aria-live="polite"></div>');
      el = document.querySelector('[data-vo-toast]');
    }
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(el._voToastT);
    el._voToastT = setTimeout(function(){ el.classList.remove('show'); }, 4500);
  }

  /* ══ 3. Google Identity Services: init + render, con poll porque el <script>
     de accounts.google.com/gsi/client es async/defer y puede no estar listo
     todavía cuando este script corre. ══ */
  var gisInited = false;
  function gisAvailable(){ return !!(window.google && google.accounts && google.accounts.id); }
  function initGis(){
    if(gisInited || !gisAvailable()) return;
    google.accounts.id.initialize({ client_id: GOOGLE_CLIENT_ID, callback: handleCredentialResponse });
    gisInited = true;
  }
  function ensureGis(cb){
    if(gisAvailable()){ initGis(); if(cb) cb(); return; }
    var tries = 0;
    var iv = setInterval(function(){
      tries++;
      if(gisAvailable()){
        clearInterval(iv);
        initGis();
        if(cb) cb();
      } else if(tries > 100){ /* ~20s */
        clearInterval(iv);
        console.warn('[VO auth] Google Identity Services no cargó (revisar red/adblock, o que GOOGLE_CLIENT_ID ya esté configurado).');
      }
    }, 200);
  }
  function renderGoogleButton(){
    var target = document.getElementById('g_id_signin');
    if(!target) return;
    ensureGis(function(){
      target.innerHTML = '';
      try{
        google.accounts.id.renderButton(target, { theme:'outline', size:'large', text:'signin_with' });
      }catch(err){
        console.error('[VO auth] no se pudo renderizar el botón de Google', err);
      }
    });
  }

  function handleCredentialResponse(response){
    fetch('/api/auth/google', {
      method:'POST',
      headers:{ 'Content-Type':'application/json', 'X-Requested-With':'XMLHttpRequest' },
      credentials:'same-origin',
      body: JSON.stringify({ credential: response && response.credential })
    }).then(function(res){
      if(!res.ok) throw new Error('POST /api/auth/google -> '+res.status);
      return refreshAuthState();
    }).then(function(){
      closeModal();
      if(openedFromCheckout && pendingCheckoutDetail){
        var detail = pendingCheckoutDetail;
        pendingCheckoutDetail = null;
        startCheckout(detail);
      }
      openedFromCheckout = false;
    }).catch(function(err){
      console.error('[VO auth] falló el login con Google', err);
      showModalError();
    });
  }

  /* ══ 4. Estado de sesión — GET /api/me ══ */
  function fetchMe(){
    return fetch('/api/me', { credentials:'same-origin' })
      .then(function(res){
        if(res.status === 401) return { user:null };
        if(!res.ok) throw new Error('GET /api/me -> '+res.status);
        return res.json();
      })
      .then(function(data){ return (data && data.user) ? data.user : null; })
      .catch(function(err){
        /* Esperable en desarrollo si api/ todavía no corre: no es un bug de este script. */
        console.warn('[VO auth] no se pudo consultar /api/me (esperable si el backend no está corriendo todavía):', err && err.message ? err.message : err);
        return null;
      });
  }

  function ensureAcctWrapper(){
    var btn = document.querySelector('.iconbtn[data-i18n-aria="cuenta-aria"]');
    if(!btn) return null;
    if(btn.closest('.vo-acct-wrap')) return btn;
    var wrap = document.createElement('span');
    wrap.className = 'vo-acct-wrap';
    btn.parentNode.insertBefore(wrap, btn);
    wrap.appendChild(btn);
    wrap.insertAdjacentHTML('beforeend',
      '<div class="vo-acct-menu" data-vo-acct-menu>'+
      '<button type="button" data-vo-logout data-i18n="auth-logout">Cerrar sesión</button>'+
      '</div>'
    );
    primeScope(wrap);
    return btn;
  }
  function closeAcctMenu(){
    var m = document.querySelector('[data-vo-acct-menu]');
    if(m) m.classList.remove('open');
  }
  function toggleAcctMenu(){
    var m = document.querySelector('[data-vo-acct-menu]');
    if(m) m.classList.toggle('open');
  }

  function renderAccountIcon(user){
    currentUser = user;
    var btn = ensureAcctWrapper();
    if(!btn) return;
    closeAcctMenu();
    if(user){
      btn.classList.add('vo-acct-signed');
      if(user.picture){
        btn.innerHTML = '<img class="vo-acct-avatar" src="'+escapeHtml(user.picture)+'" alt="">';
      } else {
        var first = (user.name || user.email || '').trim().split(/\s+/)[0] || '';
        btn.innerHTML = '<span class="vo-acct-name">'+escapeHtml(first)+'</span>';
      }
    } else {
      btn.classList.remove('vo-acct-signed');
      btn.innerHTML = '<svg class="ic" width="20" height="20"><use href="#i-user"/></svg>';
    }
  }

  function refreshAuthState(){
    return fetchMe().then(function(user){
      renderAccountIcon(user);
      return user;
    });
  }

  /* ══ 5. Checkout — dispara desde el evento de cart.js ══ */
  function startCheckout(detail){
    var items = (detail && detail.items || []).map(function(i){ return { sku:i.sku, qty:i.qty }; });
    fetch('/api/checkout', {
      method:'POST',
      headers:{ 'Content-Type':'application/json', 'X-Requested-With':'XMLHttpRequest' },
      credentials:'same-origin',
      body: JSON.stringify({ items: items })
    }).then(function(res){
      if(!res.ok){
        return res.json().catch(function(){ return null; }).then(function(body){
          throw new Error((body && body.error) || ('POST /api/checkout -> '+res.status));
        });
      }
      return res.json();
    }).then(function(data){
      if(!data || !data.init_point) throw new Error('respuesta de /api/checkout sin init_point');
      window.location.href = data.init_point;
    }).catch(function(err){
      console.error('[VO auth] no se pudo iniciar el checkout', err);
      showToast(t('auth-checkout-error', 'No pudimos iniciar el pago. Intentá de nuevo.'));
    });
  }

  document.addEventListener('vo:checkout-request', function(e){
    var detail = (e && e.detail) || { items:[], subtotal:0 };
    fetchMe().then(function(user){
      renderAccountIcon(user);
      if(user){
        startCheckout(detail);
      } else {
        pendingCheckoutDetail = detail;
        openModal(true);
      }
    });
  });

  /* ══ 6. Delegación de eventos ══ */
  document.addEventListener('click', function(e){
    var acctBtn = e.target.closest('.iconbtn[data-i18n-aria="cuenta-aria"]');
    if(acctBtn){
      if(currentUser){ toggleAcctMenu(); }
      else { pendingCheckoutDetail = null; openModal(false); }
      return;
    }
    if(e.target.closest('[data-vo-logout]')){
      fetch('/api/auth/logout', {
        method:'POST',
        headers:{ 'X-Requested-With':'XMLHttpRequest' },
        credentials:'same-origin'
      }).catch(function(err){
        console.warn('[VO auth] logout request falló (revisando igual el estado local):', err && err.message ? err.message : err);
      }).then(function(){ return refreshAuthState(); });
      return;
    }
    if(e.target.closest('[data-vo-auth-close]') || e.target.closest('[data-vo-auth-overlay]')){
      closeModal();
      return;
    }
    if(!e.target.closest('.vo-acct-wrap')) closeAcctMenu();
  });
  document.addEventListener('keydown', function(e){
    if(e.key !== 'Escape') return;
    var modal = document.querySelector('[data-vo-auth-modal]');
    if(modal && modal.classList.contains('open')){ closeModal(); return; }
    closeAcctMenu();
  });

  /* ══ arranque ══ */
  buildModal();
  ensureAcctWrapper();
  ensureGis();
  refreshAuthState();
})();
