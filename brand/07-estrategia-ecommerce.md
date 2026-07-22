# 07 — Estrategia ecommerce

*Cómo se traduce la marca en un sitio que vende.*

---

## El principio

**La tienda y el contenido no son dos cosas.**

La mayoría de las marcas tienen un ecommerce y, al costado, un blog que nadie lee. Acá el contenido educativo es la razón por la que alguien nos elige, así que va entretejido: en la home, en el catálogo, dentro de cada ficha.

La prueba: si sacás el carrito, tiene que quedar algo que valga la pena leer.

---

## Mapa del sitio

```
/                             Home
/tienda                       Catálogo completo
  /tienda/eco-cosmetica       Línea Eco (12)
  /tienda/linea-spa           Línea Spa (4)
  /tienda/aceite              Vallesi Arauco (1)
  /tienda/packs               Packs por ritual
  /tienda/[producto]          Ficha
/rituales                     Los 5 rituales
  /rituales/[ritual]          Limpiar · Hidratar · Exfoliar · Masajear · Bañarse
/olivoterapia                 El pilar educativo
  /olivoterapia/que-es
  /olivoterapia/tu-piel       Guía por tipo de piel
  /olivoterapia/notas         Artículos
/origen                       La historia, 1890, el olivar
/nosotros                     Quiénes somos
/ayuda                        Envíos · Devoluciones · FAQ
/contacto
/carrito · /checkout · /cuenta
```

Estructura espejada en `/en/`.

**Tres decisiones de estructura**

`/rituales` existe como sección propia, no como filtro del catálogo. Es la traducción navegable del diferencial: entrás por lo que querés hacer, no por lo que querés comprar.

`/olivoterapia` es la apuesta de SEO. Ver más abajo.

`/origen` y `/nosotros` van separados: uno cuenta la tierra, el otro cuenta quiénes la trabajan. Mezclarlos diluye ambos.

---

## Los tres recorridos

### A · La que ya nos conoce la mano
*Ya usó el producto. Solo quiere recomprar.*

`Entra → busca el producto exacto → carrito → checkout`

**Lo que necesita:** velocidad. Nada de educación, nada de convencer.
**Qué construimos:** buscador que tolere el nombre coloquial ("la crema del hotel"), recompra en un clic desde el historial, checkout de invitado, email post-estadía con código.
**Métrica:** tiempo hasta el carrito. Debería ser menos de un minuto.

### B · La que lee la etiqueta
*Todavía no nos conoce. Va a investigar antes de gastar.*

`Llega por búsqueda o contenido → lee → mira producto → vuelve a leer → compra`

Este recorrido **no es lineal y puede durar semanas**. El sitio tiene que soportar la ida y vuelta entre contenido y producto sin que se pierda.

**Lo que necesita:** entender el mecanismo, verificar el origen, no sentir que la están apurando.
**Qué construimos:** contenido enlazado a producto y producto enlazado a contenido, INCI visible, el bloque "qué esperar" en cada ficha, cero pop-ups de descuento.
**Métrica:** conversión de quien leyó contenido vs. quien no. Es la métrica que valida toda la estrategia.

### C · La que busca el regalo con historia
*Compra para otro. Tiene poco tiempo.*

`Llega → busca "regalo" → pack → checkout`

**Lo que necesita:** que le resuelvan la decisión.
**Qué construimos:** `/tienda/packs` accesible desde el menú principal, el pack **1890** destacado, envío a terceros con nota, foto real de cómo llega.
**Métrica:** penetración de packs.

---

## La ficha de producto

La pieza más importante del sitio. Es donde se demuestra que la marca sabe de lo que habla.

```
┌─────────────────────┬───────────────────────────────┐
│                     │  Línea · Necesidad            │
│   Foto principal    │  NOMBRE DEL PRODUCTO          │
│                     │  Formato · Precio             │
│   [miniaturas]      │  Una línea de qué es          │
│                     │  [ SUMAR AL CARRITO ]         │
│                     │  Envíos · Stock de la tanda   │
└─────────────────────┴───────────────────────────────┘

  PARA QUÉ SIRVE
  PARA QUÉ PIEL          ← el bloque educativo,
  CUÁNDO USARLO             desplegado por defecto,
  CÓMO USARLO               no escondido en pestañas
  QUÉ ESPERAR (y qué no)

  ─────────────────────────────────────────────────
  COMBINA CON        → 2-3 productos, con el porqué
  ─────────────────────────────────────────────────
  EL ORIGEN          → 2 líneas + link a /origen
  ─────────────────────────────────────────────────
  INGREDIENTES (INCI)  → desplegable
  SEGURIDAD            → la frase estándar
  ─────────────────────────────────────────────────
  DEL RITUAL DE [X]  → link al ritual que integra
```

