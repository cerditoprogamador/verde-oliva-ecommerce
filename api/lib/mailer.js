const { Resend } = require('resend');

// Sin RESEND_API_KEY (dev local sin configurar todavia) no se manda el
// email, pero se loguea el link para poder seguir probando el flujo a mano.
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

async function sendMagicLinkEmail(to, url) {
  if (!resend) {
    console.warn('[mailer] RESEND_API_KEY no configurada. Link de acceso para', to, ':', url);
    return;
  }

  await resend.emails.send({
    from: process.env.MAIL_FROM || 'Verde Oliva <onboarding@resend.dev>',
    to,
    subject: 'Tu enlace de acceso a Verde Oliva',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:420px;margin:0 auto;padding:24px">
        <h2 style="color:#3A4433;margin-bottom:8px">Verde Oliva</h2>
        <p>Usá este enlace para iniciar sesión. Vence en 15 minutos y solo funciona una vez.</p>
        <p style="margin:24px 0">
          <a href="${url}" style="background:#3A4433;color:#F7F4EC;padding:12px 20px;border-radius:6px;text-decoration:none;display:inline-block">Iniciar sesión</a>
        </p>
        <p style="color:#7a7a7a;font-size:13px">Si no pediste este enlace, podés ignorar este email.</p>
      </div>
    `,
  });
}

module.exports = { sendMagicLinkEmail };
