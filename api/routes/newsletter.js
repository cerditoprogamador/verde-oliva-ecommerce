const express = require('express');
const { requireXhrHeader } = require('../lib/csrf');
const { sendMail } = require('../lib/mailer');

const router = express.Router();

// Sin auth: cualquier visitante puede suscribirse. No hay tabla de
// suscriptores todavia (ver schema.sql) — por ahora esto solo reenvia la
// direccion por mail a la casilla de la marca via lib/mailer.js, el mismo
// wrapper que usa el mail de confirmacion de compra. sendMail() nunca
// lanza, asi que si SMTP no esta configurado el request igual responde,
// pero con ok:false para que el frontend no muestre un mensaje de exito
// que no paso de verdad.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

router.post('/newsletter/subscribe', requireXhrHeader, async (req, res) => {
  const email = String(req.body?.email || '').trim();
  if (!EMAIL_RE.test(email)) {
    return res.status(400).json({ error: 'invalid_email' });
  }

  const sent = await sendMail({
    to: process.env.SMTP_FROM_NEWSLETTER || 'hola@verdeoliva.com.ar',
    subject: 'Nueva suscripcion al newsletter',
    html: `<p>Nueva suscripcion desde el sitio: <strong>${email}</strong></p>`,
  });

  return res.json({ ok: sent });
});

module.exports = router;
