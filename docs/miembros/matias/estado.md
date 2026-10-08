# Estado · Matías

**Última actualización:** 2026-10-08

## En qué estoy
Cliente autenticado de API en feat/api-session-client, con 14 pruebas aprobadas. Migración tx_stores de Franco aplicada en Supabase y restricciones verificadas. PRs anteriores de wallet, guard y login ya integrados.

## Próximo paso
Alta segura de app_user y wallet, /records y URLs de carga, validación QR; después conexión a pantallas de Maxi. En /records usar records.id (UUID minúsculo) como storage_ref. Coordinar binding de identidad con Franco antes del smoke completo.

## Pendientes de integración
PRs API #17, #18, #19 y #20 siguen pendientes de merge; mantener orden. La migración #20 ya fue aplicada manualmente: reconciliar historial antes de usar db push. Privy real y smoke app/API/Supabase/devnet aún no verificados.

## Observaciones para Franco y Rodrigo
El binding inicial de #19 escribe wallet_pubkey antes de demostrar propiedad mediante firma; requiere corrección aunque se agregue enrolamiento formal. Los links de demo/app.js apuntan a firmas aleatorias simuladas y no prueban operaciones on-chain. El test del programa en devnet no cubre los endpoints faltantes ni la app completa.
