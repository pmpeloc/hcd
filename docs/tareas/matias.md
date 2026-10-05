# Tareas · Matías (backend NestJS + plomería de la app)

**Rol:** API NestJS, base de datos con RLS, storage de archivos cifrados, esquemas Zod, indexer de eventos, y la plomería de `hcd_app` (login, Privy, cliente API, clínica/admin, PWA). Ver [reasignación del 5/10](../proyecto/decisiones.md).
**Respaldo:** Franco.
**Repos:** `hcd_api` — `supabase/` y `src/` (módulos `auth`, `organizations`, `records`, `access`, `indexer`, `common`). `hcd_app` — plomería y rutas de back-office. Franco toca `src/keys/` y `src/tx/`; Maxi toca `(paciente)`, `(medico)` y `components/`.

## Archivos y módulos bajo tu responsabilidad

En `hcd_api`:

- `supabase/migrations/` — tablas, RLS y rol `app_user` (migraciones con Supabase CLI).
- `src/auth/` — guard que verifica el token de Supabase Auth (`auth.getClaims`).
- `src/organizations/` — clínicas, médicos y verificación por el admin.
- `src/records/` — URLs firmadas, metadatos de estudios, llave envuelta (tabla).
- `src/access/` — solicitudes de acceso y notificaciones.
- `src/indexer/` — provider con `onLogs` que escucha los eventos del programa.
- `src/common/` — esquemas Zod de los endpoints, `ZodValidationPipe`, configuración, errores, logs.
- `package.json`, CI del repo, `.env.example`, README del backend.

En `hcd_app` (la plomería que Maxi consume):

- `app/(auth)/login/` — pantalla de login con Supabase Auth (email y Google).
- `app/(clinica)/avalar-medicos` y `app/(admin)/verificar` — back-office que consume tus propios endpoints de `organizations` y `admin/verify`.
- `lib/api.ts` — cliente HTTP hacia la API con el token del usuario.
- `lib/supabase.ts` — cliente de Supabase Auth en el navegador.
- `lib/privy.ts` — Privy en modo "custom auth": wallet embebida de Solana a partir del token de Supabase.
- `lib/schemas/` — copia de tus esquemas Zod: como los escribís vos, la copia queda exacta.
- `lib/hcd-client/` — cliente Codama generado del IDL (con Franco).
- PWA: `public/manifest.json`, `@serwist/next` y Web Push; guards de ruta y estados globales de carga/error.

**No tocar:** `programs/`, `tests/`, `idl/` (Misael); `src/keys/` y `src/tx/` (Franco); `app/(paciente)`, `app/(medico)` y `components/` (Maximiliano); `lib/crypto/` (Franco); `pitch/`, `demo/`, landing (Rodrigo).

## Plan día por día

### Día 1 · sáb 3/10 (base)
- Pasos 1 y 2 (Luma + Arena).
- Crear el proyecto de Supabase y la estructura de `hcd_api` (NestJS 12 + TypeScript 6 + npm, CLI de Nest, ESLint/Prettier, Jest).
- Esqueleto de módulos y `.env.example` con los nombres (sin valores).

### Día 2 · dom 4/10 (auth + RLS + plomería) — puerta G1
- Kickoff técnico: congelar contratos de API (endpoints y esquemas) con Franco.
- Guard de auth: verifica el token de Supabase con `getClaims`, toma solo el `sub`; rol y organización se leen de `app_user`, **nunca** del token.
- Migraciones: `app_user`, `organizations`, `staff_members`, `doctors`, `records`, `access_requests`, `audit_events`, `key_releases`; `organization_id` en cada tabla de dominio, RLS activado en la misma migración y función `get_my_organization_id()` (patrón de stack.md).
- Plomería de la app: `lib/api.ts` (fetch con token), `lib/supabase.ts` y guard de sesión en el layout `(auth)`.

### Día 3 · lun 5/10 (organizations + login)
- Endpoints de organizaciones: alta de clínica y de médicos, `POST /admin/providers/:id/verify` (admin).
- Cliente supabase-js por request con el token del usuario para las lecturas (RLS decide); escrituras solo con la clave secreta filtrando por organización.
- Pantalla `app/(auth)/login` (email y Google) y `lib/privy.ts`: Privy en modo custom auth con el token de Supabase — usa la prueba de 1 hora que hace Franco hoy; si falla, plan B de stack.md.

