const express = require('express');
const { OAuth2Client } = require('google-auth-library');
const pool = require('../lib/db');
const { requireXhrHeader } = require('../lib/csrf');

const router = express.Router();
const client = new OAuth2Client();

// requireXhrHeader se aplica por-ruta (no con router.use()) a proposito:
// varios routers de este backend se montan todos bajo el mismo prefijo
// '/api' en server.js, y Express reparte una request entrante a CADA
// router montado en ese prefijo en el orden en que se montaron hasta que
// alguno responda o llame next() — un router.use() sin path en este
// archivo interceptaria tambien pedidos que en realidad son para otro
// router (por ejemplo /api/webhooks/mercadopago, que a proposito NO lleva
// esta mitigacion). Atarlo a cada ruta mutante puntual evita ese problema.

/**
 * POST /api/auth/google
 * body: { credential }  — el ID token que entrega Google Identity Services.
 */
router.post('/auth/google', requireXhrHeader, async (req, res) => {
  const { credential } = req.body || {};
  if (!credential || typeof credential !== 'string') {
    return res.status(400).json({ error: 'missing credential' });
  }

  let payload;
  try {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    payload = ticket.getPayload();
  } catch (err) {
    console.error('[auth/google] token invalido:', err.message);
    return res.status(401).json({ error: 'invalid_token' });
  }

  if (!payload || !payload.sub || !payload.email) {
    return res.status(401).json({ error: 'invalid_token' });
  }

  const { sub, email, name, picture } = payload;

  let conn;
  try {
    conn = await pool.getConnection();

    // Upsert por google_sub (clave estable del token). email/name/picture
    // se actualizan en cada login por si cambiaron del lado de Google.
    await conn.execute(
      `INSERT INTO users (google_sub, email, name, avatar_url, last_login_at)
       VALUES (?, ?, ?, ?, NOW())
       ON DUPLICATE KEY UPDATE
         email = VALUES(email),
         name = VALUES(name),
         avatar_url = VALUES(avatar_url),
         last_login_at = NOW()`,
      [sub, email, name || null, picture || null]
    );

    const [rows] = await conn.execute(
      'SELECT id, email, name, avatar_url FROM users WHERE google_sub = ?',
      [sub]
    );
    const user = rows[0];

    req.session.regenerate((err) => {
      if (err) {
        console.error('[auth/google] session.regenerate failed:', err.message);
        return res.status(500).json({ error: 'session_error' });
      }
      req.session.userId = user.id;
      req.session.save((saveErr) => {
        if (saveErr) {
          console.error('[auth/google] session.save failed:', saveErr.message);
          return res.status(500).json({ error: 'session_error' });
        }
        return res.json({
          ok: true,
          user: { name: user.name, email: user.email, picture: user.avatar_url },
        });
      });
    });
  } catch (err) {
    console.error('[auth/google] db error:', err.message);
    return res.status(500).json({ error: 'server_error' });
  } finally {
    if (conn) conn.release();
  }
});

/**
 * GET /api/me — estado de sesion.
 */
router.get('/me', async (req, res) => {
  if (!req.session || !req.session.userId) {
    return res.json({ authenticated: false });
  }

  try {
    const [rows] = await pool.execute(
      'SELECT email, name, avatar_url FROM users WHERE id = ?',
      [req.session.userId]
    );
    const user = rows[0];
    if (!user) {
      // Usuario borrado pero sesion viva: no dejarla colgada.
      return req.session.destroy(() => res.json({ authenticated: false }));
    }
    return res.json({
      authenticated: true,
      user: { name: user.name, email: user.email, picture: user.avatar_url },
    });
  } catch (err) {
    console.error('[me] db error:', err.message);
    return res.status(500).json({ error: 'server_error' });
  }
});

/**
 * POST /api/auth/logout
 */
router.post('/auth/logout', requireXhrHeader, (req, res) => {
  if (!req.session) return res.json({ ok: true });
  req.session.destroy((err) => {
    if (err) {
      console.error('[auth/logout] session.destroy failed:', err.message);
      return res.status(500).json({ error: 'server_error' });
    }
    res.clearCookie('vo_sid');
    return res.json({ ok: true });
  });
});

module.exports = router;
