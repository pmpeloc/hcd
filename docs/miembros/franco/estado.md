# Estado · Franco

**Última actualización:** 2026-10-10

## En qué estoy
Smoke E2E devnet en curso — ya van bien: login Supabase, wallet Privy, **enrolamiento completo** (challenge→firma→verify, `wallet_verified_at` en DB) y **`register_patient` on-chain** (PatientProfile PDA confirmada en devnet, 57 bytes). El smoke destapó y ya corregí: migración `20261014` de privilegios (`service_role`/`authenticated` sin grants porque las migraciones se aplicaron como `postgres` por el pooler), `register_patient` que la app nunca llamaba, login sin redirect por rol, home `/inicio` hardcodeado (ahora carga datos reales), y la config `solana:devnet` que Privy 3.x exige para firmar.

## Próximo paso
- Continuar el smoke: QR del paciente (`SAL-XXXX`), segunda cuenta como médico (rol/org por SQL), pedido de acceso, aprobación con `grant_access`, upload cifrado, `issue_record`, indexer y visor con verificación de hash.
- Merges en orden: **#22 + migración `wallet_enrollment` primero**, después #17 → #18 → #19 → #20 → #21 (api) y #7 → #9 → #10 → #11 → #12 → #13 (app).

## Bloqueos
- **`set_provider_verified` requiere la wallet admin** (`6AdUWfF…`, upgrade authority = wallet dev de Misael): sin esa firma el médico no puede anclar `grant_access` ni `issue_record` on-chain. Todo el flujo off-chain se puede probar igual.
- Limitación conocida: un grant revocado sigue listándose como activo hasta su expiración natural — el indexer registra el evento en `audit_events` pero no actualiza `access_requests`.
