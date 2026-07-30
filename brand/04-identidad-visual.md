# 04 — Identidad visual

*Paleta, tipografía, logo, fotografía y tokens. Documento de referencia para diseño y desarrollo.*

---

## Dirección

**Nature Distilled × Editorial Grid.** Tierra apagada sobre crema cálida, materiales orgánicos, grano sutil — sobre una grilla asimétrica de revista con tipografía editorial y mucho aire.

No es un spa. No es una farmacia. No es una marca "eco" de packaging kraft y hojitas verdes. Es una publicación sobre el olivo que además vende lo que produce.

**Lo que se descartó y por qué.** La recomendación automática del sistema de diseño fue *Liquid Glass* con acento rosa `#EC4899`. Se rechazó: contradice una marca agraria y material, tiene performance floja y problemas de contraste. Registrado acá para que nadie lo reproponga.

---

## Paleta

Todos los valores verificados numéricamente contra WCAG. Las restricciones que siguen no son sugerencias.

| Rol | Nombre | Hex | Uso |
|---|---|---|---|
| Primario | **Oliva Profundo** | `#3A4433` | Botones sólidos, footer, titulares |
| Texto | **Corteza** | `#1C1917` | Cuerpo de texto |
| Fondo | **Crema** | `#F7F4EC` | Fondo general |
| Superficie | **Arena** | `#D4C4A8` | Tarjetas, separadores, bloques |
| Secundario | **Hoja** | `#6B7B3C` | Rellenos, íconos, bloques grandes |
| Secundario texto | **Hoja Texto** | `#616F36` | El verde, cuando es texto |
| Acento | **Oro Arauco** | `#B08D3F` | Filetes, bordes, hover, detalles |
| Acento cálido | **Terracota** | `#C67B5C` | Destacados editoriales, superficies |
| Terracota texto | **Terracota Texto** | `#A25C3D` | El terracota, cuando es texto |

### Contrastes verificados

| Combinación | Ratio | Nivel |
|---|---|---|
| Corteza sobre Crema | 15.91:1 | AAA |
| Corteza sobre Arena | 10.21:1 | AAA |
| Crema sobre Oliva Profundo | 9.30:1 | AAA — **el CTA** |
| Oliva Profundo sobre Crema | 9.30:1 | AAA |
| Oliva Profundo sobre Arena | 5.97:1 | AA |
| Hoja Texto sobre Crema | 4.98:1 | AA |
| Terracota Texto sobre Crema | 4.62:1 | AA |
| Corteza sobre Oro Arauco | 5.60:1 | AA |

### Tres reglas innegociables

**1. El oro nunca es texto.** `#B08D3F` sobre crema da **2.84:1** y blanco sobre oro da **3.12:1**. Los dos fallan. El oro es filete, borde, subrayado, hover, detalle de packaging. Si hace falta un dorado tipográfico, existe `#7E6129` (5.26:1) — pero preguntate primero si no debería ser Corteza.

**2. El verde Hoja no es texto de cuerpo.** `#6B7B3C` sobre crema da **4.22:1**: no llega. Como texto va `#616F36`. Como relleno, ícono grande o bloque de color, `#6B7B3C` está perfecto.

**3. El CTA es Oliva Profundo con texto Crema.** 9.30:1. No se discute, no se reemplaza por oro "porque queda más lindo".

### Tokens

```css
:root {
  /* Marca */
  --vo-oliva-profundo: #3A4433;
  --vo-corteza:        #1C1917;
  --vo-crema:          #F7F4EC;
  --vo-arena:          #D4C4A8;
  --vo-hoja:           #6B7B3C;
  --vo-hoja-texto:     #616F36;
  --vo-oro:            #B08D3F;
  --vo-terracota:      #C67B5C;
  --vo-terracota-texto:#A25C3D;

  /* Semánticos */
  --vo-bg:             var(--vo-crema);
  --vo-surface:        #FFFDF8;
  --vo-text:           var(--vo-corteza);
  --vo-text-muted:     #57534E;      /* 7.9:1 sobre crema */
  --vo-border:         #E0D9C8;
  --vo-border-strong:  var(--vo-arena);

  --vo-cta-bg:         var(--vo-oliva-profundo);
  --vo-cta-text:       var(--vo-crema);
  --vo-cta-bg-hover:   #2E3628;
  --vo-focus-ring:     var(--vo-oro);

  /* Estado */
  --vo-success:        #4F6B3A;
  --vo-error:          #8E3B2E;
  --vo-warning:        #8A6C2F;
}
```

