/**
 * Gate de autenticacion real. Usado por /api/checkout y /api/orders — el
 * modal de login en el frontend es solo UX; este middleware es el limite
 * de seguridad de verdad (nunca confiar solo en el frontend cuando hay
 * plata de por medio, ver plan aprobado, Fase 4).
 */
function requireAuth(req, res, next) {
  if (req.session && req.session.userId) {
    return next();
  }
  return res.status(401).json({ error: 'unauthenticated' });
}

module.exports = { requireAuth };
