# Estado · Franco

**Última actualización:** 2026-10-05

## En qué estoy
Día 1 del plan de implementación cerrado: specs de `src/keys/` (servicio-llaves.md), `src/tx/` (modulo-tx.md) y spike de Privy (prueba-privy.md — **plan A confirmado**, el JWKS de Supabase firma ES256). Todo escrito contra el IDL v0 que Misael publicó hoy (programa completo: 10 instrucciones, 43 tests, mergeado a staging). Revisé su PR y la mergeé. Antes: reasignación de `hcd_app` entre Maxi y Mati, skills de Devin publicadas, demo deployado en https://salua.vercel.app.

## Próximo paso
- Día 2: implementar `src/tx/` (build → firma usuario → verificación byte a byte → co-firma) + rate limit y presupuesto del fee payer.
- Avisar a Mati: falta `app_user.wallet_pubkey` en el esquema; `GET /audit` queda en su indexer.
- Preguntar a Misael si agrega `log_self_access` para registrar entregas a paciente/emisor (hoy `log_access` exige grant de médico).

## Bloqueos
- `lib/hcd-client/` (Codama) espera generarse sobre el IDL v0 — ya disponible.
- Privy: falta pedir acceso a "Custom Auth" en el dashboard (Integrations > Plugins) — trámite manual de quien tenga la cuenta.