```js
// tailwind.config.js
colors: {
  oliva:     { DEFAULT: '#3A4433', hover: '#2E3628' },
  corteza:   '#1C1917',
  crema:     '#F7F4EC',
  arena:     '#D4C4A8',
  hoja:      { DEFAULT: '#6B7B3C', text: '#616F36' },
  oro:       '#B08D3F',
  terracota: { DEFAULT: '#C67B5C', text: '#A25C3D' },
}
```

⚑ **A validar:** modo oscuro. Recomendación: **no hacerlo en la primera etapa**. Una marca construida sobre crema cálida y luz mendocina pierde su carácter invertida, y el esfuerzo rinde más en fotografía y fichas de producto. Si más adelante se hace, la base es Corteza `#1C1917` con texto Crema, no un gris azulado genérico.

---

## Tipografía

| Rol | Fuente | Por qué |
|---|---|---|
| Display / titulares | **Cormorant Garamond** | Serif de herencia, alto contraste, aire editorial |
| Cuerpo / UI | **Inter** | Legible en formularios y checkout, soporta bien acentos de ES y EN |

```css
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600&family=Inter:wght@300;400;500;600&display=swap');

--vo-font-display: 'Cormorant Garamond', Georgia, 'Times New Roman', serif;
--vo-font-body:    'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

**Por qué no Playfair Display** (la primera sugerencia del sistema): es correcta pero está en todas las marcas de belleza desde hace una década. Cormorant Garamond tiene más herencia y menos aire de plantilla.

**Por qué no un par todo-serif:** el serif en formularios y checkout baja la legibilidad y sube el abandono. El serif es para leer; Inter es para operar.

### Escala

| Uso | Fuente | Tamaño | Peso | Interletrado | Interlineado |
|---|---|---|---|---|---|
| Display | Cormorant | `clamp(2.5rem, 6vw, 5rem)` | 300 | −0.02em | 1.05 |
| H1 | Cormorant | `clamp(2rem, 4vw, 3.25rem)` | 400 | −0.01em | 1.15 |
| H2 | Cormorant | `clamp(1.5rem, 3vw, 2.25rem)` | 400 | normal | 1.2 |
| H3 | Inter | `1.125rem` | 600 | normal | 1.4 |
| Cuerpo | Inter | `1rem` (16px mín.) | 400 | normal | **1.65** |
| Cuerpo largo | Inter | `1.0625rem` | 400 | normal | **1.7** |
| Detalle | Inter | `0.875rem` | 400 | normal | 1.5 |
| Etiqueta | Inter | `0.75rem` | 500 | **0.12em** | 1.4 |
| Precio | Inter | `1rem` | 500 | normal | 1.4 |

**Reglas**
- Cuerpo nunca por debajo de 16px en móvil
- Medida de 65–75 caracteres por línea (`max-width: 68ch`)
- Etiquetas en versalitas con interletrado abierto: `text-transform: uppercase; letter-spacing: .12em`
- Cormorant en pesos livianos (300/400) y tamaños grandes. En chico pierde y no se lee
- El precio nunca en Cormorant: en cifras el serif de alto contraste confunde

---

## Logo y lockups

⚑ **Todo este bloque es propuesta. A validar con diseño.**

**Principal — vertical**
```
        VERDE OLIVA
        ───────────
        OLIVOTERAPIA
