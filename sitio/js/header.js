/* Comportamiento de header compartido entre las 3 páginas: header sólido al
   scrollear, franja de envío y chips "stuck" — cada pieza se auto-detecta,
   así no rompe nada en páginas donde ese elemento no existe. El toggle ES/EN
   lo maneja i18n.js (necesita hacer el swap de texto, no solo el visual). */
(function(){
  var hdr = document.querySelector('.hdr');
  var strip = document.querySelector('.strip');
  var chipsEl = document.querySelector('.chips');

  function markHeader(){
    if(hdr) hdr.classList.toggle('scrolled', window.scrollY>40);
  }
  function syncStripHeight(){
    if(strip) document.documentElement.style.setProperty('--stripH', strip.offsetHeight+'px');
  }
  function markChipsStuck(){
    if(!chipsEl || !hdr) return;
    var threshold = (strip?strip.offsetHeight:0) + hdr.offsetHeight;
    chipsEl.classList.toggle('stuck', chipsEl.getBoundingClientRect().top<=threshold+1);
  }

  window.addEventListener('scroll', function(){ markHeader(); markChipsStuck(); }, {passive:true});
  window.addEventListener('resize', function(){ syncStripHeight(); markChipsStuck(); });
  syncStripHeight();
  markHeader();
  markChipsStuck();
})();
