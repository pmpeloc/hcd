# Estado · Franco

**Última actualización:** 2026-10-08

## En qué estoy
Atendí el hallazgo de Mati en la review de #19: el binding de wallet en el primer `build` ahora exige **proof de posesión** (`wallet_proof` = firma ed25519 del challenge `salua:bind-wallet:<user.id>:<signer>:<ts>`, ≤5 min, verificación nativa Node sin dependencias). Antes cualquiera podía ligar la pubkey de otro. La app firma ese mensaje con Privy `signMessage` en el primer build. Mati ya aplicó `tx_stores` en Supabase y dejó el cliente con Bearer automático (app #7).

## Próximo paso
- Smoke E2E contra devnet: build → firma → submit → release.
- Verificar en la app que la wallet Privy se crea tras el fix de Misael.
- Coordinar con Mati: correr la migración `tx_stores` en Supabase antes de desplegar.

## Bloqueos
- `tsc --noEmit` arreglado (PR #18: tests de Anchor fuera del tsconfig raíz).
- PRs propias esperando aprobación: `hcd_api#17` (fail-closed), `#18` (tsconfig), `#19` (auth en /tx) y la de Postgres que abro ahora + `hcd#23` (docs). #19 y la de Postgres van apiladas — mergear en orden.
- Nota: con auth en `/tx`, los flujos de la app y scripts tienen que mandar el Bearer token — el primer build de cada usuario bindea su wallet.
