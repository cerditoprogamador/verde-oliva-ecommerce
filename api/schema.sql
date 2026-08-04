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
  fulfillment_status ENUM('sin_preparar','preparando','enviado','entregado') NOT NULL DEFAULT 'sin_preparar',
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

-- Catalogo de productos editable desde el panel de administrador (ver
-- admin-panel.md / plan aprobado). order_items NO tiene FK viva a esta
-- tabla a proposito: guarda su propio sku/name/unit_price_cents como
-- snapshot al momento de la compra, asi que editar o borrar un producto
-- aca nunca corrompe pedidos historicos.
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
  -- Contenido educativo de la ficha (brand/07, estructura fija: para que
  -- sirve/para que piel/cuando/como/que esperar -> combina con -> origen ->
  -- ingredientes/seguridad). NULL en un producto de los 17 originales
  -- significa "sin override": la ficha estatica sigue mostrando su copy
  -- curado a mano tal cual; solo se pisa si el admin carga un valor aca.
  -- En un producto creado 100% desde el admin (sin ficha .html propia),
  -- estos campos SON el contenido: los renderiza producto-generic.html.
  ficha_lead TEXT,
  para_que_sirve TEXT,
  para_que_piel TEXT,
  cuando_usar TEXT,
  como_usar TEXT,
  que_esperar TEXT,
  origen TEXT,
  ingredientes_inci TEXT,
  seguridad TEXT,
  combina_con TEXT, -- JSON: [{"sku":"...","why":"...","why_en":"..."}, ...] (hasta 3)
  -- Version en ingles de cada campo de arriba, opcional. Vacio = fallback
  -- al texto en espanol aunque el sitio este en ingles (ver sitio/js/products.js)
  -- porque el ingles de marca es una reescritura curada, no una traduccion
  -- literal automatica (brand/03-identidad-verbal.md#bilingüe-esen).
  ficha_lead_en TEXT,
  para_que_sirve_en TEXT,
  para_que_piel_en TEXT,
  cuando_usar_en TEXT,
  como_usar_en TEXT,
  que_esperar_en TEXT,
  origen_en TEXT,
  ingredientes_inci_en TEXT,
  seguridad_en TEXT,
  -- Galeria: image_path sigue siendo la foto principal (no cambia el
  -- nombre de archivo <sku>.<ext>, para no romper referencias hardcodeadas
  -- en las 17 fichas curadas). gallery_images es JSON: array de hasta 3
  -- paths adicionales (<sku>-2.<ext>, <sku>-3.<ext>, <sku>-4.<ext>).
  gallery_images TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cuenta(s) del panel de administrador — deliberadamente separada de
-- `users` (login Google de clientes): usuario/contraseña propio, sin
-- ninguna relacion con cuentas de cliente.
CREATE TABLE IF NOT EXISTS admin_users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(64) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_login_at DATETIME
);
