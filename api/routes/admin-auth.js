const express = require('express');
const bcrypt = require('bcryptjs');
const { OAuth2Client } = require('google-auth-library');
const pool = require('../lib/db');
const { requireXhrHeader } = require('../lib/csrf');

const router = express.Router();
const googleClient = new OAuth2Client();

// requireXhrHeader por-ruta, no via router.use() — mismo motivo que el
// resto de los routers de este backend (ver comentario en routes/auth.js):
// todos comparten el prefijo '/api' en server.js.

/**
 * POST /api/admin/login
 * body: { username, password } — cuenta propia del panel, sin relacion
 * con el login Google de clientes (tabla admin_users, no `users`).
 */
router.post('/admin/login', requireXhrHeader, async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: 'missing_credentials' });
  }

  try {
    const [rows] = await pool.execute(
      'SELECT id, password_hash FROM admin_users WHERE username = ?',
      [username]
    );
    const admin = rows[0];

    // Mismo 401 generico exista o no el usuario — nunca revelar cual de
    // los dos (usuario o contraseña) fue el que fallo.
    const match = admin ? await bcrypt.compare(password, admin.password_hash) : false;
    if (!admin || !match) {
      return res.status(401).json({ error: 'invalid_credentials' });
    }

    req.session.regenerate((err) => {
      if (err) {
        console.error('[admin/login] session.regenerate failed:', err.message);
        return res.status(500).json({ error: 'session_error' });
      }
      req.session.adminId = admin.id;
      req.session.save((saveErr) => {
        if (saveErr) {
          console.error('[admin/login] session.save failed:', saveErr.message);
          return res.status(500).json({ error: 'session_error' });
        }
        pool
          .execute('UPDATE admin_users SET last_login_at = NOW() WHERE id = ?', [admin.id])
          .catch((e) => console.error('[admin/login] no se pudo actualizar last_login_at:', e.message));
        return res.json({ ok: true, username });
      });
    });
  } catch (err) {
    console.error('[admin/login] db error:', err.message);
    return res.status(500).json({ error: 'server_error' });
  }
});

/**
 * GET /api/admin/google-sso-status — le dice al frontend si mostrar el
 * boton "Iniciar sesion con Google" (ADMIN_GOOGLE_EMAIL configurado) y con
 * que client_id inicializar Google Identity Services. No es informacion
 * sensible: el client_id de Google ya es publico (va en el HTML del sitio).
 */
router.get('/admin/google-sso-status', (req, res) => {
  res.json({
    enabled: Boolean(process.env.ADMIN_GOOGLE_EMAIL),
    clientId: process.env.GOOGLE_CLIENT_ID || null,
  });
});

/**
 * POST /api/admin/login/google
 * body: { credential } — mismo ID token de Google Identity Services que el
 * login de clientes, pero acá se rechaza cualquier email que no sea
 * exactamente ADMIN_GOOGLE_EMAIL (.env). No hay sign-up: si el email no
 * matchea, 403 y listo — esto NO crea cuentas de admin nuevas.
 */
router.post('/admin/login/google', requireXhrHeader, async (req, res) => {
  const { credential } = req.body || {};
  if (!credential || typeof credential !== 'string') {
    return res.status(400).json({ error: 'missing_credential' });
  }

  const allowedEmail = (process.env.ADMIN_GOOGLE_EMAIL || '').trim().toLowerCase();
  if (!allowedEmail) {
    return res.status(403).json({ error: 'google_sso_not_configured' });
  }

  let payload;
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    payload = ticket.getPayload();
  } catch (err) {
    console.error('[admin/login/google] token invalido:', err.message);
    return res.status(401).json({ error: 'invalid_token' });
  }

  if (!payload || !payload.sub || !payload.email) {
    return res.status(401).json({ error: 'invalid_token' });
  }
  if (payload.email.toLowerCase() !== allowedEmail) {
    // Mismo mensaje generico que el login por password: no revelar que el
    // email esta "casi bien" ni dar pistas sobre la cuenta real.
    return res.status(403).json({ error: 'not_authorized' });
  }

  try {
    // No hay sign-up: si ADMIN_GOOGLE_EMAIL matchea pero no hay ninguna
    // fila en admin_users todavia, esto es un error de configuracion, no
    // un alta automatica de cuenta.
    const [existing] = await pool.execute(
      'SELECT id, username FROM admin_users WHERE email = ? OR google_sub = ?',
      [payload.email, payload.sub]
    );
    let admin = existing[0];

    if (!admin) {
      // Primer login por Google: se auto-vincula a la (unica) cuenta admin
      // ya creada por seed-admin.js, identificandola por no tener email
      // asignado todavia. Si hay mas de una fila sin email, es ambiguo y
      // se corta — hay que vincular a mano en ese caso.
      const [unlinked] = await pool.execute(
        'SELECT id, username FROM admin_users WHERE email IS NULL'
      );
      if (unlinked.length !== 1) {
        return res.status(403).json({ error: 'no_admin_account_to_link' });
      }
      admin = unlinked[0];
      await pool.execute('UPDATE admin_users SET email = ?, google_sub = ? WHERE id = ?', [
        payload.email,
        payload.sub,
        admin.id,
      ]);
    }

    req.session.regenerate((err) => {
      if (err) {
        console.error('[admin/login/google] session.regenerate failed:', err.message);
        return res.status(500).json({ error: 'session_error' });
      }
      req.session.adminId = admin.id;
      req.session.save((saveErr) => {
        if (saveErr) {
          console.error('[admin/login/google] session.save failed:', saveErr.message);
          return res.status(500).json({ error: 'session_error' });
        }
        pool
          .execute('UPDATE admin_users SET last_login_at = NOW() WHERE id = ?', [admin.id])
          .catch((e) => console.error('[admin/login/google] no se pudo actualizar last_login_at:', e.message));
        return res.json({ ok: true, username: admin.username });
      });
    });
  } catch (err) {
    console.error('[admin/login/google] db error:', err.message);
    return res.status(500).json({ error: 'server_error' });
  }
});

/**
 * GET /api/admin/me — estado de sesion del admin.
 */
router.get('/admin/me', async (req, res) => {
  if (!req.session || !req.session.adminId) {
    return res.json({ authenticated: false });
  }

  try {
    const [rows] = await pool.execute('SELECT username FROM admin_users WHERE id = ?', [
      req.session.adminId,
    ]);
    const admin = rows[0];
    if (!admin) {
      return req.session.destroy(() => res.json({ authenticated: false }));
    }
    return res.json({ authenticated: true, username: admin.username });
  } catch (err) {
    console.error('[admin/me] db error:', err.message);
    return res.status(500).json({ error: 'server_error' });
  }
});

/**
 * POST /api/admin/logout
 */
router.post('/admin/logout', requireXhrHeader, (req, res) => {
  if (!req.session) return res.json({ ok: true });
  req.session.destroy((err) => {
    if (err) {
      console.error('[admin/logout] session.destroy failed:', err.message);
      return res.status(500).json({ error: 'server_error' });
    }
    res.clearCookie('vo_sid');
    return res.json({ ok: true });
  });
});

module.exports = router;
