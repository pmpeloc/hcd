# Estado · Franco

**Última actualización:** 2026-10-05

## En qué estoy
Día 2 avanzado: `src/tx/` implementado y verde (build/submit byte a byte, co-firma fee payer + key_service, throttler por wallet, presupuesto diario, 12 tests). Mergeé las 4 PRs de Misael del programa en devnet y la investigación de producto quedó archivada en `D:\hackathon\Documentacion` (8 docs + 2 PDFs). En revisión: PR `feat/tx-module` a staging.

## Próximo paso
- Mergear `src/tx/` tras aprobación; día 5: `hcd_app/lib/crypto/` (AES-GCM + SHA-256) y luego `src/keys/` con Memo `key_releases.id` en `log_access`.
- Mati: cuando tenga write access a `hcd_api` revisar `feat/wallet-audit-schema` y coordinar `key_releases` + `pending_tx`/`fee_payer_spend` (hoy en memoria en `src/tx/`).
- Misael: evaluar `log_self_access` + rotación de `key_service`/Config (hoy inmutable on-chain) antes de producción.

## Bloqueos
- Mati/Maxi/Rodrigo sin write access en los 3 repos de código — Misael tiene que invitarlos (Settings > Collaborators).
- `issue_record` no valida aún el QR/sesión del paciente: el backend co-firma cualquier `issue_record` de médico verificado. Queda para cuando entre auth + `src/keys/` (el spec lo exige como cierre del hueco de carga).
