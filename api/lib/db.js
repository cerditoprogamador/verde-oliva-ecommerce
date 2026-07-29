/**
 * Pool de conexiones MySQL, compartido por las rutas y por el session store
 * de express-mysql-session (que reusa este mismo pool en vez de abrir el suyo).
 *
 * Importante: un fallo de conexion a MySQL al arrancar NO debe tirar abajo
 * el proceso entero. mysql2 con `createPool` es lazy — no conecta hasta el
 * primer query — asi que require('./db') nunca lanza por si solo. Los
 * errores de conexion salen recien cuando algo hace un query real, y ahi
 * se devuelven como 500 con logging, no como un crash del proceso.
 */
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'verde_oliva',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true,
});

// No crashear el proceso por errores async del pool (ej. el server MySQL
// se cae despues de arrancar). Los queries que fallen mientras tanto van
// a rechazar su promesa individualmente, que cada ruta ya maneja con try/catch.
pool.on('error', (err) => {
  console.error('[db] pool error (no fatal):', err.message);
});

module.exports = pool;
