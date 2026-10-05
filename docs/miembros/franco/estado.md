# Estado · Franco

**Última actualización:** 2026-10-05

## En qué estoy
Arranco el día 3 del plan (lunes): diseño del servicio de llaves y spec del módulo `tx`, esperando el IDL v0 de Misael esta noche. Preselección enviada el domingo 4/10 con el formulario completo. Entorno listo: los cuatro repos en `staging`, toolchain Anchor 1.2.0 verificado en WSL (13/13 tests), `.env` de api y app cargados y vivos, API levantando en :3001 y app en :3000. Instalé las 4 skills de Devin del equipo en `hcd/.devin/skills/` (commit-docs, review, anchor-check, salua-ui).

## Próximo paso
- Diseño del servicio de llaves (flujo `/keys/release`, envoltura DEK/KEK con HKDF, tabla `key_releases`).
- Spec del módulo `tx` (armado → firma usuario → verificación byte a byte → co-firma) incluyendo la firma de `key_service` en `issue_record` (decisión del 4/10).
- Prueba de 1 hora: Privy + Supabase Auth con wallet de Solana.

## Bloqueos
- IDL v0 del programa (Misael, esta noche) para generar el cliente Codama.
