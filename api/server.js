require('dotenv').config();

const path = require('path');
const express = require('express');

const { sessionMiddleware } = require('./lib/session');
const authRoutes = require('./routes/auth');
const checkoutRoutes = require('./routes/checkout');
const webhookRoutes = require('./routes/webhooks');
const orderRoutes = require('./routes/orders');
const productsPublicRoutes = require('./routes/products-public');
const newsletterRoutes = require('./routes/newsletter');
const adminAuthRoutes = require('./routes/admin-auth');
const adminProductsRoutes = require('./routes/admin-products');
const adminOrdersRoutes = require('./routes/admin-orders');
const adminCustomersRoutes = require('./routes/admin-customers');
const adminDashboardRoutes = require('./routes/admin-dashboard');

const app = express();
const PORT = process.env.PORT || 3000;

// Detras de un proxy (Hostinger/Nginx) para que `req.protocol` y
// `req.get('host')` (usados al armar back_urls/notification_url del
// checkout) reflejen https y el host real en vez de los del proxy interno.
app.set('trust proxy', 1);

app.use(express.json());

app.use(sessionMiddleware);

// --- API ---
app.use('/api', authRoutes);
app.use('/api', checkoutRoutes);
app.use('/api', orderRoutes);
app.use('/api', productsPublicRoutes);
app.use('/api', newsletterRoutes);
app.use('/api', adminAuthRoutes);
app.use('/api', adminProductsRoutes);
app.use('/api', adminOrdersRoutes);
app.use('/api', adminCustomersRoutes);
app.use('/api', adminDashboardRoutes);
// El router de webhooks va aparte: no lleva la mitigacion CSRF (ver
// comentario en routes/webhooks.js) porque lo llama el servidor de MP,
// no un navegador con sesion.
app.use('/api', webhookRoutes);

// --- Panel de administrador: gate server-side sobre los .html estaticos ---
// Defensa en profundidad, no el limite de seguridad real (eso son las
// rutas /api/admin/* con requireAdmin, igual que requireAuth.js ya aclara
// que el modal de login del sitio es "solo UX"). Sin esto, cualquiera
// podria al menos ver el HTML/CSS del panel aunque ninguna API responda.
app.use('/admin', (req, res, next) => {
  const isPublicAsset =
    req.path === '/login.html' || /^\/(css|js|img)\//.test(req.path);
  if (isPublicAsset || (req.session && req.session.adminId)) return next();
  return res.redirect('/admin/login.html');
});

// --- Sitio estatico ---
// Mismo origen que la API a proposito: elimina CORS y problemas de cookies
// cross-origin de entrada (ver plan aprobado, seccion "Arquitectura").
const sitioDir = path.join(__dirname, '..', 'sitio');
app.use(express.static(sitioDir));

// --- Ficha generica para productos sin pagina .html propia ---
// Los 17 SKU originales tienen su producto-<sku>.html hecho a mano (ya
// servido arriba por express.static); esto SOLO se ejecuta cuando ese
// archivo no existe (express.static ya llamo a next()), es decir: un
// producto creado 100% desde el admin. sitio/js/products.js detecta que
// esta en la ficha generica (body[data-generic-ficha]) y renderiza todo
// el contenido leyendo /api/products/:sku.
app.get(/^\/producto-([a-z0-9-]+)\.html$/, (req, res) => {
  res.sendFile(path.join(sitioDir, 'producto-generic.html'));
});

// 404 para cualquier /api/* no reconocida (despues de todos los routers).
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'not_found' });
});

// Manejador de errores de ultima instancia: nunca tirar el proceso abajo
// por una excepcion sincrona no atrapada en una ruta.
app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  console.error('[server] unhandled error:', err);
  if (res.headersSent) return next(err);
  res.status(500).json({ error: 'server_error' });
});

app.listen(PORT, () => {
  console.log(`Verde Oliva API + sitio escuchando en http://localhost:${PORT}`);
});

// No crashear el proceso por una promesa rechazada sin catch en algun
// lugar (ej. un error de MySQL en un query que se nos escapo) — se loguea
// y sigue vivo. Esto es una red de seguridad, no un reemplazo de manejar
// errores bien en cada ruta.
process.on('unhandledRejection', (reason) => {
  console.error('[server] unhandled rejection (proceso sigue vivo):', reason);
});
