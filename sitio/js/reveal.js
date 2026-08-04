/* Microanimaciones de entrada, compartidas por las 3 páginas de contenido.
   Un solo IntersectionObserver cubre todo: el hero (visible desde el primer
   frame, así que "entra" apenas carga) y cada sección de más abajo (que
   entra al scrollear). El ancla universal de "esto es el encabezado de una
   sección" es la línea dorada (.rule-oro): se anima su elemento padre entero
   (kicker + h2 + lead), sea cual sea el nombre de esa clase contenedora en
   cada página — así una sección nueva no necesita tocar este script.
   Las tarjetas/ítems que acompañan a cada sección (.poli-i, .oliv-card, .q)
   entran con stagger vía CSS (:nth-child), igual que .card-w/.grid3>article. */
(function(){
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function collectTargets(){
    var els = [];

    [].slice.call(document.querySelectorAll('.pgrid .card-w, .grid .card-w, .grid3>article'))
      .forEach(function(el){ els.push(el); });

    [].slice.call(document.querySelectorAll('.rule-oro')).forEach(function(rule){
      var block = rule.parentElement;
      if(block && els.indexOf(block) === -1){
        block.classList.add('reveal-block');
        els.push(block);
      }
    });

    [].slice.call(document.querySelectorAll('.poli-i, .oliv-card, .q'))
      .forEach(function(el){ els.push(el); });

    var heroInner = document.querySelector('.hero-t .inner');
    if(heroInner) els.push(heroInner);
    var heroProducts = document.querySelector('.hero-products');
    if(heroProducts) els.push(heroProducts);

    return els;
  }

  function start(){
    var targets = collectTargets();
    if(!targets.length) return;

    if(reduced || !('IntersectionObserver' in window)){
      targets.forEach(function(el){ el.classList.add('in'); });
      return;
    }

    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        /* No confiar solo en isIntersecting: si el layout todavía se está
           acomodando (imagen que termina de cargar y empuja contenido hacia
           abajo, o un reflow tardío), un elemento puede recibir un callback
           "intersecting" espurio para una posición que ya no es la real.
           Como cada elemento se des-observa apenas se revela una vez, un
           falso positivo lo dejaría visible para siempre sin haber sido
           scrolleado nunca — por eso se vuelve a medir su posición real
           contra el viewport antes de confiar en el flag. */
        var r = entry.target.getBoundingClientRect();
        var reallyVisible = entry.isIntersecting && r.bottom > 0 && r.top < window.innerHeight;
        if(reallyVisible){ entry.target.classList.add('in'); io.unobserve(entry.target); }
      });
    }, {threshold:.15, rootMargin:'0px 0px -40px 0px'});

    targets.forEach(function(el){ io.observe(el); });
  }

  /* Esperar a que carguen las imágenes (poster del hero, fotos de producto)
     antes de armar el observer: si se arma antes, el layout todavía está más
     corto de lo definitivo y una sección que va a terminar lejos del hero
     puede "interceptar" el viewport en ese instante transitorio — y como cada
     elemento se des-observa apenas intersecta una vez, quedaría revelado para
     siempre sin haber sido scrolleado nunca. */
  if(document.readyState === 'complete'){ start(); }
  else { window.addEventListener('load', start); }
})();
