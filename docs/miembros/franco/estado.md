# Estado · Franco

**Última actualización:** 2026-10-08

## En qué estoy
`/keys/release` ahora es **fail-closed**: si `log_access` no confirma en Solana no se entrega la DEK (503 + fila `failed`). `KeyCryptoService` exportado para que `/records` (Mati) envuelva la DEK al registrar el estudio. Todo lo de anoche quedó mergeado: mi `src/keys/` (#14), el fix UUID de `src/tx/` (#13) y las 4 PRs de Misael que revisé hoy a la mañana (#15, #16, #21, #22 — incluye el test G4 de recorrido completo y el fix de mis 2 hallazgos menores). Cero PRs abiertas. Privy quedó configurado (Custom Auth + JWKS) — la wallet ya debería crearse al loguear.

## Próximo paso
- Smoke E2E contra devnet: build → firma → submit → release.
- Verificar en la app que la wallet Privy se crea tras el fix de Misael.
- Coordinar con Mati: correr la migración `tx_stores` en Supabase antes de desplegar.

## Bloqueos
- `tsc --noEmit` arreglado (PR #18: tests de Anchor fuera del tsconfig raíz).
- PRs propias esperando aprobación: `hcd_api#17` (fail-closed), `#18` (tsconfig), `#19` (auth en /tx) y la de Postgres que abro ahora + `hcd#23` (docs). #19 y la de Postgres van apiladas — mergear en orden.
- Nota: con auth en `/tx`, los flujos de la app y scripts tienen que mandar el Bearer token — el primer build de cada usuario bindea su wallet.
