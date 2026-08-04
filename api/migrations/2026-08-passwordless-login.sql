-- Agrega login sin contraseña para clientes (magic link por email) y
-- login con Google restringido para el panel de administrador.
--
-- Uso:
--   mysql -u root -p verde_oliva < migrations/2026-08-passwordless-login.sql

-- google_sub deja de ser NOT NULL: un usuario que entra por magic link no
-- tiene sub de Google todavia (puede loguearse mas tarde con Google y
-- entonces conviven ambos metodos sobre la misma fila, unidos por email).
ALTER TABLE users MODIFY google_sub VARCHAR(64) NULL;

-- Tokens de un solo uso para el login por email. token_hash guarda el
-- SHA-256 del token real (nunca el token en texto plano) para que un dump
-- de esta tabla no sirva para loguearse como nadie.
CREATE TABLE IF NOT EXISTS magic_link_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  token_hash CHAR(64) UNIQUE NOT NULL,
  expires_at DATETIME NOT NULL,
  used_at DATETIME NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- SSO de Google para admin: email/google_sub separados de admin_users.username
-- (login por password) a proposito, para que el admin pueda entrar por
-- cualquiera de los dos metodos sin que uno dependa del otro.
ALTER TABLE admin_users
  ADD COLUMN email VARCHAR(255) NULL UNIQUE AFTER username,
  ADD COLUMN google_sub VARCHAR(64) NULL UNIQUE AFTER email;
