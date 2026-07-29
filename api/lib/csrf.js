/**
 * Mitigacion CSRF minima, no un token de doble submit real.
 *
 * Por que alcanza por ahora: el diseño es same-origin a proposito (Express
 * sirve sitio/ y /api/* desde el mismo host, ver CLAUDE.md / plan de
 * arquitectura), y un <form> o <img> cross-site no puede agregar headers
 * custom a su pedido — solo fetch/XHR con JS explicito puede, y ese JS
 * solo corre en nuestro propio origen. Por eso alcanza con exigir un header
 * que un submit cross-site "tonto" (form HTML plano) no puede fabricar.
 *
 * TODO antes de ir a produccion de verdad: reemplazar esto por un token
 * CSRF de doble submit (cookie + header) o migrar a una libreria mantenida
 * (csrf-csrf, etc). Esto ya esta señalado como pendiente en el plan
 * aprobado (quirky-bubbling-parnas.md) — no es un descuido, es un atajo
 * consciente para esta fase.
 */
function requireXhrHeader(req, res, next) {
  const isMutating = req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH' || req.method === 'DELETE';
  if (!isMutating) return next();

  if (req.get('X-Requested-With') !== 'XMLHttpRequest') {
    return res.status(403).json({ error: 'forbidden', detail: 'missing X-Requested-With header' });
  }
  next();
}

module.exports = { requireXhrHeader };
