/**
 * Seed uno-shot de la cuenta de administrador del panel. Lee
 * ADMIN_USERNAME/ADMIN_PASSWORD de .env, hashea con bcryptjs (nunca
 * guarda la contraseña en texto plano) y hace upsert en `admin_users`.
 *
 * Re-correr este script (ej. para cambiar la contraseña) es seguro:
 * ON DUPLICATE KEY UPDATE pisa el hash sin duplicar la fila.
 *
 * Uso:
 *   ADMIN_USERNAME=... ADMIN_PASSWORD=... node scripts/seed-admin.js
 *   (o definilos en .env — dotenv ya se carga via server.js/este script)
 *
 * Una vez corrido, se recomienda borrar ADMIN_PASSWORD de .env: solo el
 * hash en la base importa de aca en adelante.
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('../lib/db');

async function main() {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;

  if (!username || !password) {
    console.error('[seed-admin] Falta ADMIN_USERNAME o ADMIN_PASSWORD en el entorno/.env');
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await pool.execute(
    `INSERT INTO admin_users (username, password_hash)
     VALUES (?, ?)
     ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash)`,
    [username, passwordHash]
  );

  console.log(`[seed-admin] cuenta admin "${username}" lista.`);
  process.exit(0);
}

main().catch((err) => {
  console.error('[seed-admin] error:', err);
  process.exit(1);
});
