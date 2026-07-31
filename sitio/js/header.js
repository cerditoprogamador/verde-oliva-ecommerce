/* Comportamiento de header compartido entre las 3 páginas: header sólido al
   scrollear, franja de envío y chips "stuck" — cada pieza se auto-detecta,
   así no rompe nada en páginas donde ese elemento no existe. El toggle ES/EN
   lo maneja i18n.js (necesita hacer el swap de texto, no solo el visual). */
(function(){
  var hdr = document.querySelector('.hdr');
  var strip = document.querySelector('.strip');
  var chipsEl = document.querySelector('.chips');
  var lastY = window.scrollY;

  function markHeader(){
    if(!hdr) return;
    var y = window.scrollY;
    hdr.classList.toggle('scrolled', y>40);

    /* la barra de navegación (.hdr) acompaña siempre al usuario — nunca se
       oculta. Solo la franja de envío (.strip, fija arriba de todo en el
       home) se retrae al bajar. El header y los chips leen su posición de
       --stripH, así que bajarla a 0 es lo que hace que el header suba a
       ocupar ese lugar SIN dejar hueco entre el header y los chips (si solo
       se transforma .strip visualmente, --stripH queda con el valor viejo y
       los chips, que la usan para su propio `top`, quedan flotando de más).
       Umbral de 4px para no titilar con el rebote/inercia del scroll. */
    if(!strip) { lastY = y; return; }
    var naturalH = strip.offsetHeight || stripNaturalH;
    if(y > lastY + 4 && y > naturalH){
      strip.classList.add('hidden');
      document.documentElement.style.setProperty('--stripH', '0px');
    } else if(y < lastY - 4 || y <= naturalH){
      strip.classList.remove('hidden');
      document.documentElement.style.setProperty('--stripH', naturalH+'px');
    }
    lastY = y;
  }
  var stripNaturalH = 0;
  function syncStripHeight(){
    if(!strip) return;
    if(!strip.classList.contains('hidden')) stripNaturalH = strip.offsetHeight;
    document.documentElement.style.setProperty('--stripH', (strip.classList.contains('hidden') ? 0 : stripNaturalH)+'px');
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

  /* menú mobile: hamburguesa + panel deslizante (solo si la página lo tiene) */
  var menuBtn = document.getElementById('menuToggle');
  var mnav = document.getElementById('mobileNav');
  var backdrop = document.getElementById('mnavBackdrop');
  var mnavClose = document.getElementById('mnavClose');
  if(menuBtn && mnav && backdrop){
    function openMnav(){
      mnav.classList.add('open'); backdrop.classList.add('open');
      mnav.setAttribute('aria-hidden','false');
      menuBtn.setAttribute('aria-expanded','true');
      document.body.classList.add('mnav-open');
    }
    function closeMnav(){
      mnav.classList.remove('open'); backdrop.classList.remove('open');
      mnav.setAttribute('aria-hidden','true');
      menuBtn.setAttribute('aria-expanded','false');
      document.body.classList.remove('mnav-open');
    }
    menuBtn.addEventListener('click', openMnav);
    backdrop.addEventListener('click', closeMnav);
    if(mnavClose) mnavClose.addEventListener('click', closeMnav);
    mnav.querySelectorAll('.mnav-links a').forEach(function(a){ a.addEventListener('click', closeMnav); });
    document.addEventListener('keydown', function(e){ if(e.key==='Escape') closeMnav(); });
    window.addEventListener('resize', function(){ if(window.innerWidth>=1000) closeMnav(); });
  }
})();
