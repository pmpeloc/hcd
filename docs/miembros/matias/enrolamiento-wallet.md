# Entrega 2a · Enrolamiento verificable

El backend ya no necesita confiar en una dirección elegida por quien hace login: puede verificar una firma Ed25519 del desafío que él mismo creó. Esta entrega cubre la API y la base; conectar el modal de Privy en la app es el siguiente bloque.

## Contrato para integrar

1. `POST /auth/profile` con `{}` y Bearer: crea solamente paciente sin organización. Si existe, conserva rol, estado y organización. Un suspendido sigue bloqueado.
2. `POST /auth/wallet/challenge` con `wallet_pubkey`: mensaje exacto, UUID y vencimiento en cinco minutos. Crear otro desafío invalida el anterior.
3. La app pide a Privy firmar los bytes UTF-8 del mensaje, después de una acción explícita del usuario. No es una transacción ni gasta SOL.
4. `POST /auth/wallet/verify` con UUID y firma Ed25519 de 64 bytes en base64: verifica firma/origen/usuario, consume el desafío y guarda wallet/fecha de verificación en una transacción.
5. `GET /auth/profile` permite confirmar el resultado, incluso si se perdió la respuesta del POST. No reintentar escrituras automáticamente.

No se puede elegir rol, organización, usuario ni mensaje en la verificación. No permite reemplazar una wallet ya vinculada; recuperar una vinculación histórica incorrecta requiere un proceso explícito. La prueba acredita posesión de la clave, no identidad civil ni matrícula profesional.

## Coordinación con Franco

- Eliminar el guardado del primer signer en #19. Un JWT de Supabase no prueba propiedad de una wallet.
- Exigir `app_user.wallet_verified_at` no nulo y dirección coincidente antes de autorizar tx/keys; una wallet de `doctors` sola tampoco basta.
- Los valores anteriores permanecen sin verificar hasta completar el desafío. No migrarlos como válidos por defecto.
- Records debe adoptar la misma comprobación al integrar su rama.
- La función SQL de finalización solo puede ejecutarla service_role después de la verificación criptográfica en Nest; no exponerla a authenticated ni anon.

## Despliegue y validación

- Revisar `20261008020000_wallet_enrollment.sql`, aplicar atómicamente tras init y wallet_audit. Todavía no aplicada a Supabase.
- Configurar `WALLET_ENROLLMENT_ORIGIN` con el origen exacto de la app, sin barra final; HTTPS salvo localhost/127.0.0.1. Nunca derivarlo libremente del request.
- Un índice único impide vincular dos cuentas a la misma wallet. Si existen duplicados, la migración debe detenerse para investigarlos.
- 73 tests API, build/lint, migraciones SQL locales y carrera real de dos conexiones aprobados. Sin datos reales ni firmas de wallets del equipo.
- Prueba Privy real y firma de transacciones: pendientes, no incluidos en esta entrega.
