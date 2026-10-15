# Contraste de permisos Supabase · 2026-10-11

## Alcance y evidencia

Continuación de API #24 y Docs #33. Ambas siguen abiertas, sin conflictos y sin
revisión humana al consultar GitHub. Las referencias de staging no cambiaron:
API 27f3613 y docs 5876a88.

Se pudo conectar a PostgreSQL usando la configuración local existente. La referencia
del destino coincide con SUPABASE_URL. Queda la confirmación humana del proyecto en
el dashboard. La conexión se forzó a solo lectura, con timeout y consultas limitadas
a catálogos; no se leyeron filas clínicas ni se ejecutaron escrituras, migraciones,
operaciones de wallets o pruebas destructivas en el entorno compartido.

El diagnóstico completo queda fuera de Git. No se publican credenciales, conexiones
ni identificadores del proyecto. El procedimiento está en
[ROLE_PRIVILEGES.md](https://github.com/pmpeloc/hcd_api/blob/fix/role-privileges/supabase/ROLE_PRIVILEGES.md).

## Hallazgos

| Comprobación | Resultado observado |
|---|---|
| Versión alojada | PostgreSQL 17.11 |
| RLS | Activado en las 15 tablas de Salua |
| service_role | BYPASSRLS y permisos amplios presentes; no se confirma una falta actual de permisos del backend |
| anon y authenticated | TRUNCATE, REFERENCES, TRIGGER y MAINTAIN efectivos en 12 tablas |
| Secretos de records | Ninguno de esos dos roles puede leer wrapped_dek o storage_path |
| RPC de enrolamiento y contador de fees | Solo service_role tiene EXECUTE entre los tres roles de API |
| Helper de organización | anon también puede ejecutarlo; la propuesta elimina ese permiso innecesario |
| Historial estándar | No existe supabase_migrations.schema_migrations |
| Permisos por defecto | Hay permisos amplios para futuros objetos; esta migración acotada no los cambia |

Las 12 tablas con permisos excesivos son access_requests, app_user, audit_events,
doctors, fee_payer_spend, fee_payer_user_txs, key_releases, organizations,
patient_codes, pending_tx, records y staff_members. TRUNCATE permite vaciar tablas
a nivel SQL. Se comprobó el permiso, no se ejecutó la operación ni se demostró una
ruta HTTP explotable. No hay evidencia aquí de que alguien lo haya utilizado.

La ausencia de historial estándar no identifica qué scripts se ejecutaron ni cómo.
No se puede reconstruir 20261014_role_privileges.sql con esta evidencia. Tampoco
corresponde aplicar todas las migraciones existentes o inventar registros históricos.

## Validación local adicional

Se agregó observed_acl_pattern al runner SQL: reproduce las clases de permisos
observadas sobre el esquema del repo, sin pretender clonar la base ni recuperar el
SQL histórico. Pasaron cuatro escenarios en PostgreSQL 18.4 descartable: limpio,
permisos excesivos, patrón observado y acceso heredado rechazado con rollback.

Se verificó la denegación real de TRUNCATE para anon y authenticated solo en local,
además de operaciones del backend, aislamiento RLS, columnas sensibles bloqueadas,
repetición idempotente y preservación de políticas, propietarios y defaults. El
servidor descartable quedó detenido. El smoke alojado de aplicación sigue pendiente.

## Próximo paso del administrador y revisor

1. Revisar API #24 y Docs #33; confirmar el proyecto en el dashboard.
2. Compartir el SQL histórico si está disponible y aclarar el mecanismo de ejecución.
   Acordar cómo registrar la nueva migración sin inventar el historial anterior.
3. Revisar integraciones que dependan de permisos amplios. La propuesta reduce los
   permisos de service_role a los consumidores identificados en el repo.
4. Acordar por separado el tratamiento de los defaults de futuros objetos. La
   propuesta actual corrige objetos existentes; no elimina ese riesgo futuro.
5. Tras revisión y autorización de aplicación, ejecutar solo la migración acordada,
   repetir el diagnóstico y el smoke con cuentas sintéticas. No se aplicó en esta entrega.
