# Estado · Franco

**Última actualización:** 2026-10-10

## En qué estoy
MVP cableado de punta a punta en código. Lado API: los tres módulos stub quedaron implementados (`organizations`, `access`, `indexer`) + el enrolamiento de Mati integrado, alias `SAL-XXXX` dictables, metadata de estudios, grants revocables y migraciones aplicadas a Supabase (8) con el bucket `records` privado. Lado app: reemplacé todos los placeholders por llamadas reales — QR, lookup, upload cifrado, estudios, accesos, historial nuevo y enrolamiento Privy challenge→firma→verify. Validación: API 126/126 tests + build/lint; app 80/80 Playwright + tsc/eslint limpios.

## Próximo paso
- Smoke E2E contra devnet con dos sesiones reales: enroll → upload → `issue_record` → indexer baja el evento → request → `grant_access` → `/keys/release` → visor "Es el archivo original".
- Merges en orden: **#22 + migración `wallet_enrollment` primero**, después #17 → #18 → #19 → #20 → #21 (api) y #7 → #9 → #10 → #11 → #12 (app).

## Bloqueos
- El flujo completo nunca corrió en vivo: los tests validan cada pieza por separado (mocks + fixtures demo); el smoke E2E es el paso que falta.
- Limitación conocida: un grant revocado sigue listándose como activo hasta su expiración natural — el indexer registra el evento en `audit_events` pero no actualiza `access_requests`.
- Verificación runtime pendiente: `signMessage` de Privy contra challenge real, PUT del blob a la signed URL desde el browser, `onLogs` del indexer en devnet.
