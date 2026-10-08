# Estado · Franco

**Última actualización:** 2026-10-07

## En qué estoy
`src/tx/` mergeado en staging (#8) y adaptado al IDL v1 (`storage_ref` = UUID minúscula, 13 tests). Revisión cruzada del programa hecha y aprobada: PR hcd_api#10 mergeada (IDL v1 con `update_config`, ya en devnet). Ojo: el informe de Colosseum pone el cierre el **domingo 11/10 23:59** con pitch ≤2:00 y demo ≤3:00 en inglés.

## Próximo paso
- Revisar PRs de Mati (#11 `key_releases`/`wallet_pubkey`, #12 auth guard) — destraban `src/keys/` (día 6) y la conexión auth↔tx.
- `src/keys/`: envoltura DEK + `/keys/release` + `log_access` con Memo `key_releases.id`.
- Integración `lib/crypto` ↔ subida de Maxi (día 5, depende de su merge).

## Bloqueos
- `issue_record` no valida aún el QR/sesión del paciente: el backend co-firma cualquier `issue_record` de médico verificado. Se cierra con auth (PR #12) + `src/keys/`.
- `pending_tx`/`fee_payer_spend` siguen en memoria hasta que entre el schema de Mati (#11).
