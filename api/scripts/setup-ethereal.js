/**
 * Crea una casilla de prueba en Ethereal (https://ethereal.email, el
 * servicio de pruebas de Nodemailer: los mails NO se entregan de verdad,
 * quedan atrapados en una bandeja web) y escribe sus credenciales SMTP en
 * .env, pisando cualquier SMTP_* que hubiera antes.
 *
 * Uso: node scripts/setup-ethereal.js
 *
 * Cuando tengas la casilla real de Verde Oliva (Hostinger u otra), hay que
 * volver a pisar estas mismas variables en .env con esos datos — Ethereal
 * es solo para desarrollo/pruebas.
 */
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

const ENV_PATH = path.join(__dirname, '..', '.env');

const SMTP_KEYS = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_SECURE', 'SMTP_USER', 'SMTP_PASS', 'SMTP_FROM'];

function upsertEnv(existingText, values) {
  const lines = existingText.split('\n');
  const seen = new Set();

  const updated = lines.map((line) => {
    const key = line.split('=')[0];
    if (SMTP_KEYS.includes(key)) {
      seen.add(key);
      return `${key}=${values[key]}`;
    }
    return line;
  });

  const missing = SMTP_KEYS.filter((k) => !seen.has(k));
  if (missing.length > 0) {
    if (updated[updated.length - 1] !== '') updated.push('');
    updated.push('# Ethereal (casilla de prueba, ver scripts/setup-ethereal.js) — reemplazar por SMTP real antes de produccion');
    for (const key of missing) updated.push(`${key}=${values[key]}`);
  }

  return updated.join('\n');
}

async function main() {
  const account = await nodemailer.createTestAccount();

  const values = {
    SMTP_HOST: account.smtp.host,
    SMTP_PORT: account.smtp.port,
    SMTP_SECURE: account.smtp.secure,
    SMTP_USER: account.user,
    SMTP_PASS: account.pass,
    SMTP_FROM: '"Verde Oliva Olivoterapia (prueba)" <no-reply@verdeoliva.com>',
  };

  const existing = fs.existsSync(ENV_PATH) ? fs.readFileSync(ENV_PATH, 'utf8') : '';
  fs.writeFileSync(ENV_PATH, upsertEnv(existing, values));

  console.log('[setup-ethereal] Casilla de prueba creada y guardada en .env:');
  console.log(`  usuario:  ${account.user}`);
  console.log(`  password: ${account.pass}`);
  console.log('  Los mails NO llegan a ninguna bandeja real. Para verlos:');
  console.log('   - entra a https://ethereal.email/login con ese usuario/password, o');
  console.log('   - fijate la URL de vista previa que imprime scripts/test-email.js al enviar');
  console.log('');
  console.log('[setup-ethereal] Reiniciá el servidor (npm run dev) para que tome estas variables.');
}

main().catch((err) => {
  console.error('[setup-ethereal] error:', err.message);
  process.exit(1);
});