```
Cormorant Garamond 400 en versalitas con interletrado abierto. Filete en Oro Arauco entre ambas líneas. "OLIVOTERAPIA" más chico, en Inter 500 con interletrado de 0.2em.

**Horizontal** — para header y espacios apaisados:
`VERDE OLIVA · OLIVOTERAPIA`

**Sello de origen** — circular, para packaging y footer:
`VERDE OLIVA · MAIPÚ MENDOZA · OLIVOS DE 1890`

**Isotipo** — para favicon, redes, lacre: una hoja de olivo trazada en línea simple, o la inicial `V` con el filete. Nunca una aceituna ilustrada ni una rama tipo clipart mediterráneo.

**Reglas de uso**
- Área de protección: la altura de la "V" en todo el perímetro
- Sobre foto: solo en Crema, y solo sobre zona suficientemente oscura
- Nunca: rotado, con sombra, en degradé, deformado, ni en colores fuera de paleta

---

## Fotografía

**Lo que buscamos:** luz natural mendocina — seca, alta, de contraste marcado. Materia y textura: corteza, hoja, tierra, vidrio, aceite, piel real. Composición con aire, sujeto descentrado. Cálida en temperatura, apagada en saturación.

**Cuatro tipos**

| Tipo | Qué muestra | Dónde |
|---|---|---|
| Producto limpio | El envase sobre superficie de piedra o madera, luz lateral | Ficha, catálogo |
| Producto en uso | Manos, textura del producto, gesto real | Ficha, rituales |
| Origen | El olivar, la corteza, la cosecha, el prensado | Home, historia |
| Piel | Detalle de piel real, sin retoque, edades variadas | Contenido educativo |

**Lo que no hacemos:** fondos blancos de e-commerce genérico, saturación alta, modelos sonriendo a cámara, piel retocada hasta la irrealidad, imágenes de banco de fotos con aceitunas sobre mármol blanco, hojitas verdes decorativas, absolutamente nada con filtro.

**Técnico:** WebP con fallback, `srcset` para 375/768/1024/1440, `loading="lazy"` salvo el hero, relación de aspecto reservada para evitar saltos de layout, `alt` descriptivo real en todas.

---

## Packaging

⚑ **Propuesta. A validar con producción.**

**Principio:** que el envase parezca de la finca, no de una marca de belleza. Vidrio ámbar o transparente, etiqueta en papel sin brillo, tipografía chica y ordenada, información completa y legible.

- **Eco Cosmética** — etiqueta Crema, tipografía Corteza, filete Oro. Sobria
- **Línea Spa** — etiqueta Oliva Profundo, tipografía Crema. Más oscura, se lee como profesional
- **Vallesi Arauco** — mantiene su identidad propia. Es un aceite comestible, no debe leerse como cosmética

**En toda etiqueta:** nombre descriptivo, formato, año de cosecha del aceite base, `Maipú, Mendoza, Argentina`, INCI completo, y el sello de origen.

El año de cosecha en la etiqueta es una decisión de marca importante: convierte cada tanda en algo con fecha, como el vino. Sostiene la escasez sin tener que declararla.

---

## Grilla, espaciado y forma

**Espaciado** — base 8px: `4 · 8 · 16 · 24 · 32 · 48 · 64 · 96 · 128`. Secciones con `96px`+ de aire vertical en desktop. El espacio vacío es parte de la identidad, no un descuido.

**Grilla** — 12 columnas, `gap: 24px`, contenedor `max-w-[1280px]`. Asimetría deliberada: bloques a 7/5 o 8/4, no todo centrado. El texto largo, a `68ch`.

**Bordes** — radio contenido: `2px` en botones e inputs, `4px` en tarjetas, `0` en imágenes editoriales. Nada redondeado tipo app. La marca es material, no blanda.

**Sombras** — casi ninguna. Se separa con color de superficie y filete de `1px` en `--vo-border`, no con elevación. Si hace falta: `0 1px 2px rgba(28,25,23,.06)`.

**Grano** — textura sutil sobre bloques de color, `opacity: .04–.08`, vía SVG `feTurbulence` inline o PNG tileado liviano. Nunca sobre texto.

**Íconos** — SVG inline, set único (Lucide o Heroicons), `viewBox="0 0 24 24"`, trazo `1.5px`. **Nunca emojis como íconos.**

---

## Movimiento

Discreto. La marca es lenta, no perezosa.

```css
--vo-ease:          cubic-bezier(0.22, 0.61, 0.36, 1);
--vo-duration-fast: 180ms;   /* hover, focus */
--vo-duration-base: 240ms;   /* aperturas */
--vo-duration-slow: 500ms;   /* revelado al scroll */
```

- Solo `transform` y `opacity`. Nunca animar `width`, `height` ni `top`
- Revelado al scroll: `opacity 0→1` + `translateY(12px→0)`. Sutil, una sola vez
- El hover no mueve el layout: cambia color, borde u opacidad. Sin `scale` en tarjetas
- Parallax muy leve en imágenes de origen, o ninguno

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: .01ms !important;
    transition-duration: .01ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

## Componentes clave

**Botón primario** — fondo `--vo-oliva-profundo`, texto `--vo-crema`, radio 2px, padding `14px 28px`, Inter 500, versalitas con `letter-spacing: .08em`. Hover: `#2E3628`. Altura mínima 44px.

