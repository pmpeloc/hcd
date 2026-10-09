# Bitácora · Matías

## 2026-10-08 · fix(auth): bind enrollment to visible account and audit atomically
- **Qué hice:** desafío v2 con correo del JWT y UUID; validación de cuenta/origen/wallet/desafío; índice único de médicos y trigger de coherencia; auditoría wallet_enrolled en la misma transacción. Factory compartida de #19 y cliente reutilizado, rate limit antes de JWT y configuración validada al iniciar.
- **Archivos clave:** hcd_api/src/auth/wallet-enrollment*, supabase-session.guard.ts, auth.module.ts, supabase-admin.factory.ts, WALLET_ENROLLMENT.md, supabase/migrations/20261008020000_wallet_enrollment.sql y supabase/tests/wallet_enrollment.sql.
- **Validación:** 87 tests API, build/lint aprobados; SQL local desde cero, rollback por fallo de auditoría y dos carreras reales (misma wallet / mismo desafío), siempre un éxito y un evento. Sin migración a Supabase ni firma de wallets reales.
- **Próximo paso:** nueva revisión de API #22; después migración/despliegue y firma explícita con Privy antes de habilitar consumidores #17/#19. Actualizado el orden en enrolamiento-wallet.md.

## 2026-10-08 · feat(auth): share wallet enrollment request schemas
- **Qué hice:** copia exacta del contrato de inicialización, desafío y verificación para la próxima integración de Privy, sin modificar pantallas ni ejecutar firmas reales.
- **Archivos clave:** hcd_app/lib/schemas/wallet-enrollment.ts.
- **Validación:** TypeScript y lint aprobados; contrato idéntico a la API por comparación de hash.
- **Próximo paso:** consumir el contrato desde una acción explícita del usuario y enviar la firma del mensaje exacto con el token vigente.

## 2026-10-08 · feat(auth): verify wallet ownership before enrollment
- **Qué hice:** endpoints de perfil y enrolamiento; alta solo como paciente sin organización, desafío persistido de cinco minutos ligado a usuario/origen/wallet, verificación Ed25519 y vinculación atómica de un solo uso. Wallets históricas no se marcan como verificadas automáticamente.
- **Archivos clave:** hcd_api/src/auth/wallet-enrollment*, supabase-session.guard.ts, src/app.module.ts, .env.example, supabase/migrations/20261008020000_wallet_enrollment.sql, supabase/tests/wallet_enrollment.sql.
- **Validación:** 73 tests API aprobados (33 nuevos), build y lint aprobados. PostgreSQL local: migraciones, expiración, replay, conflictos, preservación de permisos/RLS y carrera real de dos conexiones sobre una wallet (una aceptada, otra rechazada). Servidor detenido; no se aplicó migración a Supabase.
- **Próximo paso:** revisión con Franco: eliminar binding automático de #19 y exigir wallet_verified_at en tx/keys; exigirlo también al integrar records. Conectar firma de mensajes Privy después; todavía no hubo prueba real en navegador ni transacciones devnet.


## 2026-10-08 · feat(records): share record preparation schemas
- **Qué hice:** copia exacta del contrato Zod de records en la app, para que Maxi conecte las pantallas sin duplicar criterios de validación.
- **Archivos clave:** hcd_app/lib/schemas/records.ts.
- **Validación:** TypeScript y lint aprobados; copia idéntica al contrato de API comprobada por hash.
- **Próximo paso:** revisar contrato con Maxi y Franco antes de merge; integrar con cliente autenticado de app #7.

## 2026-10-08 · feat(records): prepare encrypted record uploads and patient listing
- **Qué hice:** primera entrega del plan: código temporal de paciente, reserva de carga ligada a médico/organización, comprobación de ciphertext y registro con DEK envuelta e IV. Listado RLS y estado pending_chain, sin afirmar emisión on-chain.
- **Archivos clave:** hcd_api/src/records/, src/common/zod-validation.pipe.ts, .env.example, supabase/migrations/20261009000000_record_encryption_iv.sql y supabase/tests/record_encryption_iv.sql.
- **Validación:** migraciones probadas en PostgreSQL 18 local descartable: IV de 12 bytes, estado inicial pendiente, estados históricos, RLS y permisos. Datos sintéticos y rollback; servidor detenido. No se aplicó esta migración a Supabase.
- **Validación de código:** 70 pruebas API aprobadas (30 nuevas), build y lint de archivos modificados aprobados; pruebas HTTP con servidor local y servicios simulados.
- **Próximo paso:** revisión de la propuesta build_request con Franco; integrar autorización antes de cofirma y confirmar emisión con indexer. Continuar después con enrolamiento verificable y firma Privy. Plan detallado en plan-integracion.md.


## 2026-10-08 · feat(api): send current Supabase session with requests
- **Qué hice:** cliente API que obtiene el token vigente por solicitud, conserva códigos de error del programa, rechaza URLs externas y evita reintentos automáticos de escrituras.
- **Archivos clave:** hcd_app/lib/api.ts, lib/api-client.ts, e2e/api.spec.ts, playwright.api.config.ts y README.md.
- **Validación:** 14 pruebas aisladas aprobadas; sin llamar al backend real. No conecta todavía las pantallas de carga simuladas.
- **Operación autorizada:** aplicada en Supabase la migración 20261008000000_tx_stores.sql del commit 65fa69160b848593cb64f25b4bc8635b21f572c3 (rama PR #20), en una transacción. Verificadas tres tablas con RLS y permisos de fee_payer_record: anon/authenticated sin EXECUTE, service_role con EXECUTE. No existía tabla de historial supabase_migrations.schema_migrations: aplicación manual registrada aquí, no en historial CLI; reconciliar antes de un futuro db push.
- **Próximo paso:** revisión de PRs #17–20 en orden; corregir binding inicial no verificado con Franco, alta de app_user y /records con records.id como storage_ref. Los enlaces de demo/app.js usan firmas simuladas; coordinar con Rodrigo antes de presentar evidencia real.


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


