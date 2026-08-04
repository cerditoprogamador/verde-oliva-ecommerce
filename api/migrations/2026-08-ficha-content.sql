-- Migracion: contenido educativo de ficha editable desde el admin.
-- Agrega a `products` los campos de la estructura fija de ficha
-- (brand/07-estrategia-ecommerce.md): para que sirve/para que piel/cuando/
-- como/que esperar -> combina con -> origen -> ingredientes/seguridad.
--
-- NULL en estos campos para los 17 SKU originales = "sin override", la
-- ficha estatica sigue mostrando su copy curado a mano; solo cambia si el
-- admin carga contenido aca. Para un producto creado 100% desde el panel
-- (sin producto-<sku>.html propio), estos campos SON el contenido de su
-- ficha generica (ver sitio/producto-generic.html).
--
-- Uso:
--   mysql -u root -p verde_oliva < migrations/2026-08-ficha-content.sql

ALTER TABLE products
  ADD COLUMN ficha_lead TEXT,
  ADD COLUMN para_que_sirve TEXT,
  ADD COLUMN para_que_piel TEXT,
  ADD COLUMN cuando_usar TEXT,
  ADD COLUMN como_usar TEXT,
  ADD COLUMN que_esperar TEXT,
  ADD COLUMN origen TEXT,
  ADD COLUMN ingredientes_inci TEXT,
  ADD COLUMN seguridad TEXT,
  ADD COLUMN combina_con TEXT;
