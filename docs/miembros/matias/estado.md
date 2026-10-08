# Estado · Matías

**Última actualización:** 2026-10-08

## En qué estoy
Backend de enrolamiento en feat/wallet-enrollment: perfil paciente seguro, desafío temporal y verificación Ed25519 con persistencia atómica. Contrato en app feat/wallet-enrollment-contract. Records sigue en API #21 y app #9 para revisión; no se mezcla su implementación con esta rama.

## Validación
Enrolamiento: 73 tests API (33 nuevos), build y lint aprobados; SQL en PostgreSQL local y prueba real de dos conexiones reclamando la misma wallet con un único éxito. No se aplicó la migración a Supabase. Los 70 tests de records corresponden a su rama separada, no se suman como una suite integrada.

## Próximo paso
Revisar contrato de enrolamiento con Franco, eliminar su binding inicial sin prueba y exigir wallet_verified_at al autorizar wallets. Luego integrar la firma de mensajes en Privy mediante acción explícita del usuario; firma de transacciones después. Records → tx e indexer siguen pendientes de integración.

## Bloqueos y límites
La nueva API requiere migración wallet_enrollment y WALLET_ENROLLMENT_ORIGIN. Duplicados históricos de wallet bloquean la migración: no corregir automáticamente. Guard de dominio y módulos de Franco permanecen sin cambios, por lo que el enrolamiento por sí solo no corrige #19. Pendientes firma Privy real y smoke E2E. tx_stores ya aplicada; IV/pending_chain y enrolamiento todavía solo probados localmente.
