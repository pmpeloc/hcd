# Estado · Matías

**Última actualización:** 2026-10-06

## En qué estoy
Tres tareas preparadas para revisión: migración wallet/auditoría (API #11), guard Supabase (API #12) y login Supabase/Privy en feat/supabase-privy-login (app). Documentación consolidada en la rama del PR #16.

## Validación
Login: seis pruebas simuladas en Edge, build y lint aprobados. API: 25 pruebas de auth/tx y compilación aprobadas. Migración: probada en PostgreSQL local; no aplicada a Supabase.

## Próximo paso
Prueba real de email/Google y creación/reutilización de wallet con cuenta de prueba. Implementar alta de app_user y vinculación verificada de wallet en backend. Coordinar con Franco la protección de tx/keys y la asociación de signer/tx_id a la identidad autenticada.

## Bloqueos y límites
Dashboards reales pendientes de verificar (redirect URLs, Google, JWT auth Privy y orígenes). Login no implica registro on-chain ni acceso a estudios. Las rutas ajenas a /login todavía no tienen protección de sesión en esta entrega. PR pendientes de revisión; no hubo despliegues ni migraciones remotas.
