-- Verde Oliva Olivoterapia — esquema MySQL
-- Copiado verbatim del plan aprobado (quirky-bubbling-parnas.md, Fase 3 y Fase 4).
-- La tabla `sessions` NO se crea aca: express-mysql-session la crea sola en el
-- primer arranque del servidor (createDatabaseTable: true por defecto).
--
-- Uso:
--   mysql -u root -p < schema.sql
-- o, si la base ya existe:
--   mysql -u root -p nombre_de_tu_base < schema.sql

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  google_sub VARCHAR(64) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  avatar_url VARCHAR(512),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_login_at DATETIME
);

CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id),
  status ENUM('pending','approved','rejected','cancelled','refunded') DEFAULT 'pending',
  mp_preference_id VARCHAR(64),
  mp_payment_id VARCHAR(64) UNIQUE,
  currency CHAR(3) DEFAULT 'ARS',
  subtotal_cents INT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL REFERENCES orders(id),
  sku VARCHAR(64) NOT NULL,
  name VARCHAR(255) NOT NULL,
  unit_price_cents INT NOT NULL,
  qty INT NOT NULL,
  line_total_cents INT NOT NULL
);
