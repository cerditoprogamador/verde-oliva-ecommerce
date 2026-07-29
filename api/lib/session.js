/**
 * express-session con almacenamiento en MySQL (express-mysql-session).
 *
 * Por que MySQL y no memoria/JWT: logout instantaneo (borrar la fila de
 * `sessions`), sin problema de revocacion de JWT, y sobrevive un restart
 * del proceso Node — ver quirky-bubbling-parnas.md, seccion "Fase 3".
 *
 * express-mysql-session crea su propia tabla `sessions` sola en el primer
 * arranque (createDatabaseTable: true, el default) — no se declara en
 * schema.sql a proposito.
 */
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const pool = require('./db');

// express-mysql-session acepta un pool mysql2 ya creado en vez de abrir
// una conexion propia (opcion `options.pool` de la libreria) via el 2do
// argumento del constructor de bajo nivel. Usamos esa forma para no
// duplicar credenciales/conexiones.
const sessionStore = new MySQLStore({}, pool);

sessionStore.onReady().catch((err) => {
  // No tirar abajo el proceso: sin MySQL disponible el server igual debe
  // poder arrancar (rutas que no tocan sesion/DB siguen sirviendo, y las
  // que la necesitan van a fallar con un error claro en vez de un crash).
  console.error('[session] no se pudo inicializar el store de MySQL:', err.message);
});

const isProd = process.env.NODE_ENV === 'production';

const sessionMiddleware = session({
  key: 'vo_sid',
  secret: process.env.SESSION_SECRET || 'dev-secret-change-me',
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    // secure:true requiere HTTPS — en dev local sobre http se rompe la
    // sesion si esta forzado, por eso se activa solo en produccion.
    secure: isProd,
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60 * 24 * 30, // 30 dias
  },
});

module.exports = { sessionMiddleware, sessionStore };
