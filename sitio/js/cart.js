/* Carrito real de Verde Oliva: modelo de datos persistente + drawer.
   Expone window.VOCart para que cada página lo use desde su propio script inline
   (ritual builder de index.html, stepper de cada producto-*.html, etc.). */
(function(){
  var KEY='vo-cart';

  function read(){
    try{ var v=JSON.parse(localStorage.getItem(KEY)); return Array.isArray(v)?v:[]; }
    catch(e){ return []; }
  }
  function persist(items){
    localStorage.setItem(KEY, JSON.stringify(items));
    renderBadge();
    renderDrawer();
  }
  function count(){ return read().reduce(function(n,i){ return n+i.qty; },0); }
  function subtotal(){ return read().reduce(function(n,i){ return n+i.qty*i.price; },0); }

  function add(sku,name,price,qty){
    qty = qty||1;
    if(!sku) return;
    var items = read();
    var it = items.filter(function(i){ return i.sku===sku; })[0];
    if(it) it.qty += qty;
    else items.push({sku:sku,name:name,price:price||0,qty:qty});
    persist(items);
  }
  function setQty(sku,qty){
    var items = read();
    if(qty<=0){ items = items.filter(function(i){ return i.sku!==sku; }); }
    else { var it=items.filter(function(i){ return i.sku===sku; })[0]; if(it) it.qty=qty; }
    persist(items);
  }
  function remove(sku){
    persist(read().filter(function(i){ return i.sku!==sku; }));
  }
  function clear(){ persist([]); }

  window.VOCart = {add:add, remove:remove, setQty:setQty, clear:clear, items:read, subtotal:subtotal, count:count};

  /* ── formato de precio, consistente con el resto del sitio ($19.000) ── */
  function fmt(n){
    return '$'+Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g,'.');
  }

  /* ── derivar producto desde el DOM: nunca inventar datos nuevos ──
     El slug de imagen (img/productos/<slug>.jpg) es el identificador estable
     que ya existe en todo el sitio; se usa como sku por defecto. */
  function slugify(s){
    return (s||'').toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g,'')
      .replace(/[^a-z0-9]+/g,'-').replace(/(^-+|-+$)/g,'');
  }
  function parsePrice(str){
    var digits=(str||'').replace(/[^0-9]/g,'');
    return digits ? parseInt(digits,10) : 0;
  }
  function resolve(trigger){
    var container = trigger.closest('.card-w') || trigger.closest('.gourmet-buy')
      || trigger.closest('.buy') || trigger.closest('.info') || document.body;

    var sku = trigger.getAttribute('data-sku');
    var name = trigger.getAttribute('data-name');
    var priceAttr = trigger.getAttribute('data-price');
    var price = priceAttr ? parseInt(priceAttr,10) : null;

    if(!name){
      var nameEl = container.querySelector('.card-t') || document.querySelector('h1');
      name = nameEl ? nameEl.textContent.trim() : trigger.textContent.trim();
    }
    if(price==null){
      if(container.dataset && container.dataset.precio){
        price = parseInt(container.dataset.precio,10);
      } else {
        var priceEl = container.querySelector('.card-p') || document.querySelector('.gourmet-price') || document.querySelector('.price');
        price = parsePrice(priceEl ? priceEl.textContent : '');
      }
    }
    if(!sku){
      var img = container.querySelector('img[src*="img/productos/"]');
      var m = img && img.getAttribute('src').match(/img\/productos\/([a-z0-9-]+)\.jpg/i);
      sku = m ? m[1] : slugify(name);
    }
    return {sku:sku, name:name, price:price||0};
  }

  /* ── UI: badge del header ── */
  function renderBadge(){
    var n=count();
    document.querySelectorAll('[data-cart]').forEach(function(b){ b.textContent=n; });
  }

  /* ── UI: drawer ── */
  var drawer, overlay, body, subtotalEl;

  function buildDrawer(){
    if(document.querySelector('[data-vo-cart-drawer]')) return;
    document.head.insertAdjacentHTML('beforeend',
      '<style>'+
      '.vo-cart-overlay{position:fixed;inset:0;background:rgba(28,25,23,.5);z-index:98;opacity:0;pointer-events:none;transition:opacity .25s ease}'+
      '.vo-cart-overlay.open{opacity:1;pointer-events:auto}'+
      '.vo-cart-drawer{position:fixed;top:0;right:0;bottom:0;width:min(400px,92vw);background:var(--crema);z-index:99;'+
      ' box-shadow:-12px 0 32px -12px rgba(28,25,23,.35);transform:translateX(100%);transition:transform .3s cubic-bezier(.22,.61,.36,1);'+
      ' display:flex;flex-direction:column;font-family:var(--fb, Inter, sans-serif)}'+
      '.vo-cart-drawer.open{transform:translateX(0)}'+
      '.vo-cart-head{display:flex;align-items:center;justify-content:space-between;padding:1.2rem 1.3rem;border-bottom:1px solid var(--linea,rgba(58,68,51,.18))}'+
      '.vo-cart-head h2{font-family:var(--fs,serif);font-size:1.4rem;margin:0}'+
      '.vo-cart-head button{background:none;border:0;font-size:1.4rem;line-height:1;cursor:pointer;color:var(--corteza,#1C1917);padding:.3rem .6rem}'+
      '.vo-cart-body{flex:1;overflow-y:auto;padding:.4rem 1.3rem}'+
      '.vo-cart-empty{color:var(--tinta,#54584B);font-size:.92rem;padding:2rem 0;text-align:center}'+
      '.vo-cart-item{display:flex;align-items:center;gap:.7rem;padding:1rem 0;border-bottom:1px solid var(--linea-f,rgba(58,68,51,.10))}'+
      '.vo-cart-item-info{flex:1;min-width:0}'+
      '.vo-cart-item-name{font-size:.92rem;color:var(--corteza,#1C1917);margin:0 0 .2rem;font-weight:500}'+
      '.vo-cart-item-price{font-size:.8rem;color:var(--tinta,#54584B);margin:0}'+
      '.vo-cart-qty{display:inline-flex;align-items:center;border:1px solid var(--linea,rgba(58,68,51,.18));border-radius:2px;flex:none}'+
      '.vo-cart-qty button{width:30px;height:32px;background:none;border:0;color:var(--oliva,#3A4433);cursor:pointer;font-size:.9rem}'+
      '.vo-cart-qty span{min-width:24px;display:inline-block;text-align:center;font:500 .85rem var(--fb,Inter,sans-serif)}'+
      '.vo-cart-remove{background:none;border:0;color:var(--tinta,#54584B);cursor:pointer;font-size:1.1rem;padding:.2rem .4rem;flex:none}'+
      '.vo-cart-remove:hover{color:var(--terra,#C67B5C)}'+
      '.vo-cart-foot{border-top:1px solid var(--linea,rgba(58,68,51,.18));padding:1.1rem 1.3rem 1.3rem;display:grid;gap:.6rem}'+
      '.vo-cart-sub{display:flex;justify-content:space-between;font:500 1.05rem/1 var(--fb,Inter,sans-serif);margin-bottom:.3rem}'+
      '</style>'
    );
    document.body.insertAdjacentHTML('beforeend',
      '<div class="vo-cart-overlay" data-vo-cart-overlay hidden></div>'+
      '<aside class="vo-cart-drawer" data-vo-cart-drawer role="dialog" aria-modal="true" aria-label="Carrito" hidden>'+
      '  <div class="vo-cart-head"><h2>Tu carrito</h2><button type="button" data-vo-cart-close aria-label="Cerrar carrito">&times;</button></div>'+
      '  <div class="vo-cart-body" data-vo-cart-body></div>'+
      '  <div class="vo-cart-foot">'+
      '    <div class="vo-cart-sub"><span>Subtotal</span><span data-vo-cart-subtotal>$0</span></div>'+
      '    <button class="btn btn-block" type="button" data-vo-cart-checkout>Finalizar compra</button>'+
      '    <button class="btn btn-ghost btn-block" type="button" data-vo-cart-continue>Seguir comprando</button>'+
      '  </div>'+
      '</aside>'
    );
    drawer = document.querySelector('[data-vo-cart-drawer]');
    overlay = document.querySelector('[data-vo-cart-overlay]');
    body = document.querySelector('[data-vo-cart-body]');
    subtotalEl = document.querySelector('[data-vo-cart-subtotal]');
  }

  function openDrawer(){
    drawer.hidden=false; overlay.hidden=false;
    requestAnimationFrame(function(){ drawer.classList.add('open'); overlay.classList.add('open'); });
  }
  function closeDrawer(){
    drawer.classList.remove('open'); overlay.classList.remove('open');
    setTimeout(function(){ drawer.hidden=true; overlay.hidden=true; },300);
  }

  function renderDrawer(){
    if(!body) return;
    var items=read();
    if(!items.length){
      body.innerHTML='<p class="vo-cart-empty">Tu carrito está vacío.</p>';
    } else {
      body.innerHTML=items.map(function(i){
        return '<div class="vo-cart-item" data-sku="'+i.sku+'">'+
          '<div class="vo-cart-item-info"><p class="vo-cart-item-name">'+i.name+'</p><p class="vo-cart-item-price">'+fmt(i.price)+' c/u</p></div>'+
          '<div class="vo-cart-qty"><button type="button" data-vo-dec aria-label="Quitar uno">&minus;</button><span>'+i.qty+'</span><button type="button" data-vo-inc aria-label="Sumar uno">+</button></div>'+
          '<button type="button" class="vo-cart-remove" data-vo-remove aria-label="Quitar '+i.name+' del carrito">&times;</button>'+
          '</div>';
      }).join('');
    }
    subtotalEl.textContent=fmt(subtotal());
  }

  document.addEventListener('DOMContentLoaded', function(){
    buildDrawer();
    renderBadge();
    renderDrawer();
  });

  /* ── delegación de eventos: agregar, abrir/cerrar drawer, +/-, quitar, checkout ── */
  document.addEventListener('click', function(e){
    var add_ = e.target.closest('[data-add]');
    if(add_){
      var p = resolve(add_);
      add(p.sku,p.name,p.price,1);
      var t=add_.textContent; add_.textContent='Agregado ✓'; add_.disabled=true;
      setTimeout(function(){ add_.textContent=t; add_.disabled=false; },1200);
      return;
    }
    if(e.target.closest('.iconbtn[aria-label="Carrito"]')){ openDrawer(); return; }
    if(e.target.closest('[data-vo-cart-close]') || e.target.closest('[data-vo-cart-overlay]') || e.target.closest('[data-vo-cart-continue]')){ closeDrawer(); return; }

    var inc=e.target.closest('[data-vo-inc]');
    if(inc){ var sku1=inc.closest('.vo-cart-item').dataset.sku; var it1=read().filter(function(i){return i.sku===sku1;})[0]; if(it1) setQty(sku1,it1.qty+1); return; }
    var dec=e.target.closest('[data-vo-dec]');
    if(dec){ var sku2=dec.closest('.vo-cart-item').dataset.sku; var it2=read().filter(function(i){return i.sku===sku2;})[0]; if(it2) setQty(sku2,it2.qty-1); return; }
    var rm=e.target.closest('[data-vo-remove]');
    if(rm){ remove(rm.closest('.vo-cart-item').dataset.sku); return; }

    if(e.target.closest('[data-vo-cart-checkout]')){
      document.dispatchEvent(new CustomEvent('vo:checkout-request',{detail:{items:read(), subtotal:subtotal()}}));
      return;
    }
  });

  document.addEventListener('keydown', function(e){
    if(e.key==='Escape' && drawer && drawer.classList.contains('open')) closeDrawer();
  });
})();