### Día 4 · mar 6/10 (records + storage + clínica)
- `POST /records/upload-url`: URL firmada de Supabase Storage para subir el archivo cifrado (rutas por organización).
- `POST /records`: guarda metadatos y la DEK envuelta; devuelve la transacción `issue_record` armada (en coordinación con el módulo `tx` de Franco).
- `GET /patients/me/records`: lista de estudios y estados del paciente.
- Pantalla `(clinica)/avalar-medicos` sobre tus endpoints de organizations.

### Día 5 · mié 7/10 (indexer) — puerta G3
- Indexer: provider de Nest con `onLogs` de `@solana/kit` que consume los eventos del programa (RecordIssued, AccessGranted, AccessLogged...) y los persiste en `audit_events`.
- Generar el cliente Codama del IDL publicado (con Franco) en `lib/hcd-client/`.

### Día 6 · jue 8/10 (solicitudes + admin)
- `POST /access-requests` (médico pide acceso con el código del paciente) y `GET /access-requests/mine` (solicitudes pendientes del paciente).
- Notificaciones básicas al paciente (estudio cargado, solicitud nueva).
- Pantalla `(admin)/verificar` sobre tu endpoint `admin/verify`.

### Día 7 · vie 9/10 (aislamiento + auditoría) — puerta G4
- `GET /audit/:recordId`: línea de tiempo de accesos para el paciente.
- Prueba de aislamiento entre dos clínicas: una no ve los datos de la otra (pgTAP en `supabase/tests/` o prueba manual documentada).
- Rate limits y logs junto a Franco (`@nestjs/throttler`).

### Día 8 · sáb 10/10 (endurecer)
- Estados de error consistentes y logs útiles (sin secretos ni datos de pacientes).
- Corregir los errores del recorrido de punta a punta.

### Día 9 · dom 11/10 (deploy + PWA + congelamiento) — puerta G5
- Deploy de la API en Railway o Render (decisión pendiente del equipo); variables de entorno cargadas, nada de secretos en el repo.
- PWA de `hcd_app`: manifest, iconos, `@serwist/next` y estados de error globales.
- Solo corrección de errores.

### Día 10 · lun 12/10 (entrega) — puerta G6
- Solo errores. Verificar que la API de producción responde para el jurado; apoyo a la entrega.

## Entregables

1. Proyecto `hcd_api` con NestJS andando, CI y `.env.example`.
2. Migraciones de Supabase con todas las tablas, RLS activado y `get_my_organization_id()`.
3. Guard de Supabase Auth + cliente por request (lecturas con RLS).
4. Endpoints del MVP: upload-url, records, patients/me/records, access-requests, audit, admin/verify.
5. Indexer que persiste los eventos del programa en `audit_events`.
6. API desplegada (Railway o Render) con prueba de aislamiento entre organizaciones.
7. Plomería de `hcd_app`: login + Privy (wallet creada al iniciar sesión), `lib/api.ts`, `lib/supabase.ts`, `lib/schemas/`, `lib/hcd-client/`, pantallas de clínica y admin, y la PWA instalable.

## Criterios de aceptación (Definition of Done)

- Dos clínicas distintas no ven los datos de la otra (probado y anotado); el rol `authenticated` solo lee — escribe el backend.
- El backend nunca confía en rol ni organización del token: los lee de `app_user`.
- Solo circulan archivos cifrados por Storage; nada médico en claro en la base ni en logs.
- Los esquemas Zod validan cada request (`ZodValidationPipe`) y la copia en `hcd_app/lib/schemas/` se mantiene al día.
- El indexer refleja en Postgres los eventos on-chain y `GET /audit/:recordId` devuelve la línea de tiempo completa.
- Login con email/Google crea la wallet embebida de Solana (Privy custom auth); las pantallas de clínica y admin funcionan sobre tus propios endpoints.
- `SUPABASE_SERVICE_ROLE` se usa al mínimo (operaciones de storage) porque saltea RLS.
- Migraciones reproducibles con Supabase CLI y tipos TypeScript generados desde la base.
- Funciona en devnet, con test o prueba manual anotada, revisado y mergeado a `main` por PR.

## Dependencias

- El IDL de Misael (lunes 5 a la noche) habilita el cliente del programa y el indexer.
- Franco define los contratos de `tx` (transacciones armadas) y `keys` (qué guarda `POST /records`); acordarlos en el kickoff.
- La tabla `key_releases` y las políticas de `records` habilitan el servicio de llaves de Franco.
- La prueba de Privy de Franco (Día 3) habilita `lib/privy.ts`.
- Maxi consume tu plomería: avisale cuando `lib/api.ts`, login y schemas queden listos (Día 3).
