# Estado · Maximiliano

**Última actualización:** 2026-10-08

## En qué estoy
Ya están en `staging` (hcd_app#6) el sistema de diseño, los inicios en bento, Mi QR, el escáner y Cargar estudio. En PRs apilados, un tema por PR:
- hcd_app#8 (días 5 y 6): sesión real de Supabase + Privy, Mis estudios con "No es mío", Accesos del paciente, Pedir acceso del médico y `runTx` (build → firma → submit).
- `feat/api-auth-errors`: `createApiClient` manda el Bearer token de Supabase en toda llamada; mensajes para los 20 errores del programa y el 401.
- `feat/record-viewer` (día 7): visor con verificación de huella antes de descifrar, "Estudio alterado", pdf.js en canvas con marca de agua, sin descarga, y "Mis accesos" del médico.

79 tests de Playwright en verde (`npm run test:e2e`), lint y build limpios. Lo que depende del backend sigue detrás de funciones ficticias (`lookupPatient`, `uploadRecord` salvo el cifrado, `getMyStudies`, `disputeStudy`, accesos y metadatos del visor); el visor ya llama a `/keys/release` de verdad para ids reales.

## Próximo paso
- Línea de tiempo de accesos del paciente (día 8).
- Conectar `runTx` a "No es mío", aprobar y revocar cuando haya firma en `useSaluaWallet` y record PDAs reales.
- Conectar la carga y las listas cuando existan `/records` y `/access-requests`.

## Bloqueos
- `hcd_api`: los módulos `records` y `access` siguen vacíos (Mati). Sin `/records` no hay estudios reales para el visor.
- Falta acordar el formato del archivo guardado (`iv || cifrado`, ver ideas) con Franco y Mati: hoy nadie guarda el IV.
- El visor compara contra la huella que devuelve `/keys/release`; leer la del Record on-chain necesita el cliente Codama (`lib/hcd-client`, Mati con Franco).
- `useSaluaWallet` (Mati) solo da la dirección: falta firmar transacciones.
- `records` no guarda tipo de estudio, fecha ni origen.
- El equipo tiene que aprobar los tonos AA sumados a la paleta (`#0A6FC2`, `#0B7A74`, `#5F6B80`).
- El login (`/login`, de Mati) está en inglés.
