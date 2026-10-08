# Estado · Franco

**Última actualización:** 2026-10-08

## En qué estoy
Instalé la skill Archify en `.devin/skills/` (disponible para todo el equipo) y generé el diagrama de arquitectura de Salua con evidencia pinneada al repo — SVG + HTML interactivo en `docs/proyecto/assets/`, ya embebido en el README (que seguía diciendo "Code is coming"). Privy quedó configurado (Custom Auth + JWKS) — la wallet ya debería crearse al loguear.

## Próximo paso
- Smoke E2E contra devnet: build → firma → submit → release.
- Verificar en la app que la wallet Privy se crea tras el fix de Misael.
- Coordinar con Mati: correr la migración `tx_stores` en Supabase antes de desplegar.

## Bloqueos
- PRs propias esperando aprobación: `hcd_api#17` (fail-closed), `#18` (tsconfig), `#19` (auth en /tx), `#20` (Postgres) y `hcd#23` (docs de esas) + esta PR de README/Archify. #19 y #20 van apiladas — mergear en orden.
- Nota: con auth en `/tx`, los flujos de la app y scripts tienen que mandar el Bearer token — el primer build de cada usuario bindea su wallet.
