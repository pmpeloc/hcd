# Estado · Matías

**Última actualización:** 2026-10-11

## En qué estoy
Entrega de permisos contrastada con catálogos reales de Supabase: API #24 (fix/role-privileges) y Docs #33 (docs/matias-role-privileges). Ambas abiertas y sin revisión humana al consultar. No hubo cambios nuevos en staging ni conflictos.

## Hallazgos
El backend ya tiene permisos. anon y authenticated conservan TRUNCATE, REFERENCES, TRIGGER y MAINTAIN en 12 tablas. wrapped_dek/storage_path y RPCs sensibles siguen bloqueados para esos roles. No existe supabase_migrations.schema_migrations; no se conoce el SQL histórico. Hay defaults amplios para futuros objetos que la propuesta acotada no modifica.

## Validación
Diagnóstico alojado en PostgreSQL 17.11 con conexión forzada a solo lectura, sin filas clínicas. Cuatro escenarios locales en PostgreSQL 18.4 aprobados: limpio, permisos excesivos, patrón observado y acceso heredado rechazado con rollback. Incluye TRUNCATE denegado, operaciones service_role/RPC, aislamiento, idempotencia y preservación de políticas/propietarios/defaults. Servidor descartable detenido.

## Próximo paso
Revisión cruzada de API #24/Docs #33 y confirmación del proyecto por el administrador. Acordar cómo registrar la migración sin inventar historia, revisar integraciones y tratar defaults futuros por separado. Tras autorización de aplicación: solo migración acordada, diagnóstico posterior y smoke alojado.

## Bloqueos y límites
No se aplicaron migraciones compartidas ni se hizo merge. La referencia de conexión coincide con la configuración local, pendiente confirmación humana en dashboard. El patrón local no es un clon de la base. No se probó explotación HTTP ni hay evidencia de uso de los permisos excesivos. El smoke de aplicación/Storage/devnet sigue pendiente. Informe: relevamientos/2026-10-11-permisos-supabase.md.
