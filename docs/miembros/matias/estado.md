# Estado · Matías

**Última actualización:** 2026-10-11

## En qué estoy
Revisión general e integración del MVP. Las asignaciones anteriores no describen los pendientes actuales: otros compañeros completaron parte del trabajo y las implementaciones de records, enrolamiento, solicitudes e indexer ya llegaron a staging. No retomar ni publicar el trabajo local de Privy que quedó guardado.

Entrega de permisos contrastada con catálogos reales de Supabase: API #24 (fix/role-privileges) y Docs #33 (docs/matias-role-privileges).

## Entrega actual
Con autorización de Franco, correcciones en la PR docs #32: smoke con paciente, médico emisor y médico tercero; códigos de un solo uso separados; verificación con wallet de autoridad y booleano; integridad del ciphertext; casos positivos y negativos de consentimiento y auditoría. La skill queda en inglés conforme a las reglas del repo; esta documentación permanece en español.

## Hallazgos de permisos
El backend ya tiene permisos. anon y authenticated conservan TRUNCATE, REFERENCES, TRIGGER y MAINTAIN en 12 tablas. wrapped_dek/storage_path y RPCs sensibles siguen bloqueados para esos roles. No existe supabase_migrations.schema_migrations; no se conoce el SQL histórico. Hay defaults amplios para futuros objetos que la propuesta acotada no modifica.

## Validación
Revisión estática contra los contratos actuales de API/app/programa y scripts. No se ejecutó el smoke ni se modificó Supabase/devnet. Las 64 pruebas, tipos y lint de la revisión anterior corresponden a app #14; no demuestran que el smoke completo haya pasado.

Corrección posterior en app #14: registro on-chain con estado/error/reintento, operación compartida entre montajes y redirect condicionado a confirmación. Tipos y lint aprobados; 20 pruebas locales de transporte/registro aprobadas. No se realizó una firma real con Privy.

Permisos: diagnóstico alojado en PostgreSQL 17.11 con conexión forzada a solo lectura, sin filas clínicas. Cuatro escenarios locales en PostgreSQL 18.4 aprobados: limpio, permisos excesivos, patrón observado y acceso heredado rechazado con rollback. Incluye TRUNCATE denegado, operaciones service_role/RPC, aislamiento, idempotencia y preservación de políticas/propietarios/defaults. Servidor descartable detenido.

## Próximo paso
Revisión cruzada de app #14 (verified del Provider) y API #23 (confirmación de transacción y existencia de clínica). El registro recuperable ya fue publicado en 7341ad3.

Revisión cruzada de API #24 y confirmación del proyecto por el administrador. Acordar cómo registrar la migración sin inventar historia, revisar integraciones y tratar defaults futuros por separado. Tras autorización de aplicación: solo migración acordada, diagnóstico posterior y smoke alojado.

## Correcciones del 11/10
- App #14: verified en byte 41 con validación de cuenta; 22 pruebas locales aprobadas.
- API #23: comprobación de error de confirmación, vigencia de blockhash y Provider creado antes de informar éxito; cuatro pruebas offline aprobadas. El helper ya no imprime la clave privada.
- No se ejecutó el smoke ni se modificó Supabase/devnet. Los cambios requieren revisión de otro compañero.

## Bloqueos y límites
- Falta localizar/versionar `20261014_role_privileges.sql` o su equivalente revisado y confirmar privilegios efectivos del entorno compartido con Franco/Misael; no inventar ni aplicar permisos generales.
- Los Providers de ambos médicos necesitan verificación por el admin actual. El script recibe la wallet del médico y `true`, no el PDA.
- Las correcciones de #14 necesitan revisión cruzada y validación real de Privy/devnet. No aprobar como autor de las correcciones ni mergear sin revisión cruzada.
- No se aplicaron migraciones compartidas. La referencia de conexión coincide con la configuración local, pendiente confirmación humana en dashboard. El patrón local no es un clon de la base. No se probó explotación HTTP ni hay evidencia de uso de los permisos excesivos. Informe: relevamientos/2026-10-11-permisos-supabase.md.
