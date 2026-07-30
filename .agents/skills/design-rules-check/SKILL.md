---
name: design-rules-check
description: >
  Enforces Verde Oliva brand design-token rules after any edit to sitio/*.html.
  Triggers automatically whenever the agent has just read, written, or analyzed
  a file matching `sitio/*.html`. Runs a token-drift and contrast audit and
  reports exact file+line violations before finishing the turn.
---

# Design Rules Check — Verde Oliva Olivoterapia

Ejecuta esta auditoría **al final del turno**, después de cualquier cambio o
inspección de un archivo en `sitio/`. No la omitas aunque el cambio parezca
trivial: el drift de hex ya ocurrió en los `.ph` de los 6 archivos y se detectó
exactamente así.

---

## 1. Conjunto canónico de tokens

El único conjunto de colores válido para `sitio/` es el definido en
`brand/04-identidad-visual.md`. No hay margen para "similares" o
"aproximaciones"; si el hex no está en esta lista, es una violación.

```
# Primitivos de marca
#3A4433   --vo-oliva-profundo
#1C1917   --vo-corteza
#F7F4EC   --vo-crema
#D4C4A8   --vo-arena
#6B7B3C   --vo-hoja
#616F36   --vo-hoja-texto
#B08D3F   --vo-oro
#C67B5C   --vo-terracota
#A25C3D   --vo-terracota-texto

# Semánticos
#FFFDF8   --vo-surface
#57534E   --vo-text-muted
#E0D9C8   --vo-border
#2E3628   --vo-cta-bg-hover

# Estado
#4F6B3A   --vo-success
#8E3B2E   --vo-error
#8A6C2F   --vo-warning

# Tipográfico de emergencia (dorado, solo si hay razón documentada)
#7E6129   (dorado tipográfico — 5.26:1 sobre crema)
```

**Cualquier hex que no esté en esta lista es token-drift** y debe reportarse
con archivo, número de línea, y el token canónico sugerido más cercano.

---

## 2. Tres reglas innegociables de contraste

Verifica cada una en cada archivo `sitio/*.html` que hayas tocado o que el
usuario mencione:

| # | Regla | Hex infractor | Motivo |
|---|---|---|---|
| R1 | `#B08D3F` (Oro Arauco) **nunca es texto** | `#B08D3F` | 2.84:1 sobre crema — falla AA |
| R2 | `#6B7B3C` (Hoja) **nunca es texto de cuerpo** | `#6B7B3C` | 4.22:1 sobre crema — falla AA |
| R3 | El CTA siempre es `background:#3A4433` + `color:#F7F4EC` | cualquier otra combinación | 9.30:1 — no se negocia |

Para R1: busca patrones donde `#B08D3F` o `var(--vo-oro)` aparezcan en una
propiedad `color:` aplicada a texto (no a `border`, `outline`, `background`, ni
`box-shadow`).

Para R2: busca `color: #6B7B3C` o `color: var(--vo-hoja)` en contextos de
cuerpo de texto (párrafos, spans, listas). Los íconos SVG con `fill: #6B7B3C`
son válidos; el texto corrido no.

Para R3: busca botones CTA — clase `.btn`, `[type="submit"]`, o el patrón de
"Añadir al carrito" — y verifica que usen `--vo-oliva-profundo` / `--vo-crema`.

---

## 3. Reglas tipográficas

| Regla | Cómo verificar |
|---|---|
| Precios en Inter | Busca elementos con clase que contenga `precio`, `price`, `amount`, o texto con `$` y verifica que `font-family` resuelva a Inter, no a Cormorant |
| Cuerpo ≥ 16px en móvil | Busca reglas `font-size` menores a `1rem` / `16px` en el bloque base o en `@media (max-width: …)` para `p`, `li`, `.body` |
| Cormorant solo en display/headings | Verifica que `font-family: var(--vo-font-display)` solo aparezca en `h1`–`h3` y clases `.display` / `.kicker` / `.lead` |

---

## 4. Procedimiento de auditoría

Ejecuta estos pasos en orden. Si no tienes el contenido del archivo en contexto,
léelo con `view_file` antes de reportar.

### Paso A — Buscar hex fuera de tokens

Usa `grep_search` con el regex `#[0-9A-Fa-f]{6}` sobre el archivo editado
y filtra manualmente los que no estén en el set canónico del §1.

Si el resultado contiene alguno de estos hex ya detectados en los gradientes
`.ph/.ph2/.ph3/.ph4/.ph5`, reportar con línea exacta y sugerencia:

| Hex encontrado | Token sugerido | Var CSS |
|---|---|---|
| `#8A9370` | `#6B7B3C` o `#3A4433` | `--vo-hoja` o `--vo-oliva-profundo` |
| `#EDE5D3` | `#F7F4EC` o `#FFFDF8` | `--vo-crema` o `--vo-surface` |
| `#B7A585` | `#D4C4A8` | `--vo-arena` |
| `#DFD3BA` | `#D4C4A8` o `#E0D9C8` | `--vo-arena` o `--vo-border` |
| `#F2ECDE` | `#F7F4EC` | `--vo-crema` |
| `#2A3226` | `#3A4433` o `#2E3628` | `--vo-oliva-profundo` o `--vo-cta-bg-hover` |

### Paso B — Verificar R1, R2, R3

Usa `grep_search` con `MatchPerLine: true` para:
- `color.*#B08D3F` o `color.*--vo-oro` → flaggear si está en texto (no border/outline/bg)
- `color.*#6B7B3C` o `color.*--vo-hoja[^-]` → flaggear si está en texto de cuerpo
- Botones CTA: verificar par `--vo-oliva-profundo` + `--vo-crema`

### Paso C — Verificar tipografía de precios

Busca `.precio`, `price`, `monto`, `$` y verifica que `font-family` apunte a
Inter, no a Cormorant Garamond ni a `var(--vo-font-display)`.

---

## 5. Formato del reporte

Si no hay violaciones, escribe una sola línea al pie de la respuesta:

> ✅ **Design check:** sin drift de tokens ni violaciones de contraste en `sitio/ARCHIVO.html`.

Si hay violaciones, escribe una tabla compacta **al final del turno**,
después de completar la tarea principal:

```markdown
## ⚠️ Design check — `sitio/ARCHIVO.html`

| Línea | Valor encontrado | Regla infringida | Corrección sugerida |
|-------|------------------|------------------|---------------------|
| 142   | #8A9370          | Token fuera de set | #6B7B3C (--vo-hoja) |
| 198   | color:#B08D3F    | R1 — oro como texto | Usar #7E6129 o --vo-corteza |
```

No interrumpir el flujo principal: la tabla va al final, después de que
la tarea del usuario esté completa.

---

## 6. Alcance

- **Aplica a:** `sitio/*.html` — los seis archivos del sitio deployable
  (`index.html`, `catalogo.html`, `producto.html`, `checkout-exito.html`,
  `checkout-error.html`, `checkout-pendiente.html`).
- **No aplica a:** `prototipo/` (vars locales propias, documento histórico),
  `brand/`, `api/`.
- **Cuándo ejecutar:** siempre que el turno haya incluido leer, editar o
  analizar al menos un archivo de `sitio/`. Si el turno no tocó `sitio/`,
  omitir silenciosamente.
- **No bloquea:** si hay violaciones, reportar y continuar. Esta skill informa;
  no detiene la tarea principal.
