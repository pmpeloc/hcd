# Estado · Maximiliano

**Última actualización:** 2026-10-07

## En qué estoy
Ya están en `staging` (hcd_app#6) el sistema de diseño, los inicios en bento, Mi QR, el escáner y Cargar estudio. Hoy (día 5) en `feat/patient-studies-session`: los shells de paciente y médico usan la sesión real de Supabase + Privy (Mi QR muestra la wallet real) y la pantalla Mis estudios con estados y "No es mío". Lo que depende del backend sigue detrás de funciones ficticias: `lookupPatient` (escáner), `uploadRecord` (subida, llave e `issue_record`; el cifrado ya es real), `getMyStudies` y `disputeStudy`.

## Próximo paso
- Pedir acceso (médico) y solicitudes del paciente: aprobar 1 h / 24 h / 7 días, rechazar, revocar (día 6).
- Conectar la carga a `/records/upload-url`, `/records` y `/keys` cuando Franco y Mati los suban.
- Firmar `dispute_record` e `issue_record` con `/tx/build` + Privy + `/tx/submit`.

## Bloqueos
- `hcd_api` todavía no tiene `/records` ni `/keys` (los módulos están vacíos).
- El equipo tiene que aprobar los tonos AA sumados a la paleta (`#0A6FC2`, `#0B7A74`, `#5F6B80`).
- El login (`/login`, de Mati) está en inglés; el resto de la app está en castellano.
