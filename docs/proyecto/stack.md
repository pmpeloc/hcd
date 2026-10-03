# Stack tecnológico

Versiones consultadas en npm y crates.io el 2026-10-03. Al instalar, usar la última versión estable y anotar acá si cambia algo importante.

Estado: ✅ confirmado por el equipo · ⏳ pendiente de confirmar.

## General (todos los repos)

| # | Pieza | Elección | Versión | Estado |
|---|---|---|---|---|
| 1 | Gestor de paquetes | **npm** | 11.17 | ✅ |
| 2 | Lenguaje | **TypeScript 6.0.x** | 6.0 | ✅ Es la que usa el CLI de NestJS. TS 7 (7.0.2) es el compilador nuevo y NestJS depende de los decoradores: no arriesgar. Misma versión en todos los repos. |
| 3 | Validación | **Zod** | 4.6.5 | ✅ Mismos esquemas en API y app |
| 4 | Lint y formato | **ESLint + Prettier** | — | ✅ Es lo que generan por defecto el CLI de Nest y `create-next-app` |
| 5 | CI | **GitHub Actions** por repo | — | ✅ |
| 6 | Node.js | **24** | — | ✅ |

## Programa de Solana (dentro de `hcd_api`)

| # | Pieza | Elección | Versión | Estado |
|---|---|---|---|---|
| 7 | Framework | Rust + **Anchor** | anchor-lang 1.2.0 | ✅ En Windows exige **WSL** |
| 8 | Toolchain | Solana CLI + Anchor CLI (con `avm`) | Anchor CLI 1.2.0 | ✅ |
| 9 | Red | **Devnet** | — | ✅ Mainnet solo con auditoría externa |
| 10 | Tests | Tests de Anchor en TypeScript con casos negativos | — | ✅ |
| 11 | Cliente generado | **Codama** + `@codama/renderers-js` | 1.11.0 / 2.5.0 | ✅ Desde `idl/` |
| 12 | Librería de Solana | **`@solana/kit`** | 8.4.0 | ✅ |
| 13 | Cliente de Anchor para TS | **`@anchor-lang/core`** | 1.2.0 | ✅ Desde Anchor 1.x reemplaza a `@coral-xyz/anchor` |

## `hcd_api` (backend)

| # | Pieza | Elección | Versión | Estado |
|---|---|---|---|---|
| 14 | Framework | **NestJS** (`@nestjs/core`, `common`, `platform-express`) | 12.1.2 | ✅ |
| 15 | CLI | `@nestjs/cli` | 12.0.8 | ✅ |
| 16 | Configuración | `@nestjs/config` | 12.0.1 | ✅ |
| 17 | Base de datos | **`@supabase/supabase-js`**, sin ORM | 2.117.2 | ✅ |
| 18 | Migraciones y tipos | **Supabase CLI** (`supabase migration`, `supabase gen types`) | 2.119.0 | ✅ Los tipos de TypeScript se generan desde la base |
| 19 | Validación de requests | `ZodValidationPipe` propio (unas 10 líneas) | — | ✅ `nestjs-zod` 5.5.0 todavía no soporta NestJS 12; `class-validator` no comparte esquemas con la app |
| 20 | Auth | Guard que verifica el token con **`@privy-io/node`** | 0.35.0 | ✅ `@privy-io/server-auth` está deprecado |
| 21 | Rate limit | **`@nestjs/throttler`** | 6.7.1 | ✅ Reemplaza a `express-rate-limit`. Obligatorio por el fee payer. |
| 22 | Cabeceras de seguridad | `helmet` | 8.3.0 | ✅ |
| 23 | Cifrado de llaves | `node:crypto` nativo (HKDF + AES-GCM) | — | ✅ |
| 24 | Indexer | Provider de Nest con `onLogs` de `@solana/kit` | — | ✅ |
| 25 | Tests | **Jest** (el que trae Nest) + `@nestjs/testing` | 30.5.2 / 12.1.2 | ✅ Reemplaza a Vitest: Nest viene configurado para Jest |
| 26 | Hosting | **Railway** o **Render** | — | ⏳ |

## `hcd_app`

