# Estado · Matías

**Última actualización:** 2026-10-05

## En qué estoy
Primera tarea: migración de wallet y auditoría preparada en feat/wallet-audit-schema.
Agrega wallet_pubkey y datos de key_releases; conserva filas históricas sin inventar evidencia.
Prueba SQL aprobada en PostgreSQL 18 local descartable, con datos sintéticos. No aplicada a Supabase.

## Próximo paso
Revisión de la migración con Franco, integración y aplicación controlada; después guard de autenticación y login Supabase/Privy.

## Bloqueos
Sin bloqueo para revisar. Falta validar integración en Supabase y resolver el backfill si existen entregas históricas. Memo y servicio de llaves corresponden a Franco.
