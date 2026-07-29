# Verde Oliva — API

Backend Express (JS plano, sin TypeScript) para login con Google, sesiones en
MySQL y checkout con Mercado Pago. Sirve tambien el sitio estatico de
`sitio/` desde el mismo proceso y origen — no hay CORS que configurar porque
no hay cross-origin.

Ver `/Users/ginolocatelli/.claude/plans/quirky-bubbling-parnas.md` para el
plan completo (arquitectura, decisiones ya cerradas, fases). Este directorio
implementa las Fases 3 y 4 de ese plan.

## Instalar

```bash
cd api
npm install
```

## Configurar variables de entorno

```bash
cp .env.example .env
```

Completar `.env` con:

- `GOOGLE_CLIENT_ID` — Google Cloud Console > APIs & Services > Credentials
  > OAuth 2.0 Client ID (Web application). Solo el Client ID, no el Secret.
- `MERCADOPAGO_ACCESS_TOKEN` — panel de developers de Mercado Pago,
  credenciales de **prueba** primero, nunca las de produccion hasta el final.
- `SESSION_SECRET` — string random largo, por ejemplo:
  `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`
- `DB_HOST` / `DB_USER` / `DB_PASS` / `DB_NAME` — credenciales de tu MySQL
  (local en desarrollo, el de Hostinger en produccion).
- `PORT` — puerto donde escucha el proceso Node.
- `NODE_ENV` — dejar sin definir o `development` en local. Solo en
  `production` se activa la cookie de sesion `secure` (requiere HTTPS).

`.env` esta en `.gitignore` — nunca se commitea.

## Migrar el esquema

Con un MySQL corriendo y accesible con las credenciales del `.env`:

```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS verde_oliva"
mysql -u root -p verde_oliva < schema.sql
```

`schema.sql` crea `users`, `orders` y `order_items` — las tres tablas del
plan aprobado, copiadas verbatim de ahi. La tabla `sessions` **no** esta en
`schema.sql`: `express-mysql-session` la crea sola en el primer arranque
del servidor.

## Correr en local

```bash
npm run dev    # node --watch server.js
# o
npm start      # node server.js
```

Sirve `sitio/index.html` en `http://localhost:3000/` (o el `PORT` que
hayas puesto) y la API en `http://localhost:3000/api/*`, mismo proceso y
origen.

## Deploy (Hostinger)

Pensado para el **Node.js Selector** de hPanel (Hostinger Cloud/Business
Hosting): un unico proceso Node sirve `sitio/` estatico y `/api/*` desde el
mismo origen — justamente para no depender de configurar CORS ni cookies
cross-origin en un hosting compartido. Pasos generales: crear la app Node en
el selector apuntando a `api/server.js`, cargar las mismas variables de
entorno de `.env` como env vars del panel (nunca subir `.env` al server por
FTP/git), correr `schema.sql` contra la base MySQL que provee Hostinger, y
apuntar el `GOOGLE_CLIENT_ID`/orígenes autorizados y las `back_urls` de
Mercado Pago al dominio real antes de probar una compra de punta a punta.