| # | Pieza | Elección | Versión | Estado |
|---|---|---|---|---|
| 27 | Framework | **Next.js** (App Router) | 16.3.8 | ✅ |
| 28 | UI | **React** | 19.3.0 | ✅ |
| 29 | Estilos | **Tailwind CSS** + **shadcn/ui** | 4.3.3 / 4.21.1 | ✅ |
| 30 | Login y wallet | **Privy** (`@privy-io/react-auth`) | 3.47.0 | ✅ Ver [por qué no Cavos](#por-qué-privy-y-no-cavos) |
| 31 | Datos del servidor | TanStack Query | 5.104.1 | ✅ |
| 32 | Formularios | React Hook Form + Zod | 7.89.0 | ✅ |
| 33 | QR | `qrcode` + `@yudiel/react-qr-scanner` | 1.5.4 / 2.6.0 | ✅ |
| 34 | Visor | `pdfjs-dist` en canvas, con marca de agua y datos del emisor | 6.4.299 | ✅ |
| 35 | Cifrado | WebCrypto nativo (AES-256-GCM, SHA-256) | — | ✅ |
| 36 | PWA y notificaciones | `@serwist/next` + Web Push | 9.5.12 | ✅ |
| 37 | Tests de punta a punta | Playwright | 1.63.0 | ✅ |
| 38 | Hosting | Vercel | — | ✅ |

## `hcd_landing`

| # | Pieza | Elección | Estado |
|---|---|---|---|
| 39 | Framework | **Next.js (export estático) + Tailwind + shadcn/ui** | ✅ Mismo stack que la app |
| 40 | Hosting | Vercel | ✅ |

## Servicios

| # | Pieza | Elección | Estado |
|---|---|---|---|
| 41 | Base de datos | PostgreSQL en **Supabase** | ✅ |
| 42 | Almacenamiento | **Supabase Storage** (solo archivos cifrados) | ✅ |
| 43 | RPC | **Helius** (plan gratuito) + RPC público de devnet como respaldo | ✅ |

## Pendientes de confirmar

1. **Hosting de la API:** Railway o Render.
2. **Segunda barrera de aislamiento (RLS) con supabase-js.** El plan v1 usaba `SET LOCAL` con un rol de base de datos, y eso no se puede hacer a través de supabase-js. Opciones:
   - **A (recomendada para el MVP):** el backend usa la clave secreta de Supabase y filtra por `organization_id` en una sola capa de acceso a datos. RLS queda activado y sin políticas para el rol anónimo, así nadie entra desde afuera. Se pierde la segunda barrera entre organizaciones.
   - **B:** el backend verifica el token de Privy y lo canjea por un JWT firmado con la llave de Supabase que incluye `organization_id`. Se lo pasa a supabase-js con la opción `accessToken`, y las políticas RLS filtran por ese dato. Es más seguro, pero lleva más trabajo. Referencias: [JWT en Supabase](https://supabase.com/docs/guides/auth/jwts), [canje de tokens](https://queen.raae.codes/2025-05-01-supabase-exchange/).

## Por qué Privy y no Cavos

Revisado el 2026-10-03 contra el [README de Cavos](https://github.com/cavos-labs/kit) y la [documentación de Privy](https://docs.privy.io/wallets/gas-and-asset-management/gas/solana).

| Lo que necesita nuestra arquitectura | Privy | Cavos |
|---|---|---|
| El backend arma la transacción con su propio fee payer y el usuario la firma | ✅ Documentado | ❌ Cavos arma y envía la transacción (`execute` / `executeInstructions`). No documenta firmar una transacción armada afuera. |
| Fee payer propio (decisión aceptada) | ✅ | ❌ Solo su relayer como fee payer, con lista de programas permitidos |
| Verificar en el backend quién es el usuario | ✅ `@privy-io/node` | ❌ No documenta verificación en el servidor |
| Login con email o Google | ✅ | ✅ (también Apple) |
| Está en el hub de recursos de Colosseum | ✅ | ❌ |
| Precio | Sin verificar: revisar su página de precios | Gratis hasta 1.000 wallets, después tarifa plana |

Cavos obligaría a cambiar tres decisiones ya tomadas: el fee payer propio, que el backend arme las transacciones y la verificación del usuario en el backend.
