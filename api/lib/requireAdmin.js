/**
 * Gate de autenticacion para el panel de administrador. Calco de
 * requireAuth.js pero mira `session.adminId` en vez de `session.userId` —
 * son cuentas completamente separadas (ver admin_users en schema.sql),
 * aunque comparten la misma cookie/sesion (vo_sid) por simplicidad: cada
 * middleware mira solo su propia clave, asi que no hay forma de que una
 * sesion de cliente cuele como admin ni viceversa.
 */
function requireAdmin(req, res, next) {
  if (req.session && req.session.adminId) {
    return next();
  }
  return res.status(401).json({ error: 'unauthenticated_admin' });
}

module.exports = { requireAdmin };
