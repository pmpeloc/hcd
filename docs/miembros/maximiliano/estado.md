# Estado · Maximiliano

**Última actualización:** 2026-10-09

## En qué estoy
Ya están en `staging` (hcd_app#6) el sistema de diseño, los inicios en bento, Mi QR, el escáner y Cargar estudio. Sin subir todavía, en ramas apiladas: `feat/patient-studies-session` (día 5: sesión real de Supabase + Privy en los shells y Mis estudios con "No es mío") y encima `feat/access-requests` (día 6: Accesos del paciente con aprobar 1 h / 24 h / 7 días, rechazar y revocar; Pedir acceso del médico; y `runTx`, el paso común build → firma → submit de `/tx`). 61 tests de Playwright en verde (`npm run test:e2e`). Lo que depende del backend sigue detrás de funciones ficticias: `lookupPatient`, `uploadRecord` (el cifrado ya es real), `getMyStudies`, `disputeStudy`, `getMyAccess`, `approveRequest`, `rejectRequest`, `revokeGrant` y `requestAccess`.

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
- El login (`/login`, de Mati) está en inglés; el resto de la app está en castellano.
