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
| 20 | Auth | Guard de Nest que verifica el token de **Supabase Auth** con `auth.getClaims(token)` de supabase-js (llaves públicas, ES256) | — | ✅ Ver [patrón multi-organización](#patrón-multi-organización-con-rls) |
| 20b | Acceso a datos por usuario | Un cliente supabase-js **por request**, con la clave pública y el token del usuario: RLS decide qué filas ve | — | ✅ |
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
| 30 | Login | **Supabase Auth** (email y Google) con `@supabase/supabase-js` | 2.117.2 | ✅ |
| 30b | Wallet | **Privy** (`@privy-io/react-auth`) en modo "custom auth": recibe el token de Supabase y crea la wallet embebida de Solana | 3.47.0 | ⏳ Falta la prueba de 1 hora (ver pendientes). Ver [por qué no Cavos](#por-qué-privy-y-no-cavos). |
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
| 41 | Base de datos | PostgreSQL en **Supabase**, con RLS | ✅ |
| 41b | Autenticación | **Supabase Auth** con firma de tokens asimétrica (JWKS) | ✅ Obligatorio para que Privy valide los tokens |
| 42 | Almacenamiento | **Supabase Storage** (solo archivos cifrados) | ✅ |
| 43 | RPC | **Helius** (plan gratuito) + RPC público de devnet como respaldo | ✅ |

## Pendientes de confirmar

1. **Hosting de la API:** Railway o Render.
2. **Prueba de 1 hora: Privy con Supabase Auth y Solana.** La [guía de Privy](https://docs.privy.io/recipes/authentication/using-supabase-for-custom-auth) no dice si el modo "custom auth" crea wallets de Solana. Probar antes de construir encima: login con Supabase, Privy crea la wallet de Solana, se firma una transacción en devnet con nuestro fee payer. **Si falla:** el login vuelve a Privy y el backend canjea el token de Privy por uno firmado con la llave de Supabase para que RLS lo reconozca ([JWT en Supabase](https://supabase.com/docs/guides/auth/jwts)).

## Patrón multi-organización con RLS

Cómo se aíslan los datos entre clínicas, para que nadie dependa de la memoria de otro proyecto:

1. **Supabase Auth emite el token** del usuario. El frontend se lo manda al backend en cada request.
2. **El backend (guard de Nest)** lo verifica con `supabase.auth.getClaims(token)` y toma solo el `sub` (id del usuario). El rol y la organización se leen de la tabla `app_user`, **nunca** de datos dentro del token.
3. **Para leer, el backend crea un cliente por request** con la clave pública y el token del usuario:
   ```ts
   createClient(url, anonKey, {
     global: { headers: { Authorization: `Bearer ${jwt}` } },
     auth: { persistSession: false, autoRefreshToken: false },
   });
   ```
   Así RLS decide qué filas ve el usuario; el código no filtra a mano.
4. **En la base**, cada tabla de dominio tiene `organization_id` y RLS activado en la misma migración que la crea. Una función busca la organización del usuario activo:
   ```sql
   create or replace function public.get_my_organization_id() returns uuid
   language sql stable security definer set search_path = ''
   as $$ select organization_id from public.app_user where id = auth.uid() and status = 'active' $$;

   create policy records_select_mine on public.records
     for select to authenticated using (organization_id = public.get_my_organization_id());
   ```
   Los pacientes no pertenecen a una organización: sus políticas comparan contra su propio id (por ejemplo, `patient_user_id = auth.uid()`).
5. **Solo el backend escribe.** El rol `authenticated` tiene solo `SELECT` (insert, update y delete revocados). Las escrituras van con la clave secreta (filtrando siempre por la organización) o con funciones RPC `security definer`.
6. **Ojo:** una RPC `security definer` habilitada para `authenticated` es un endpoint público en sí misma (`/rest/v1/rpc/...`) y se saltea los guards de Nest. Adentro tiene que validar usuario, organización y rol leyéndolos de `app_user`.
7. **Tests de RLS:** con pgTAP en `supabase/tests/`, simulando usuarios con `set local role authenticated` y `set_config('request.jwt.claim.sub', '<uuid>', true)`.

Es el mismo patrón que el equipo ya usó en otros proyectos multi-cliente con NestJS y Supabase.

## Por qué Privy y no Cavos

Revisado el 2026-10-03 contra el [README de Cavos](https://github.com/cavos-labs/kit) y la [documentación de Privy](https://docs.privy.io/wallets/gas-and-asset-management/gas/solana).

| Lo que necesita nuestra arquitectura | Privy | Cavos |
|---|---|---|
| El backend arma la transacción con su propio fee payer y el usuario la firma | ✅ Documentado | ❌ Cavos arma y envía la transacción (`execute` / `executeInstructions`). No documenta firmar una transacción armada afuera. |
| Fee payer propio (decisión aceptada) | ✅ | ❌ Solo su relayer como fee payer, con lista de programas permitidos |
| Verificar en el backend quién es el usuario | ✅ (ahora lo hace Supabase Auth, y Privy acepta su token) | ❌ No documenta verificación en el servidor |
| Usar las dos a la vez | — | ❌ Cada una crea su propia wallet: el usuario tendría dos identidades y la wallet de Cavos igual no acepta nuestro fee payer. Decidido: solo Privy. |
| Login con email o Google | ✅ | ✅ (también Apple) |
| Está en el hub de recursos de Colosseum | ✅ | ❌ |
| Precio | Sin verificar: revisar su página de precios | Gratis hasta 1.000 wallets, después tarifa plana |

Cavos obligaría a cambiar tres decisiones ya tomadas: el fee payer propio, que el backend arme las transacciones y la verificación del usuario en el backend.
