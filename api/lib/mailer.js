/**
 * Transporter SMTP compartido (mismo patron singleton que lib/db.js), mas
 * un wrapper sendMail() que nunca lanza: un fallo de email jamas puede
 * tirar abajo el flujo que lo dispara (el webhook de Mercado Pago tiene que
 * poder responder 200 pase lo que pase con el mail).
 *
 * Igual que mysql2 con createPool, nodemailer.createTransport() es lazy —
 * no abre conexion hasta el primer sendMail() — asi que require('./mailer')
 * nunca lanza por si solo.
 */
const nodemailer = require('nodemailer');

let transporter = null;
let warnedMissingConfig = false;

function getTransporter() {
  if (transporter) return transporter;

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    if (!warnedMissingConfig) {
      console.warn('[mailer] SMTP_HOST/SMTP_USER/SMTP_PASS no configurados: no se van a enviar mails');
      warnedMissingConfig = true;
    }
    return null;
  }

  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
  return transporter;
}

/**
 * sendMail({to, subject, html}) — nunca rechaza: loguea y devuelve false
 * si algo falla (SMTP no configurado, error de red, credenciales, etc.).
 */
async function sendMail({ to, subject, html }) {
  const t = getTransporter();
  if (!t) return false;

  try {
    const info = await t.sendMail({
      from: process.env.SMTP_FROM || 'Verde Oliva Olivoterapia <no-reply@verdeoliva.com>',
      to,
      subject,
      html,
    });
    // Si el transporte es una cuenta de prueba de Ethereal, esto devuelve
    // la URL donde ver el mail (no llega a ninguna bandeja real); con SMTP
    // real devuelve false y no hace nada.
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) console.log(`[mailer] preview (Ethereal): ${previewUrl}`);
    return true;
  } catch (err) {
    console.error('[mailer] error enviando mail:', err.message);
    return false;
  }
}

module.exports = { sendMail };
