# Bitácora · Matías

## 2026-10-06 · feat(auth): add Supabase login and Privy wallet session
- **Qué hice:** login por enlace de email o Google con PKCE, restauración/cierre de sesión, sincronización JWT con Privy y creación explícita de wallet Solana. Verificación del sujeto antes de mostrar o crear wallet, sin escribir pubkeys en la base desde el cliente.
- **Archivos clave:** hcd_app/app/(auth)/login, lib/auth-providers.tsx, lib/session-provider.tsx, lib/supabase.ts, lib/privy.ts, e2e/auth.spec.ts y README.md.
- **Validación:** seis pruebas con servicios simulados aprobadas en Edge, build y lint aprobados. No se enviaron correos ni se crearon wallets reales. Falta probar la configuración real de Supabase/Privy con una cuenta de prueba.
- **Próximo paso:** revisión; alta segura de app_user y vinculación verificada de wallet (Matías). Franco debe aplicar el guard a tx/keys y asociar signer/tx_id al usuario autenticado antes de conectar firmas.


## 2026-10-05 · feat(auth): add reusable Supabase authentication guard
- **Qué hice:** guard reutilizable que verifica JWT con getClaims, obtiene rol/organización/estado desde app_user y rechaza usuarios ausentes o suspendidos. Cliente Supabase por solicitud con token del usuario y sin service role.
- **Archivos clave:** hcd_api/src/auth/, hcd_api/package.json y README.md. Documentado el contrato request.user/request.supabase y la aplicación explícita por ruta.
- **Validación:** 13 pruebas unitarias aprobadas, build y lint de auth aprobados. Ajustado npm test para cargar Nest ESM. Prueba real de Supabase y autorización específica de recursos pendientes de integración.
- **Próximo paso:** subir rama cuando se habilite permiso y abrir PR. Coordinar consumo con Franco, continuar login/Privy. La migración anterior permanece en su rama independiente.


## 2026-10-05 · feat(db): add wallet and key release audit schema
- **Qué hice:** preparé migración aditiva para wallet pública y auditoría de entregas; controles para roles, huellas, estados y reintentos. Las filas históricas se conservan; nuevas escrituras exigen datos completos.
- **Archivos clave:** hcd_api/supabase/migrations/20261005000000_wallet_audit.sql, supabase/tests/wallet_audit.sql y README.md.
- **Validación:** PostgreSQL 18 local descartable: migraciones, conservación de historial, inserciones válidas, siete casos inválidos y preservación de RLS/permisos. Sin aplicar a Supabase ni probar el aislamiento completo.
- **Próximo paso:** revisión con Franco y despliegue controlado; continuar con guard de autenticación. Integración de Memo fuera de esta tarea.


