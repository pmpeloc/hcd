# Estado · Matías

**Última actualización:** 2026-10-08

## En qué estoy
Correcciones de la revisión de API #22 en feat/wallet-enrollment: cuenta visible en la firma (correo del JWT), unicidad de wallet de médicos, auditoría atómica y controles adicionales. Contrato de app #10 sin cambios de JSON. Records sigue en API #21/app #9, separado.

## Validación
87 tests API, build y lint aprobados. PostgreSQL local: migración desde cero, auditoría y rollback ante fallo, conflictos, reenrolamiento y carreras reales de dos conexiones (misma wallet y mismo desafío: un éxito, un rechazo, un evento). Servidor local detenido. No se aplicó wallet_enrollment a Supabase. Las suites de records y enrolamiento son ramas separadas.

## Próximo paso
Nueva revisión de Franco en API #22. Tras aprobar: migración atómica, configuración del origen y despliegue del backend. Sigue conectar confirmación visible y firma de mensajes Privy, enrolar cuentas de prueba y habilitar #17/#19 con ellas. Records → tx e indexer siguen pendientes.

## Bloqueos y límites
La firma real con Privy y el smoke E2E están pendientes. El correo visible mitiga phishing, no elimina el engaño si el usuario firma una cuenta ajena. Franco ya exige wallet_verified_at en #17/#19; no habilitarlos antes del esquema y enrolamiento. Duplicados históricos bloquean la migración: no corregirlos automáticamente. tx_stores ya aplicada; IV/pending_chain y wallet_enrollment solo probadas localmente. No se modificaron módulos tx/keys ni se aprobaron/mergearon PRs ajenos.
