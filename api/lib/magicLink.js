const crypto = require('crypto');
const pool = require('./db');

const TOKEN_TTL_MS = 15 * 60 * 1000;

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

// Genera el token en texto plano (va en el link del email) y guarda solo
// su hash — igual criterio que password_hash en admin_users: la base nunca
// tiene el secreto real.
async function createToken(email) {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MS);
  await pool.execute(
    'INSERT INTO magic_link_tokens (email, token_hash, expires_at) VALUES (?, ?, ?)',
    [email, hashToken(token), expiresAt]
  );
  return token;
}

// Un solo uso: si ya tiene used_at o vencio, no sirve. Marca used_at antes
// de devolver el email para que una segunda request con el mismo token
// (doble click, link reenviado) no vuelva a loguear.
async function consumeToken(token) {
  const tokenHash = hashToken(token);
  const [rows] = await pool.execute(
    'SELECT id, email, expires_at, used_at FROM magic_link_tokens WHERE token_hash = ?',
    [tokenHash]
  );
  const row = rows[0];
  if (!row || row.used_at || new Date(row.expires_at) < new Date()) return null;

  await pool.execute('UPDATE magic_link_tokens SET used_at = NOW() WHERE id = ?', [row.id]);
  return row.email;
}

module.exports = { createToken, consumeToken };
