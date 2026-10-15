# Plan de integración · Matías · 2026-10-08

Base: `docs/tareas/matias.md`, staging de los repos y revisión de los módulos presentes. Cada entrega va en rama propia y PR; no se cambia código de Franco ni pantallas de Maxi.

## 1. Preparación de estudios y Storage (en revisión)

- Código temporal emitido por el paciente autenticado (2 minutos).
- URL firmada para carga inmutable en bucket privado, ruta opaca por organización.
- Registro por médico verificado, validación de tamaño/hash del archivo cargado, DEK envuelta con `KeyCryptoService`, conservación del IV de AES-GCM.
- Listado del paciente mediante su cliente RLS; sin DEK, llaves envueltas ni rutas internas en la respuesta.
- UUID del registro como `storage_ref`, estado `pending_chain` hasta confirmación real.
- Esquemas Zod idénticos en API y app. Pruebas de permisos, alteración, vencimiento y errores.

**Límite de esta entrega:** `POST /records` devuelve `build_request`, no una transacción armada. El módulo `tx` todavía no exporta su servicio. Esto es una propuesta de integración por etapas; no reemplaza el contrato final del plan del equipo.

**Antes de desplegar:** revisar/aplicar `20261009000000_record_encryption_iv.sql`, configurar `RECORDS_TOKEN_SECRET` (32 bytes aleatorios en hex, compartido entre réplicas) y bucket privado con límite de 52428816 bytes. Sin políticas que permitan al cliente escribir, reemplazar o borrar objetos directamente. Migración IV preparada, todavía NO aplicada al Supabase compartido.

**Franco:** acordar una entrada interna de `TxService` y exigir, antes de cofirmar `issue_record`, que el usuario/médico, paciente, hash y UUID correspondan al registro autorizado persistido. El endpoint público `/tx/build` no debe permitir saltar esta comprobación. Corregir el binding inicial de wallet de #19: comparar un texto no acredita propiedad.

**Maxi:** conservar `iv` de `encryptFile`, exportar la DEK solo para el POST autenticado, usar el cliente API de app #7 y los esquemas de `lib/schemas/records.ts`. No mandar Bearer a Storage. Mantener “pendiente” hasta una confirmación real.

## 2. Identidad y firma

- Alta segura de `app_user` sin permitir elegir rol/organización privilegiados.
- Enrolar wallet con prueba verificable (firma con desafío ligado a usuario, origen y vencimiento, o vínculo de Privy verificado en servidor).
- Función de firma en la plomería de Privy y conexión con build/submit autenticados.
- Integrar emisión con Franco; nunca considerar el registro local prueba de emisión en Solana.

Aceptación: no se puede vincular una wallet ajena y el médico firma una transacción de devnet con el fee payer del backend. Esta validación es requisito antes de habilitar cargas reales con el binding actual de #19.

## 3. Solicitudes y auditoría

- Crear/listar solicitudes de acceso; validar paciente y médico, no confiar en organización enviada por cliente.
- Indexar eventos confirmados, vincular PDA/record_id al UUID y mostrar estados reales; tratamiento idempotente de reintentos.
- Auditoría del paciente: eventos on-chain y entregas de claves locales, con aislamiento de clínicas.
- Acordar metadatos visibles (tipo/fecha/origen) dentro de un sobre cifrado: no agregar información médica en claro para resolver etiquetas de UI.

Aceptación: paciente ve su solicitud y la auditoría correspondiente; otra clínica no puede leer datos ajenos.

## 4. Recorrido de demostración

- Con Maxi: login → wallet → código paciente → cifrado/carga → firma/emisión → listado → solicitud → permiso → visor → revocación.
- Con Franco: rechazo sin permiso, con permiso vencido/revocado y ante fallo de auditoría de terceros.
- Con Rodrigo: explorer links solamente para firmas reales; identificar claramente el modo simulado.
- Usar datos sintéticos y guardar evidencia de transacciones reales y pruebas negativas.

## Estado previo conservado

- `tx_stores` de API #20 aplicada y verificada en Supabase el 8/10; documentada en docs #25. No existe historial de Supabase CLI: reconciliar antes de `db push`.
- Cliente HTTP autenticado en app #7: 14 pruebas aprobadas. PR separado, pendiente de revisión.
- Los PRs API #17 → #18 → #19 → #20 requieren integración en orden y revisión del binding. No fueron mergeados por este trabajo.

## Límites operativos de la entrega 1

- Código QR reutilizable durante sus 2 minutos; cada reserva es para un único UUID y la inserción duplicada devuelve 409. La reserva de registro dura 10 minutos. El token de Storage tiene su propio vencimiento del proveedor (no se presenta como si durara 10 minutos).
- No se descifra el documento en el backend. Se comprueba el hash del ciphertext y se envuelve la DEK; el visor verifica hash y autenticación GCM al abrirlo.
- No se implementó limpieza de cargas abandonadas ni reanudación automática después de perder una respuesta de registro. No reintentar mutaciones automáticamente; coordinar consulta/reanudación con integración de tx.
- El límite de archivos es 50 MiB de contenido más 16 bytes de tag GCM. La API descarga ciphertext para validar el hash; medir concurrencia/memoria antes de exposición pública.
