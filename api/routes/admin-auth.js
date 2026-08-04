const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../lib/db');
const { requireXhrHeader } = require('../lib/csrf');

const router = express.Router();

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
