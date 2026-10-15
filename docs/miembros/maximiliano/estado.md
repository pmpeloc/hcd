# Estado · Maximiliano

**Última actualización:** 2026-10-09

## En qué estoy
Ya están en `staging` (hcd_app#6) el sistema de diseño, los inicios en bento, Mi QR, el escáner y Cargar estudio. En PRs apilados, un tema por PR:
- hcd_app#8 (días 5 y 6): sesión real de Supabase + Privy, Mis estudios con "No es mío", Accesos del paciente, Pedir acceso del médico y `runTx` (build → firma → submit).
- `feat/api-auth-errors`: `createApiClient` manda el Bearer token de Supabase en toda llamada; mensajes para los 20 errores del programa y el 401.
- `feat/record-viewer` (día 7): visor con verificación de huella antes de descifrar, "Estudio alterado", pdf.js en canvas con marca de agua, sin descarga, y "Mis accesos" del médico.

79 tests de Playwright en verde (`npm run test:e2e`), lint y build limpios. Lo que depende del backend sigue detrás de funciones ficticias (`lookupPatient`, `uploadRecord` salvo el cifrado, `getMyStudies`, `disputeStudy`, accesos y metadatos del visor); el visor ya llama a `/keys/release` de verdad para ids reales.

## Próximo paso
- Correcciones de la review de Franco en hcd_app#12 (visor).
- Visor `visor/[recordId]` (día 7) contra `/keys/release`: hash antes de descifrar, "Estudio alterado", marca de agua, sin descarga.
- Conectar `runTx` a "No es mío", aprobar y revocar cuando haya firma en `useSaluaWallet` y record PDAs reales.
- Conectar la carga y las listas cuando existan `/records` y `/access-requests`.

## Bloqueos
- hcd_app#11 ahora depende de hcd_app#7 (cliente de API de Mati): orden de merge #7 → #11 → #12.
- `hcd_api`: los módulos `records` y `access` siguen vacíos (sin upload-url, registrar estudio, listar mis estudios ni solicitudes). Lo tiene Mati.
- `useSaluaWallet` (Mati) solo da la dirección: falta una función para firmar transacciones con Privy.
- `records` no guarda tipo de estudio, fecha ni origen: sin eso la lista real no puede mostrar nombres.
- `/tx` va a pedir sesión cuando se mergee hcd_api#19.
- El equipo tiene que aprobar los tonos AA sumados a la paleta (`#0A6FC2`, `#0B7A74`, `#5F6B80`).
- El login (`/login`, de Mati) está en inglés.
