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

- Franco ya retiró el binding inicial en #19 y exige enrolamiento verificado en #19/#17. Se debe desplegar nuestra migración y completar enrolamiento antes de habilitar esos consumidores.
- Exigir `app_user.wallet_verified_at` no nulo y dirección coincidente antes de autorizar tx/keys; una wallet de `doctors` sola tampoco basta.
- Los valores anteriores permanecen sin verificar hasta completar el desafío. No migrarlos como válidos por defecto.
- Records debe adoptar la misma comprobación al integrar su rama.
- La función SQL de finalización solo puede ejecutarla service_role después de la verificación criptográfica en Nest; no exponerla a authenticated ni anon.

## Despliegue y validación

- Revisar `20261008020000_wallet_enrollment.sql`, aplicar atómicamente tras init y wallet_audit. Todavía no aplicada a Supabase.
- Configurar `WALLET_ENROLLMENT_ORIGIN` con el origen exacto de la app, sin barra final; HTTPS salvo localhost/127.0.0.1. Nunca derivarlo libremente del request.
- Un índice único impide vincular dos cuentas a la misma wallet. Si existen duplicados, la migración debe detenerse para investigarlos.
- 87 tests API, build/lint, migraciones SQL locales y carreras reales de dos conexiones aprobados tras la revisión. Sin datos reales ni firmas de wallets del equipo.
- Prueba Privy real y firma de transacciones: pendientes, no incluidos en esta entrega.

## Correcciones de la revisión de API #22 · 2026-10-08

- Desafío v2 con correo del JWT verificado y UUID de cuenta; nunca se toma del body. La app debe mostrar cuenta y origen antes de abrir la firma explícita de Privy. El correo visible mitiga el engaño; no convierte una firma engañosa en imposible.
- La verificación compara versión, cuenta, wallet, desafío y origen. Un cambio de correo/origen exige un desafío nuevo. Los desafíos v1 dejan de servir.
- Índice único parcial también en doctors.wallet_pubkey. Un trigger exige que las nuevas escrituras de wallet del médico correspondan a un app_user ya verificado, usando el mismo bloqueo de dirección. Las altas iniciales de app_user pasan por la RPC; recuperación administrativa es otro flujo.
- wallet_enrolled se inserta junto a la vinculación y consumo del desafío. Si falla la auditoría, se revierte todo. El evento no incluye correo ni firma; el mensaje del desafío sí contiene el correo y permanece en la tabla privada hasta reemplazo o eliminación.
- AuthModule exporta la misma factory administrativa de #19; el repositorio reutiliza su cliente. Rate limit antes de validar JWT; configuración del origen validada al iniciar.
- Pruebas locales: auditoría atómica, duplicados de médicos, reenrolamiento de la misma wallet, dos cuentas reclamando una wallet y dos llamadas consumiendo el mismo desafío. En ambas carreras hubo un solo éxito, consumo y evento.
- Los JSON de entrada no cambian: app #10 conserva su contrato. Queda pendiente implementar la confirmación visible y firma real con Privy; no se hizo una prueba de navegador/devnet.

### Orden de integración

1. Nueva revisión de API #22; comprobar duplicados históricos antes de aplicar la migración en una transacción.
2. Aplicar migración wallet_enrollment a Supabase y configurar WALLET_ENROLLMENT_ORIGIN antes de desplegar la API. **Todavía no aplicada.**
3. Integrar pantalla de confirmación/firma Privy y enrolar cuentas de prueba. Las wallets antiguas siguen sin verificar.
4. Integrar #17/#19 respetando el orden de la pila de Franco; después probar tx/keys con esas cuentas. tx_stores ya se aplicó anteriormente, no repetirla a ciegas.

El chequeo opcional del header Origin no sustituye la prueba de firma; no se añadió como dependencia para clientes no navegador. Los esquemas públicos quedan iguales en API/app; se actualizó el estilo Zod de las filas internas de persistencia.