**Cuatro reglas**

1. **El bloque educativo no va en pestañas.** Va desplegado. Esconderlo es tirar el diferencial a la basura.
2. **"Qué esperar" incluye qué NO esperar.** Sin excepción. Es lo que más confianza construye y lo primero que alguien va a querer sacar.
3. **"Combina con" explica el porqué.** No es "también te puede gustar": es "el exfoliante grueso antes del aceite corporal, porque así entra mejor".
4. **El precio nunca tachado.** No hay precio de referencia inflado.

---

## Catálogo: tres entradas

El mismo catálogo, tres formas de entrar. Ninguna es "la correcta" — depende de quién llegue.

| Entrada | Para quién |
|---|---|
| **Por línea** — Eco / Spa / Aceite | Quien ya conoce la marca |
| **Por necesidad** — limpiar, hidratar, exfoliar, masajear, baño, capilar, mesa | Quien sabe qué problema tiene, no qué producto lo resuelve |
| **Por ritual** — los 5 rituales completos | Quien quiere que le resuelvan la decisión |

**La entrada por necesidad debería ser la principal.** Es la que refleja cómo piensa realmente alguien que busca (nadie se levanta queriendo "una emulsión"), y es coherente con una marca que enseña.

Filtros: línea, necesidad, formato, precio, tipo de piel. Orden: relevancia, precio, novedades. Nunca "más vendidos" como orden por defecto — empuja a todo el mundo a los mismos tres productos y desaprovecha el catálogo.

---

## Bilingüe ES/EN

**Estructura:** `/` para español, `/en/` para inglés. Rutas traducidas (`/tienda` ↔ `/en/shop`), `hreflang` recíproco en todas las páginas, `<html lang>` correcto.

**Detección:** sugerir por idioma del navegador con un aviso discreto, **nunca redirigir a la fuerza**. Y recordar la elección.

