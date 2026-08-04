-- Migracion para el panel de administrador sobre una base `verde_oliva`
-- ya existente (instalada antes de este cambio). Para una instalacion
-- nueva no hace falta correr esto: `schema.sql` ya incluye todo.
--
-- Uso:
--   mysql -u root -p verde_oliva < migrations/2026-08-admin-panel.sql
--
-- Las CREATE TABLE son idempotentes (IF NOT EXISTS). El ALTER TABLE no
-- lo es en todas las versiones de MySQL (ADD COLUMN IF NOT EXISTS recien
-- desde 8.0.29) — si esta migracion ya se corrio antes, un segundo intento
-- va a fallar con "Duplicate column name 'fulfillment_status'", lo cual es
-- inofensivo: significa que ya esta aplicada.

ALTER TABLE orders
  ADD COLUMN fulfillment_status ENUM('sin_preparar','preparando','enviado','entregado')
    NOT NULL DEFAULT 'sin_preparar';

CREATE TABLE IF NOT EXISTS products (
  sku VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  linea VARCHAR(255),
  formato VARCHAR(64),
  price_cents INT NOT NULL,
  stock_qty INT NOT NULL DEFAULT 0,
  active TINYINT(1) NOT NULL DEFAULT 1,
  image_path VARCHAR(512),
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admin_users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(64) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_login_at DATETIME
);