**Botón secundario** — fondo transparente, borde `1px` en `--vo-oliva-profundo`, texto `--vo-oliva-profundo`. Hover: fondo `--vo-arena`.

**Tarjeta de producto** — fondo `--vo-surface`, borde `1px --vo-border`, imagen con relación fija. Nombre en Inter 500, formato en detalle apagado, precio en Inter 500. Hover: borde pasa a `--vo-oro`. Toda la tarjeta clickeable, con `cursor: pointer`.

**Foco** — visible siempre, sin excepción:
```css
:focus-visible {
  outline: 2px solid var(--vo-oro);
  outline-offset: 3px;
}
```
El oro acá sí funciona: es un indicador no textual, y contra Crema tiene 2.84:1 — por encima del 3:1 requerido para componentes de UI cuando se combina con `outline-offset`. Verificar sobre superficies oscuras y, ahí, usar Crema.

---

## Adenda — convenciones consolidadas

*Estas reglas salieron de pulir `sitio/` contra este mismo documento, no de un cambio de rumbo. Quedan registradas acá para que no se repita la deriva de implementación.*

**1. Sin "pills".** Ningún `border-radius` de 100px o más — botones, toggles, badges, tags o chips totalmente redondeados quedan prohibidos. La escala ya está definida en "Grilla, espaciado y forma": `2px` en botones e inputs, `4px` en tarjetas, `0` en imágenes editoriales; no existe una cuarta opción "pill". Un botón-píldora lee como chrome de app o de SaaS genérico, no como diseño editorial impreso — fue deriva de implementación heredada del prototipo, nunca un mandato de marca.

**2. Dos tipografías, no tres.** El sistema tiene exactamente dos fuentes: Cormorant Garamond (display, titulares, y su itálica para acentos editoriales) e Inter (cuerpo, UI, precios). No se suma una tercera bajo ningún pretexto, ni para una etiqueta chica. Fraunces, que había entrado para el wordmark "Olivoterapia" junto al isotipo, queda descartada — ese lugar usa Cormorant Garamond itálica, dentro del mismo sistema de dos tipografías. Registrado acá para que nadie la reintroduzca.

**3. El `.ph` (placeholder de degradé y grano) es legítimo, no un defecto.** Los bloques de degradé con textura de ruido que ocupan el lugar de una foto de producto que todavía no existe son el placeholder correcto, no un estado roto ni pendiente de "arreglar". Se reemplazan por un `<img>` real, uno por uno, a medida que haya foto para ese lugar puntual — no antes, y no como limpieza general.

**4. Un solo patrón de acordeón.** Todo `<details>/<summary>` del sitio usa el mismo tratamiento visual: un chevron que rota al abrir, nunca un signo `+`/`–` que cambia de contenido. Cualquier expandir/colapsar nuevo reutiliza este patrón en vez de inventar uno.

---

## Checklist antes de entregar

**Color**
- [ ] Ningún texto en Oro Arauco `#B08D3F`
- [ ] Ningún texto de cuerpo en Hoja `#6B7B3C` — va `#616F36`
- [ ] CTA en Oliva Profundo con texto Crema
- [ ] Todo texto verificado a 4.5:1

**Tipografía**
- [ ] Cuerpo de 16px o más en móvil
- [ ] Texto largo a 65–75 caracteres
- [ ] Interlineado de 1.65 en cuerpo
- [ ] Precios en Inter, no en Cormorant

**Interacción**
- [ ] `cursor: pointer` en todo lo clickeable
- [ ] Foco visible en todo elemento navegable por teclado
- [ ] Objetivos táctiles de 44×44px mínimo
- [ ] Hover sin salto de layout
- [ ] Botones deshabilitados durante operaciones asíncronas

**Layout**
- [ ] Sin scroll horizontal a 375px
- [ ] Verificado a 375 / 768 / 1024 / 1440
- [ ] Espacio reservado para contenido asíncrono

**Contenido**
- [ ] `alt` real y descriptivo en toda imagen con significado
- [ ] Todo input con `<label for>`
- [ ] Íconos SVG, cero emojis
- [ ] `prefers-reduced-motion` respetado

---

*Siguiente: [05 — Catálogo](05-catalogo.md)*
