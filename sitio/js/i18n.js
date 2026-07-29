/* Idioma real ES/EN, swap client-side. El inglés vive en un diccionario
   compacto por página (window.VO_I18N, cargado antes que este script vía
   js/i18n-data-*.js) referenciado por clave corta data-i18n="key" — así el
   copy en inglés (reescritura de marca, no traducción literal, ver
   brand/03-identidad-verbal.md#bilingüe-esen) se escribe una sola vez aunque
   el mismo producto aparezca repetido (p. ej. catálogo por línea/necesidad).
   El español original se cachea la primera vez que se pasa a inglés. */
(function(){
  var KEY='vo-lang';

  function dict(){
    var d = {};
    if(window.VO_I18N_COMMON) for(var k in window.VO_I18N_COMMON) d[k]=window.VO_I18N_COMMON[k];
    if(window.VO_I18N_PAGE) for(var k2 in window.VO_I18N_PAGE) d[k2]=window.VO_I18N_PAGE[k2];
    return d;
  }

  function apply(lang){
    document.documentElement.lang = lang;
    var D = dict();

    document.querySelectorAll('[data-i18n]').forEach(function(el){
      var k = el.getAttribute('data-i18n');
      if(el.dataset.esCache===undefined) el.dataset.esCache = el.innerHTML;
      el.innerHTML = (lang==='en' && D[k]!=null) ? D[k] : el.dataset.esCache;
    });
    document.querySelectorAll('[data-i18n-aria]').forEach(function(el){
      var k = el.getAttribute('data-i18n-aria');
      if(el.dataset.esAriaCache===undefined) el.dataset.esAriaCache = el.getAttribute('aria-label')||'';
      el.setAttribute('aria-label', (lang==='en' && D[k]!=null) ? D[k] : el.dataset.esAriaCache);
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(function(el){
      var k = el.getAttribute('data-i18n-placeholder');
      if(el.dataset.esPlaceholderCache===undefined) el.dataset.esPlaceholderCache = el.getAttribute('placeholder')||'';
      el.setAttribute('placeholder', (lang==='en' && D[k]!=null) ? D[k] : el.dataset.esPlaceholderCache);
    });

    document.querySelectorAll('.lang button').forEach(function(b){
      var isEnBtn = b.textContent.trim()==='EN';
      b.setAttribute('aria-pressed', (lang==='en')===isEnBtn ? 'true' : 'false');
    });

    localStorage.setItem(KEY, lang);
    document.dispatchEvent(new CustomEvent('vo:lang-changed',{detail:{lang:lang}}));
  }

  document.addEventListener('click', function(e){
    var b = e.target.closest('.lang button');
    if(b) apply(b.textContent.trim()==='EN' ? 'en' : 'es');
  });

  document.addEventListener('DOMContentLoaded', function(){
    if(localStorage.getItem(KEY)==='en') apply('en');
  });

  window.VOLang = { current: function(){ return document.documentElement.lang==='en' ? 'en' : 'es'; } };
})();
