-- Migracion: contenido bilingue (ES/EN) opcional por campo + galeria de
-- hasta 4 fotos por producto (aplica a los 17 SKU originales y a los
-- creados desde el admin).
--
-- Cada campo _en es opcional: si esta vacio, la ficha en ingles muestra el
-- texto en espanol como fallback (ver sitio/js/products.js). Esto respeta
-- la regla de marca de que el ingles es una reescritura curada, no una
-- traduccion literal automatica (brand/03-identidad-verbal.md).
--
-- gallery_images es JSON: array de hasta 3 paths adicionales de imagen
-- (la foto principal sigue en image_path, sin cambios, para no romper las
-- referencias hardcodeadas img/productos/<sku>.jpg que ya existen en las
-- 17 fichas curadas).
--
-- Uso:
--   mysql -u root -p verde_oliva < migrations/2026-08-bilingual-gallery.sql

ALTER TABLE products
  ADD COLUMN ficha_lead_en TEXT,
  ADD COLUMN para_que_sirve_en TEXT,
  ADD COLUMN para_que_piel_en TEXT,
  ADD COLUMN cuando_usar_en TEXT,
  ADD COLUMN como_usar_en TEXT,
  ADD COLUMN que_esperar_en TEXT,
  ADD COLUMN origen_en TEXT,
  ADD COLUMN ingredientes_inci_en TEXT,
  ADD COLUMN seguridad_en TEXT,
  ADD COLUMN gallery_images TEXT;
