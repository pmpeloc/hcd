# Bitácora · Matías

## 2026-10-05 · feat(db): add wallet and key release audit schema
- **Qué hice:** preparé migración aditiva para wallet pública y auditoría de entregas; controles para roles, huellas, estados y reintentos. Las filas históricas se conservan; nuevas escrituras exigen datos completos.
- **Archivos clave:** hcd_api/supabase/migrations/20261005000000_wallet_audit.sql, supabase/tests/wallet_audit.sql y README.md.
- **Validación:** PostgreSQL 18 local descartable: migraciones, conservación de historial, inserciones válidas, siete casos inválidos y preservación de RLS/permisos. Sin aplicar a Supabase ni probar el aislamiento completo.
- **Próximo paso:** revisión con Franco y despliegue controlado; continuar con guard de autenticación. Integración de Memo fuera de esta tarea.
