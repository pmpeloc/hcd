# Estado · Franco

**Última actualización:** 2026-10-11

## En qué estoy
**Smoke E2E devnet completo** — circuito probado de punta a punta: enrolamiento de ambas cuentas, `register_patient`/`register_provider` on-chain, Provider del médico verificado por admin (keypair que Misael pasó, usada local sin commitear), QR real, lookup + pedido, upload ECG → `issue_record` → indexer `active`, aprobación → `grant_access`, visor "Es el archivo original", y revocación → `access_revoked` en la línea de tiempo del paciente.

Correcciones del día: `expires_at` i64 → `BN` en `tx-builder` (rompía `/tx/build`), endpoints doctor-side (`/doctors/me/records`, `/records/:id`), panel y `/mis-accesos` del médico con datos reales (se fue lo ficticio), visor resolviendo metadata real, grants leyendo estado on-chain (revocado deja de figurar vigente) y chips honestos Emitido/Vigente/Vencido.

## Próximo paso
- Revisar **api#24** de Mati (recorte de privilegios de mi migración 20261014 — `authenticated` quedó con TRUNCATE/TRIGGER de más).
- Decisión pendiente para el equipo: el emisor conserva acceso a su estudio aun tras revocar el grant (por diseño de `keys/release`); si revocar también debe cortar al emisor hay que cambiarlo.
- Path del segundo médico para probar grant + `log_access` on-chain.
- Conflictos de #32 por resolver.

## Bloqueos
- Ninguno del smoke. La keypair admin quedó en `D:\hackathon\keys\admin.json` (fuera de repos, sin commitear).
- Cuenta médico con password temporal de prueba (`SaluaSmoke62589!`) — rotar o quitar antes de producción.
