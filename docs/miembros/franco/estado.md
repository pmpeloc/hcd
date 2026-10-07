# Estado · Franco

**Última actualización:** 2026-10-07

## En qué estoy
`src/keys/` implementado (día 6 adelantado): `POST /keys/release` con la matriz paciente/emisor/médico on-chain, DEK desenvuelta con KEK por org (HKDF + AES-256-GCM), URL firmada de 60 s y `log_access` con Memo `key_releases.id`. 14 tests verdes. Ya mergeadas hoy: programa IDL v1 (#10, con mi cross-review), schema wallet+key_releases (#11), auth guard (#12). Todo el código del equipo está en staging.

## Próximo paso
- Integración `lib/crypto` ↔ pantalla de carga de Maxi + `/keys/release` (cierre del flujo E2E).
- Worker de reintento para `key_releases` en `pending` (índice ya existe).
- Smoke E2E contra devnet: build → firma → submit → release.
- Enchufar el auth guard a `/tx` y validar `signer` = `wallet_pubkey` del usuario.

## Bloqueos
- `issue_record` no valida aún el QR/sesión del paciente: queda para la conexión auth↔tx.
- `pending_tx`/`fee_payer_spend` en memoria (el schema de Mati ya está mergeado, falta migrarlos).
- PRs propias esperando aprobación de otro: `hcd_api#13` (storage_ref UUID), `hcd#20` (docs), y la de `src/keys/` que abro ahora.
