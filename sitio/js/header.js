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
