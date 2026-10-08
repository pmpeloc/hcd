# Estado · Franco

**Última actualización:** 2026-10-08

## En qué estoy
`/keys/release` ahora es **fail-closed**: si `log_access` no confirma en Solana no se entrega la DEK (503 + fila `failed`). `KeyCryptoService` exportado para que `/records` (Mati) envuelva la DEK al registrar el estudio. Todo lo de anoche quedó mergeado: mi `src/keys/` (#14), el fix UUID de `src/tx/` (#13) y las 4 PRs de Misael que revisé hoy a la mañana (#15, #16, #21, #22 — incluye el test G4 de recorrido completo y el fix de mis 2 hallazgos menores). Cero PRs abiertas. Privy quedó configurado (Custom Auth + JWKS) — la wallet ya debería crearse al loguear.

## Próximo paso
- Enchufar `SupabaseAuthGuard` a `/tx` y validar `signer` = `wallet_pubkey` del usuario autenticado.
- Migrar `pending_tx`/`fee_payer_spend` a Postgres (el schema de Mati ya está en staging).
- Smoke E2E contra devnet: build → firma → submit → release.
- Verificar en la app que la wallet Privy se crea tras el fix de Misael.

## Bloqueos
- `tsc --noEmit` de staging falla en `tests/hcd.test.mts` (vino del merge #16 — fuera del scope de `nest build`, pero ensucia la verificación; se lo paso a Misael).
- PRs propias esperando aprobación: `hcd_api` (fail-closed, abro ahora) + docs acompañantes.
