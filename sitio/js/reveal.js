/* Reveal-on-scroll compartido: idéntico bloque IntersectionObserver que antes
   estaba duplicado en las 3 páginas. El selector cubre los tres casos
   (tarjetas de home/catálogo y "combina con" de producto); cada página solo
   tiene los elementos que le corresponden. */
(function(){
  var revealCards = [].slice.call(document.querySelectorAll('.pgrid .card-w, .grid .card-w, .grid3>article'));
  if(!revealCards.length) return;

  if('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){ entry.target.classList.add('in'); io.unobserve(entry.target); }
      });
    }, {threshold:.15, rootMargin:'0px 0px -40px 0px'});
    revealCards.forEach(function(el){ io.observe(el); });
  } else {
    revealCards.forEach(function(el){ el.classList.add('in'); });
  }
})();
