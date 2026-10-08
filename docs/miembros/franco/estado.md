# Estado · Franco

**Última actualización:** 2026-10-08

## En qué estoy
`/keys/release` ahora es **fail-closed**: si `log_access` no confirma en Solana no se entrega la DEK (503 + fila `failed`). `KeyCryptoService` exportado para que `/records` (Mati) envuelva la DEK al registrar el estudio. Todo lo de anoche quedó mergeado: mi `src/keys/` (#14), el fix UUID de `src/tx/` (#13) y las 4 PRs de Misael que revisé hoy a la mañana (#15, #16, #21, #22 — incluye el test G4 de recorrido completo y el fix de mis 2 hallazgos menores). Cero PRs abiertas. Privy quedó configurado (Custom Auth + JWKS) — la wallet ya debería crearse al loguear.

## Próximo paso
- Migrar `pending_tx`/`fee_payer_spend` a Postgres (el schema de Mati ya está en staging).
- Smoke E2E contra devnet: build → firma → submit → release.
- Verificar en la app que la wallet Privy se crea tras el fix de Misael.

## Bloqueos
- `tsc --noEmit` arreglado (PR #18: tests de Anchor fuera del tsconfig raíz).
- PRs propias esperando aprobación: `hcd_api#17` (fail-closed), `hcd_api#18` (tsconfig), `hcd_api` (auth en /tx, abro ahora) + `hcd#23` (docs).
- Nota: con auth en `/tx`, los flujos de la app y scripts tienen que mandar el Bearer token — el primer build de cada usuario bindea su wallet.