**Contenido:** el inglés es reescritura, no traducción. Ver las reglas en [03](03-identidad-verbal.md#bilingüe-esen).

**Comercial:** ARS para Argentina, USD para el resto. El aviso de qué países tienen envío debe estar visible **antes** del checkout, no descubrirse al final.

⚑ **A validar:** qué países se atienden en la primera etapa. Recomendación: Argentina completa desde el día uno, y el resto por consulta hasta tener la logística resuelta. Prometer envío internacional antes de poder cumplirlo es la forma más rápida de quemar la reputación que estamos construyendo.

---

## Envíos, devoluciones, pagos

⚑ **Todo este bloque a validar con operaciones.**

**Envíos.** Envío gratis a partir de un umbral (sugerencia: $60.000, apenas por encima del ticket de dos productos, para empujar el segundo). Costo visible desde el carrito, nunca sorpresa en el checkout. Plazo real, no optimista. Seguimiento por email.

**Preparación.** El paquete importa: es el primer contacto físico con la marca para quien nunca estuvo en la finca. Sin plástico innecesario, con una nota impresa, y el sello de origen visible.

**Devoluciones.** Cosmética abierta no se puede devolver por razones sanitarias — decirlo con claridad y de antemano. Producto fallado o dañado en tránsito: reposición sin discusión. **Y una política propia:** si algo no te funcionó, queremos saberlo. No como gesto de marketing, sino porque es la métrica que nos avisa si el discurso se está estirando de más.

**Pagos.** Mercado Pago (imprescindible en Argentina), tarjeta, transferencia con descuento. Checkout de invitado siempre disponible: obligar a crear cuenta es la forma más simple de perder al cliente A.

---

## Email

Sin bombardeo. La marca es lenta también acá.

| Email | Cuándo | Qué dice |
|---|---|---|
| Confirmación | Al comprar | Qué compraste, cuándo llega |
| En camino | Al despachar | Seguimiento |
| Cómo usarlo | 3 días después de entregado | El ritual del producto que compró. **Educativo, no comercial** |
| Cómo te fue | 3 semanas después | Pregunta real, con respuesta directa a una persona |
| Recompra | Según duración estimada | Solo del producto que ya usó |
| La cosecha | Otoño, una vez al año | El momento del año. El mejor email de la marca |

**Bienvenida (3 emails):** qué es la olivoterapia → los 5 rituales → el olivar de 1890. Ninguno vende. Si funcionan, la compra viene sola.

**Lo que no hacemos:** pop-up de descuento al entrar, carritos abandonados con urgencia, "te extrañamos", más de un email por semana.

---

## SEO

**La apuesta central: quedarnos con "olivoterapia".**

Es un término de bajo volumen y baja competencia. Eso es exactamente lo que lo hace viable: podemos ser el primer resultado en español y construir la categoría en vez de pelear por una existente.

**Términos por prioridad**

*Categoría (nuestros):* olivoterapia · olivoterapia qué es · cosmética con aceite de oliva · polifenoles de oliva para la piel

*Producto:* aceite corporal de oliva · crema facial con aceite de oliva · exfoliante corporal natural argentina

*Origen:* aceite de oliva arauco · aceite de oliva Maipú Mendoza · aceite de oliva monovarietal argentino

*Long tail educativo (donde más rinde):* se puede usar aceite de oliva en la cara · aceite de oliva para la piel seca · piel seca o deshidratada diferencia · qué es el escualeno

*EN:* olive polyphenols skincare · olivoterapia · argentinian olive oil skincare

**Técnico:** cada ficha con `Product` + `Offer` schema, cada nota con `Article`, FAQ con `FAQPage`. `hreflang` correcto. Imágenes en WebP con `alt` real. Core Web Vitals cuidados — con este diseño, ligero y sin librerías pesadas, es alcanzable.

---

## Stack

**Recomendación: Next.js (App Router) en Vercel.**

Por qué encaja: i18n nativo para ES/EN, renderizado en servidor para que el contenido educativo posicione, imágenes optimizadas sin trabajo extra (crítico en un sitio tan fotográfico), y ISR para revalidar stock sin reconstruir el sitio entero.

**Contenido:** el educativo en MDX versionado en el repo — es contenido de marca, cambia poco y gana en velocidad y control. El catálogo, en la plataforma de comercio.

⚑ **A validar — la decisión más importante del proyecto:**

| Opción | A favor | En contra |
|---|---|---|
| **Shopify headless** | Pagos, stock, envíos y fiscalidad resueltos. Mercado Pago disponible | Costo mensual en USD |
| **Medusa / Vendure** autoalojado | Control total, sin costo por transacción | Hay que operarlo. Fiscalidad argentina a cargo nuestro |
| **Tiendanube** | Pensado para Argentina, integraciones locales listas | Menos flexible para el frontend a medida que esta marca necesita |

Para 17 SKU y un equipo chico, **Shopify headless** es probablemente lo correcto: la marca vive en el frontend, y la operación no se quiere reinventar.

---

## Métricas

| Qué | Por qué |
|---|---|
| Conversión con contenido leído vs. sin | **La métrica clave.** Valida toda la estrategia |
| % de pedidos de clientes con estadía previa | Salud del cliente A |
| Penetración de packs | Salud del cliente C y del ticket |
| Unidades por pedido | ¿Se vende el ritual o el producto suelto? |
| Posición orgánica de "olivoterapia" | La apuesta de categoría |
| Devoluciones por expectativa no cumplida | **Si sube, el discurso se está estirando** |
| Recompra a 90 días | Si el producto es bueno, tiene que existir |

---

## Etapas

**1 · Lanzamiento.** Home, catálogo por línea y por necesidad, 17 fichas completas, `/origen`, `/olivoterapia/que-es`, checkout, ES + EN, envíos a Argentina.

**2 · Profundidad.** Los 5 rituales, guía por tipo de piel, packs, emails de bienvenida, primeras notas.

**3 · Expansión.** Cuenta y recompra en un clic, reseñas verificadas, calendario de cosecha, envío internacional, contenido continuo.

**Regla que ordena las tres:** no se suma un SKU hasta que los 17 que hay estén explicados hasta el fondo. La profundidad es el producto.

---

*Siguiente: [08 — Copy maestro](08-copy-maestro.md)*
