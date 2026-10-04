# Tareas · Matías (backend NestJS)

**Rol:** API NestJS, base de datos con RLS, storage de archivos cifrados, esquemas Zod e indexer de eventos.
**Respaldo:** Franco.
**Repo:** `hcd_api` — `supabase/` y `src/` (módulos `auth`, `organizations`, `records`, `access`, `indexer`, `common`). Franco toca `src/keys/` y `src/tx/`.

## Archivos y módulos bajo tu responsabilidad

- `hcd_api/supabase/migrations/` — tablas, RLS y rol `app_user` (migraciones con Supabase CLI).
- `hcd_api/src/auth/` — guard que verifica el token de Supabase Auth (`auth.getClaims`).
- `hcd_api/src/organizations/` — clínicas, médicos y verificación por el admin.
- `hcd_api/src/records/` — URLs firmadas, metadatos de estudios, llave envuelta (tabla).
- `hcd_api/src/access/` — solicitudes de acceso y notificaciones.
- `hcd_api/src/indexer/` — provider con `onLogs` que escucha los eventos del programa.
- `hcd_api/src/common/` — esquemas Zod de los endpoints (se copian a mano a `hcd_app`), `ZodValidationPipe`, configuración, errores, logs.
- `package.json`, CI del repo, `.env.example`, README del backend.

**No tocar:** `programs/`, `tests/`, `idl/` (Misael); `src/keys/` y `src/tx/` (Franco); `hcd_app` (Maximiliano y Franco).

## Plan día por día

### Día 1 · sáb 3/10 (base)
- Pasos 1 y 2 (Luma + Arena).
- Crear el proyecto de Supabase y la estructura de `hcd_api` (NestJS 12 + TypeScript 6 + npm, CLI de Nest, ESLint/Prettier, Jest).
- Esqueleto de módulos y `.env.example` con los nombres (sin valores).

### Día 2 · dom 4/10 (auth + RLS) — puerta G1
- Kickoff técnico: congelar contratos de API (endpoints y esquemas) con Franco.
- Guard de auth: verifica el token de Supabase con `getClaims`, toma solo el `sub`; rol y organización se leen de `app_user`, **nunca** del token.
- Migraciones: `app_user`, `organizations`, `staff_members`, `doctors`, `records`, `access_requests`, `audit_events`, `key_releases`; `organization_id` en cada tabla de dominio, RLS activado en la misma migración y función `get_my_organization_id()` (patrón de stack.md).

### Día 3 · lun 5/10 (organizations)
- Endpoints de organizaciones: alta de clínica y de médicos, `POST /admin/providers/:id/verify` (admin).
- Cliente supabase-js por request con el token del usuario para las lecturas (RLS decide); escrituras solo con la clave secreta filtrando por organización.

### Día 4 · mar 6/10 (records + storage)
- `POST /records/upload-url`: URL firmada de Supabase Storage para subir el archivo cifrado (rutas por organización).
- `POST /records`: guarda metadatos y la DEK envuelta; devuelve la transacción `issue_record` armada (en coordinación con el módulo `tx` de Franco).
- `GET /patients/me/records`: lista de estudios y estados del paciente.

### Día 5 · mié 7/10 (indexer) — puerta G3
- Indexer: provider de Nest con `onLogs` de `@solana/kit` que consume los eventos del programa (RecordIssued, AccessGranted, AccessLogged...) y los persiste en `audit_events`.
- Generar el cliente Codama del IDL publicado (con Franco).

### Día 6 · jue 8/10 (solicitudes)
- `POST /access-requests` (médico pide acceso con el código del paciente) y `GET /access-requests/mine` (solicitudes pendientes del paciente).
- Notificaciones básicas al paciente (estudio cargado, solicitud nueva).

### Día 7 · vie 9/10 (aislamiento + auditoría) — puerta G4
- `GET /audit/:recordId`: línea de tiempo de accesos para el paciente.
- Prueba de aislamiento entre dos clínicas: una no ve los datos de la otra (pgTAP en `supabase/tests/` o prueba manual documentada).
- Rate limits y logs junto a Franco (`@nestjs/throttler`).

### Día 8 · sáb 10/10 (endurecer)
- Estados de error consistentes y logs útiles (sin secretos ni datos de pacientes).
- Corregir los errores del recorrido de punta a punta.

### Día 9 · dom 11/10 (deploy + congelamiento) — puerta G5
- Deploy de la API en Railway o Render (decisión pendiente del equipo); variables de entorno cargadas, nada de secretos en el repo.
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

## Criterios de aceptación (Definition of Done)

- Dos clínicas distintas no ven los datos de la otra (probado y anotado); el rol `authenticated` solo lee — escribe el backend.
- El backend nunca confía en rol ni organización del token: los lee de `app_user`.
- Solo circulan archivos cifrados por Storage; nada médico en claro en la base ni en logs.
- Los esquemas Zod validan cada request (`ZodValidationPipe`) y están listos para copiarse a `hcd_app`.
- El indexer refleja en Postgres los eventos on-chain y `GET /audit/:recordId` devuelve la línea de tiempo completa.
- `SUPABASE_SERVICE_ROLE` se usa al mínimo (operaciones de storage) porque saltea RLS.
- Migraciones reproducibles con Supabase CLI y tipos TypeScript generados desde la base.
- Funciona en devnet, con test o prueba manual anotada, revisado y mergeado a `main` por PR.

## Dependencias

- El IDL de Misael (lunes 5 a la noche) habilita el cliente del programa y el indexer.
- Franco define los contratos de `tx` (transacciones armadas) y `keys` (qué guarda `POST /records`); acordarlos en el kickoff.
- La tabla `key_releases` y las políticas de `records` habilitan el servicio de llaves de Franco.
